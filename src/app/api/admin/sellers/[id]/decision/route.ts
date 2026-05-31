import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject", "verify", "unverify", "suspend"]),
  note: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, decisionSchema);

    const status =
      input.decision === "approve" || input.decision === "verify"
        ? "APPROVED"
        : input.decision === "reject"
          ? "REJECTED"
          : input.decision === "suspend"
            ? "SUSPENDED"
            : undefined;

    const seller = await prisma.sellerProfile.update({
      where: { id },
      data: {
        status,
        isVerified: input.decision === "verify" ? true : input.decision === "unverify" ? false : undefined,
        internalNote: input.note,
        user:
          input.decision === "approve" || input.decision === "verify"
            ? { update: { role: "SELLER", status: "ACTIVE" } }
            : undefined,
      },
    });

    await prisma.adminLog.create({
      data: {
        actorId: admin.id,
        action: `SELLER_${input.decision.toUpperCase()}`,
        entity: "seller_profiles",
        entityId: id,
        metadata: { note: input.note },
      },
    });

    return ok({ seller, message: "Status seller berhasil diperbarui." });
  } catch (error) {
    return apiError(error);
  }
}
