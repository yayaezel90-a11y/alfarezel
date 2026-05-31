import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  decision: z.enum(["approve", "reject", "hide", "feature"]),
  note: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, reviewSchema);
    const status =
      input.decision === "approve"
        ? "READY"
        : input.decision === "reject"
          ? "REJECTED"
          : input.decision === "hide"
            ? "HIDDEN"
            : undefined;

    const product = await prisma.product.update({
      where: { id },
      data: {
        status,
        isFeatured: input.decision === "feature" ? true : undefined,
      },
    });

    await prisma.adminLog.create({
      data: {
        actorId: admin.id,
        action: `PRODUCT_${input.decision.toUpperCase()}`,
        entity: "products",
        entityId: id,
        metadata: { note: input.note },
      },
    });

    return ok({ product, message: "Keputusan produk sudah disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
