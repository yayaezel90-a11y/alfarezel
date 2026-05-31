import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const rejectSchema = z.object({ adminNote: z.string().min(5) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, rejectSchema);
    const withdraw = await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNote: input.adminNote,
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    });
    await prisma.adminLog.create({
      data: {
        actorId: admin.id,
        action: "REJECT_WITHDRAW",
        entity: "withdraw_requests",
        entityId: id,
        metadata: { invoiceId: withdraw.invoiceId, note: input.adminNote },
      },
    });
    return ok({ withdraw, message: "Withdraw ditolak dengan catatan admin." });
  } catch (error) {
    return apiError(error);
  }
}
