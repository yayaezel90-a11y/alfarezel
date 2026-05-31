import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, reviewSchema);
    const order = await prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new Error("Order tidak ditemukan.");
    if (order.buyerId !== user.id) throw new Response("Forbidden", { status: 403 });
    if (order.status !== "COMPLETED") throw new Error("Review hanya bisa dibuat setelah transaksi selesai.");

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        productId: order.productId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        rating: input.rating,
        body: input.body,
        proofUrl: input.proofUrl,
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { sellerId: order.sellerId },
      _avg: { rating: true },
    });
    await prisma.sellerProfile.update({
      where: { userId: order.sellerId },
      data: { rating: aggregate._avg.rating ?? input.rating },
    });

    return ok({ review, message: "Review berhasil dikirim. Makasih sudah bantu buyer lain." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
