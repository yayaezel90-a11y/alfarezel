import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const holdSchema = z.object({ reason: z.string().min(5) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, holdSchema);
    const order = await prisma.order.update({
      where: { id },
      data: { status: "ADMIN_HOLD", escrowStatus: "ADMIN_HOLD" },
    });
    await prisma.adminLog.create({
      data: {
        actorId: admin.id,
        action: "HOLD_ORDER",
        entity: "orders",
        entityId: id,
        metadata: { reason: input.reason },
      },
    });
    return ok({ order, message: "Dana transaksi ditahan admin." });
  } catch (error) {
    return apiError(error);
  }
}
