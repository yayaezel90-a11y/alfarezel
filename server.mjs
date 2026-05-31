import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const suspiciousWords = ["transfer langsung", "di luar web", "wa aja bayar langsung", "bayar langsung", "luar platform"];

function parseCookie(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

async function getSocketUser(socket) {
  const cookies = parseCookie(socket.handshake.headers.cookie);
  const token = cookies.alfarezel_session;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-me");
    const verified = await jwtVerify(token, secret);
    if (!verified.payload.sub) return null;
    return prisma.user.findUnique({
      where: { id: verified.payload.sub },
      select: { id: true, username: true, role: true, status: true, avatar: true },
    });
  } catch {
    return null;
  }
}

function containsSuspiciousText(body) {
  const normalized = String(body).toLowerCase();
  return suspiciousWords.some((word) => normalized.includes(word));
}

async function findOrderForUser(orderRef, user) {
  const refs = [{ id: orderRef }, { invoiceId: orderRef }];
  const participants = [{ buyerId: user.id }, { sellerId: user.id }];
  return prisma.order.findFirst({
    where:
      user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? { OR: refs }
        : { OR: refs, AND: [{ OR: participants }] },
    include: { chat: true },
  });
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || true,
      credentials: true,
    },
  });

  io.use(async (socket, nextMiddleware) => {
    const user = await getSocketUser(socket);
    if (!user || user.status !== "ACTIVE") {
      nextMiddleware(new Error("Unauthorized"));
      return;
    }
    socket.data.user = user;
    nextMiddleware();
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", async ({ orderRef }, callback) => {
      try {
        const order = await findOrderForUser(orderRef, socket.data.user);
        if (!order?.chat) throw new Error("Chat transaksi tidak ditemukan.");
        socket.join(`order:${order.id}`);
        callback?.({ ok: true, orderId: order.id, invoiceId: order.invoiceId });
      } catch (error) {
        callback?.({ ok: false, error: error instanceof Error ? error.message : "Gagal join chat." });
      }
    });

    socket.on("chat:send", async ({ orderRef, body, attachments = [] }, callback) => {
      try {
        if (!body || String(body).trim().length === 0) throw new Error("Pesan tidak boleh kosong.");
        const order = await findOrderForUser(orderRef, socket.data.user);
        if (!order?.chat) throw new Error("Chat transaksi tidak ditemukan.");
        if (order.chat.isLocked) throw new Error("Chat transaksi sedang dikunci admin.");

        const message = await prisma.chatMessage.create({
          data: {
            chatId: order.chat.id,
            senderId: socket.data.user.id,
            type: socket.data.user.role === "ADMIN" || socket.data.user.role === "SUPER_ADMIN" ? "ADMIN" : "USER",
            body: String(body),
            attachments: {
              create: attachments.map((url) => ({ url })),
            },
          },
          include: {
            attachments: true,
            sender: { select: { username: true, role: true, avatar: true } },
          },
        });

        io.to(`order:${order.id}`).emit("chat:message", message);

        if (containsSuspiciousText(body)) {
          const warning = await prisma.chatMessage.create({
            data: {
              chatId: order.chat.id,
              type: "SYSTEM",
              body: "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
            },
          });
          await prisma.securityFlag.create({
            data: {
              userId: socket.data.user.id,
              type: "SUSPICIOUS_CHAT",
              value: String(body).slice(0, 180),
              reason: "Chat mengandung ajakan transaksi di luar platform.",
              severity: 3,
            },
          });
          io.to(`order:${order.id}`).emit("chat:message", warning);
        }

        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, error: error instanceof Error ? error.message : "Pesan gagal dikirim." });
      }
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Alfarezel Market ready on http://${hostname}:${port}`);
    console.log("Socket.io realtime chat enabled");
  });
});
