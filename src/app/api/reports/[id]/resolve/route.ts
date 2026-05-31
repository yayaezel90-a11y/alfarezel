import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refundBuyer, releaseEscrow } from "@/lib/wallet";

const resolveSchema = z.object({
  decision: z.enum(["refund_buyer", "release_seller", "close", "request_buyer_evidence", "request_seller_evidence"]),
  resolution: z.string().min(5),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, resolveSchema);
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new Error("Report tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      if (input.decision === "refund_buyer" && report.orderId) {
        await refundBuyer(tx, { orderId: report.orderId, adminId: admin.id, reason: input.resolution });
      }
      if (input.decision === "release_seller" && report.orderId) {
        await releaseEscrow(tx, { orderId: report.orderId, actorId: admin.id, actorRole: admin.role });
      }
      await tx.report.update({
        where: { id },
        data: {
          status:
            input.decision === "request_buyer_evidence"
              ? "WAITING_BUYER_EVIDENCE"
              : input.decision === "request_seller_evidence"
                ? "WAITING_SELLER_EVIDENCE"
                : "RESOLVED",
          assignedAdminId: admin.id,
          resolution: input.resolution,
          closedAt: input.decision.startsWith("request") ? undefined : new Date(),
        },
      });
      await tx.adminLog.create({
        data: {
          actorId: admin.id,
          action: "RESOLVE_REPORT",
          entity: "reports",
          entityId: id,
          metadata: input,
        },
      });
    });

    return ok({ message: "Keputusan report sudah disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
