import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWalletLog } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseApproveWithdraw } from "@/lib/firebase-store";

const approveSchema = z.object({
  proofImage: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, approveSchema);
    if (isFirebaseBackend()) {
      await firebaseApproveWithdraw(id, admin, input.adminNote, input.proofImage);
      return ok({ message: "Withdraw berhasil di-approve." });
    }

    const withdraw = await prisma.$transaction(async (tx) => {
      const wd = await tx.withdrawRequest.findUnique({ where: { id } });
      if (!wd) throw new Error("Request withdraw tidak ditemukan.");
      if (wd.status === "SUCCESS") throw new Error("Withdraw ini sudah berhasil.");
      const wallet = await tx.wallet.findUnique({ where: { userId: wd.sellerId } });
      if (!wallet || wallet.balanceAvailable < wd.amount) throw new Error("Saldo seller tidak cukup.");
      const before = wallet.balanceAvailable;
      const after = before - wd.amount;
      await tx.wallet.update({ where: { userId: wd.sellerId }, data: { balanceAvailable: after } });
      await createWalletLog(tx, {
        userId: wd.sellerId,
        type: "WITHDRAW",
        amount: -wd.amount,
        fee: wd.fee,
        referenceId: wd.invoiceId,
        description: `Withdraw ${wd.invoiceId} berhasil diproses admin.`,
        balanceBefore: before,
        balanceAfter: after,
      });
      await tx.notification.create({
        data: {
          userId: wd.sellerId,
          type: "WITHDRAW_SUCCESS",
          title: "Withdraw berhasil",
          body: "Dana withdraw sudah diproses admin. Cek bukti transfer di riwayat withdraw.",
        },
      });
      await tx.adminLog.create({
        data: {
          actorId: admin.id,
          action: "APPROVE_WITHDRAW",
          entity: "withdraw_requests",
          entityId: wd.id,
          metadata: { invoiceId: wd.invoiceId, proofImage: input.proofImage },
        },
      });
      return tx.withdrawRequest.update({
        where: { id },
        data: {
          status: "SUCCESS",
          proofImage: input.proofImage,
          adminNote: input.adminNote,
          approvedBy: admin.id,
          approvedAt: new Date(),
        },
      });
    });

    return ok({ withdraw, message: "Withdraw berhasil di-approve." });
  } catch (error) {
    return apiError(error);
  }
}
