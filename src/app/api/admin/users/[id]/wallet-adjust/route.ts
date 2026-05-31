import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWalletLog } from "@/lib/wallet";

const adjustSchema = z.object({
  amount: z.coerce.number().int(),
  reason: z.string().min(10),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, adjustSchema);
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id },
      });
      const before = wallet.balanceAvailable;
      const after = before + input.amount;
      if (after < 0) throw new Error("Saldo tidak boleh negatif.");
      await tx.wallet.update({ where: { userId: id }, data: { balanceAvailable: after } });
      await createWalletLog(tx, {
        userId: id,
        type: "ADMIN_ADJUSTMENT",
        amount: input.amount,
        referenceId: `ADMIN-${Date.now()}`,
        description: input.reason,
        balanceBefore: before,
        balanceAfter: after,
      });
      await tx.adminLog.create({
        data: {
          actorId: admin.id,
          action: "ADJUST_WALLET",
          entity: "wallets",
          entityId: wallet.id,
          metadata: { targetUserId: id, amount: input.amount, reason: input.reason },
        },
      });
      return tx.wallet.findUnique({ where: { userId: id } });
    });

    return ok({ wallet: result, message: "Saldo user berhasil disesuaikan dengan audit log." });
  } catch (error) {
    return apiError(error);
  }
}
