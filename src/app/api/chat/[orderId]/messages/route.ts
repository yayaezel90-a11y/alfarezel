import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validators";

const suspiciousWords = ["transfer langsung", "di luar web", "wa aja bayar langsung", "bayar langsung", "luar platform"];

function hasSuspiciousText(value: string) {
  const normalized = value.toLowerCase();
  return suspiciousWords.some((word) => normalized.includes(word));
}

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireUser();
    const { orderId } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { invoiceId: orderId }] },
      include: { chat: true },
    });
    if (!order?.chat) throw new Error("Chat transaksi tidak ditemukan.");
    if (order.buyerId !== user.id && order.sellerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId: order.chat.id },
      include: { sender: { select: { username: true, role: true, avatar: true } }, attachments: true },
      orderBy: { createdAt: "asc" },
    });
    return ok({ messages });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireUser();
    const { orderId } = await params;
    const input = await parseJson(request, chatMessageSchema);
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { invoiceId: orderId }] },
      include: { chat: true },
    });
    if (!order?.chat) throw new Error("Chat transaksi tidak ditemukan.");
    if (order.chat.isLocked) throw new Error("Chat transaksi sedang dikunci admin.");
    if (order.buyerId !== user.id && order.sellerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatId: order.chat.id,
        senderId: user.id,
        type: ["ADMIN", "SUPER_ADMIN"].includes(user.role) ? "ADMIN" : "USER",
        body: input.body,
        attachments: {
          create: input.attachments.map((url) => ({ url })),
        },
      },
      include: { attachments: true },
    });

    if (hasSuspiciousText(input.body)) {
      await prisma.chatMessage.create({
        data: {
          chatId: order.chat.id,
          type: "SYSTEM",
          body: "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
        },
      });
      await prisma.securityFlag.create({
        data: {
          userId: user.id,
          type: "SUSPICIOUS_CHAT",
          value: input.body.slice(0, 180),
          reason: "Chat mengandung ajakan transaksi di luar platform.",
          severity: 3,
        },
      });
    }

    return ok({ message, warning: hasSuspiciousText(input.body) });
  } catch (error) {
    return apiError(error);
  }
}
