import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validators";
import { createOrderWithEscrow } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateOrderWithEscrow, firebaseListOrders } from "@/lib/firebase-store";

export async function GET() {
  try {
    const user = await requireUser();
    if (isFirebaseBackend()) {
      const orders = await firebaseListOrders(user);
      return ok({ orders });
    }

    const orders = await prisma.order.findMany({
      where: ["ADMIN", "SUPER_ADMIN"].includes(user.role)
        ? undefined
        : user.role === "SELLER"
          ? { sellerId: user.id }
          : { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { include: { game: true, images: { take: 1 } } },
        buyer: { select: { username: true } },
        seller: { select: { username: true, sellerProfile: true } },
      },
      take: 100,
    });
    return ok({ orders });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, orderSchema);
    if (isFirebaseBackend()) {
      const order = await firebaseCreateOrderWithEscrow(user, { productId: input.productId, productSlug: input.productSlug });
      return ok({ order, message: "Pesanan kamu lagi diproses." }, 201);
    }

    const order = await prisma.$transaction((tx) =>
      createOrderWithEscrow(tx, { buyerId: user.id, productId: input.productId, productSlug: input.productSlug }),
    );
    return ok({ order, message: "Pesanan kamu lagi diproses." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
