import { ok, apiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releaseEscrow } from "@/lib/wallet";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error("Order tidak ditemukan.");
    if (order.buyerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }
    const released = await prisma.$transaction((tx) =>
      releaseEscrow(tx, { orderId: id, actorId: user.id, actorRole: user.role }),
    );
    return ok({ order: released, message: "Transaksi selesai. Dana telah diteruskan ke seller." });
  } catch (error) {
    return apiError(error);
  }
}
