import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createInvoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { topupSchema } from "@/lib/validators";
import { calculateFee } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateTopup, firebaseListTopups } from "@/lib/firebase-store";

export async function GET() {
  try {
    const user = await requireUser();
    if (isFirebaseBackend()) {
      const topups = await firebaseListTopups(user);
      return ok({ topups });
    }

    const topups = await prisma.topupRequest.findMany({
      where: ["ADMIN", "SUPER_ADMIN"].includes(user.role) ? undefined : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { username: true, email: true } } },
    });
    return ok({ topups });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, topupSchema);
    if (isFirebaseBackend()) {
      const topup = await firebaseCreateTopup(user, input);
      return ok({ topup, message: "Top up berhasil dikirim, tunggu admin cek ya." }, 201);
    }

    const topup = await prisma.$transaction(async (tx) => {
      const fee = await calculateFee(tx, "TOPUP", input.amount);
      const setting = await tx.platformSetting.findUnique({ where: { key: "admin_topup_number" } });
      return tx.topupRequest.create({
        data: {
          invoiceId: createInvoice("TOPUP"),
          userId: user.id,
          amount: input.amount,
          fee,
          totalTransfer: input.amount + fee,
          paymentMethod: input.paymentMethod,
          adminNumber: setting?.value ?? process.env.ADMIN_TOPUP_NUMBER ?? "087760337535",
          proofImage: input.proofImage,
          userNote: input.userNote,
          status: input.proofImage ? "WAITING_ADMIN_CONFIRMATION" : "WAITING_PAYMENT",
        },
      });
    });

    return ok(
      {
        topup,
        message: "Top up berhasil dikirim, tunggu admin cek ya.",
      },
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
