import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { createInvoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { withdrawSchema } from "@/lib/validators";
import { calculateFee } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateWithdraw, firebaseListWithdraws } from "@/lib/firebase-store";

export async function GET() {
  try {
    const user = await requireRole(["SELLER", "ADMIN", "SUPER_ADMIN"]);
    if (isFirebaseBackend()) {
      const withdraws = await firebaseListWithdraws(user);
      return ok({ withdraws });
    }

    const withdraws = await prisma.withdrawRequest.findMany({
      where: ["ADMIN", "SUPER_ADMIN"].includes(user.role) ? undefined : { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { username: true, sellerProfile: true } } },
      take: 100,
    });
    return ok({ withdraws });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const seller = await requireRole(["SELLER", "ADMIN", "SUPER_ADMIN"]);
    const input = await parseJson(request, withdrawSchema);
    if (isFirebaseBackend()) {
      const withdraw = await firebaseCreateWithdraw(seller, input);
      return ok({ withdraw, message: "Withdraw berhasil diajukan." }, 201);
    }

    const withdraw = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: seller.id } });
      if (!wallet || wallet.balanceAvailable < input.amount) {
        throw new Error("Saldo penjualan tersedia belum cukup untuk withdraw.");
      }
      if (wallet.isLocked) throw new Error("Wallet sedang dikunci admin.");
      const fee = await calculateFee(tx, "WITHDRAW", input.amount);
      return tx.withdrawRequest.create({
        data: {
          invoiceId: createInvoice("WD"),
          sellerId: seller.id,
          amount: input.amount,
          fee,
          totalReceived: input.amount - fee,
          method: input.method,
          destinationNumber: input.destinationNumber,
          receiverName: input.receiverName,
          sellerNote: input.sellerNote,
        },
      });
    });

    return ok({ withdraw, message: "Withdraw berhasil diajukan." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
