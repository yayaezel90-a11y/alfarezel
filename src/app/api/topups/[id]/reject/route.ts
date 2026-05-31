import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { topupDecisionSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, topupDecisionSchema);
    const topup = await prisma.topupRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNote: input.adminNote ?? "Bukti transfer belum valid.",
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    });
    await prisma.notification.create({
      data: {
        userId: topup.userId,
        type: "TOPUP_REJECTED",
        title: "Top up ditolak",
        body: input.adminNote ?? "Bukti transfer belum valid. Cek ulang lalu kirim lagi ya.",
      },
    });
    await prisma.adminLog.create({
      data: {
        actorId: admin.id,
        action: "REJECT_TOPUP",
        entity: "topup_requests",
        entityId: id,
        metadata: { invoiceId: topup.invoiceId, note: input.adminNote },
      },
    });
    return ok({ topup, message: "Top up ditolak dengan catatan admin." });
  } catch (error) {
    return apiError(error);
  }
}
