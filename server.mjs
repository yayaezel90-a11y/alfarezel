import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const useFirebase = process.env.DATA_BACKEND?.toLowerCase() === "firebase";
const prisma = useFirebase ? null : new PrismaClient();

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

function normalizePrivateKey(value) {
  return value?.replace(/\\n/g, "\n");
}

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const parsed = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"));
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    };
  }
  return null;
}

function firestore() {
  const existing = getApps()[0];
  if (!existing) {
    const serviceAccount = readServiceAccount();
    if (serviceAccount?.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.projectId });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
    } else {
      throw new Error("Firebase belum dikonfigurasi.");
    }
  }
  return getFirestore();
}

async function getSocketUser(socket) {
  const cookies = parseCookie(socket.handshake.headers.cookie);
  const token = cookies.alfarezel_session;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-me");
    const verified = await jwtVerify(token, secret);
    if (!verified.payload.sub) return null;
    if (useFirebase) {
      const snapshot = await firestore().collection("users").doc(verified.payload.sub).get();
      if (!snapshot.exists) return null;
      const user = { id: snapshot.id, ...snapshot.data() };
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      };
    }
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
  if (useFirebase) {
    const db = firestore();
    const byId = await db.collection("orders").doc(orderRef).get();
    const snapshot = byId.exists
      ? byId
      : (await db.collection("orders").where("invoiceId", "==", orderRef).limit(1).get()).docs[0];
    if (!snapshot?.exists) return null;
    const order = { id: snapshot.id, ...snapshot.data() };
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && order.buyerId !== user.id && order.sellerId !== user.id) {
      return null;
    }
    const chat = await db.collection("order_chats").doc(order.chatId).get();
    return { ...order, chat: chat.exists ? { id: chat.id, ...chat.data() } : null };
  }

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

async function createFirebaseMessage(order, user, body, attachments = []) {
  const db = firestore();
  const createdAt = new Date().toISOString();
  const message = {
    chatId: order.chatId,
    orderId: order.id,
    senderId: user.id,
    sender: { username: user.username, role: user.role, avatar: user.avatar },
    type: user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "ADMIN" : "USER",
    body: String(body),
    attachments,
    createdAt,
  };
  const ref = await db.collection("chat_messages").add(message);
  return { id: ref.id, ...message };
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

        const message = useFirebase
          ? await createFirebaseMessage(order, socket.data.user, body, attachments)
          : await prisma.chatMessage.create({
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
          const warning = useFirebase
            ? await firestore().collection("chat_messages").add({
                chatId: order.chatId,
                orderId: order.id,
                type: "SYSTEM",
                body: "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
                createdAt: new Date().toISOString(),
              }).then(async (ref) => ({ id: ref.id, ...(await ref.get()).data() }))
            : await prisma.chatMessage.create({
                data: {
                  chatId: order.chat.id,
                  type: "SYSTEM",
                  body: "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
                },
              });
          if (useFirebase) {
            await firestore().collection("security_flags").add({
              userId: socket.data.user.id,
              type: "SUSPICIOUS_CHAT",
              value: String(body).slice(0, 180),
              reason: "Chat mengandung ajakan transaksi di luar platform.",
              severity: 3,
              createdAt: new Date().toISOString(),
            });
          } else {
            await prisma.securityFlag.create({
              data: {
                userId: socket.data.user.id,
                type: "SUSPICIOUS_CHAT",
                value: String(body).slice(0, 180),
                reason: "Chat mengandung ajakan transaksi di luar platform.",
                severity: 3,
              },
            });
          }
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
