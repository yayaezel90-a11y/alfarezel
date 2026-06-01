import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/secure-data";
import { accountDataSchema } from "@/lib/validators";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseSubmitAccountData } from "@/lib/firebase-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = await parseJson(request, accountDataSchema);
    if (isFirebaseBackend()) {
      await firebaseSubmitAccountData(user, id, {
        accountData: encryptSecret(input.accountData),
        note: input.note,
      });
      return ok({ message: "Data akun berhasil dikirim dengan aman." });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { chat: true } });
    if (!order) throw new Error("Order tidak ditemukan.");
    if (order.sellerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        accountDataCipher: encryptSecret(input.accountData),
        accountDataNote: input.note,
        status: "ACCOUNT_SENT",
        sellerSubmittedAt: new Date(),
      },
    });

    if (order.chat) {
      await prisma.chatMessage.createMany({
        data: [
          { chatId: order.chat.id, senderId: user.id, type: "SECURE_ACCOUNT_DATA", body: "Data akun telah dikirim lewat penyimpanan aman." },
          { chatId: order.chat.id, type: "SYSTEM", body: "Data akun telah dikirim." },
          { chatId: order.chat.id, type: "SYSTEM", body: "Pastikan data akun sudah sesuai sebelum transaksi selesai." },
        ],
      });
    }

    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "ACCOUNT_DATA_SENT",
        title: "Seller kirim data akun",
        body: "Cek chat transaksi dan verifikasi akun sebelum konfirmasi selesai.",
      },
    });

    return ok({ order: updated, message: "Data akun berhasil dikirim dengan aman." });
  } catch (error) {
    return apiError(error);
  }
}
