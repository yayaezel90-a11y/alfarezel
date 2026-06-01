import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseAddWishlist, firebaseListWishlist, firebaseRemoveWishlist } from "@/lib/firebase-store";

const wishlistSchema = z.object({ productId: z.string().min(1) });

export async function GET() {
  try {
    const user = await requireUser();
    if (isFirebaseBackend()) {
      const wishlists = await firebaseListWishlist(user);
      return ok({ wishlists });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: { include: { game: true, images: { take: 1 } } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ wishlists });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, wishlistSchema);
    if (isFirebaseBackend()) {
      const wishlist = await firebaseAddWishlist(user, input.productId);
      return ok({ wishlist, message: "Produk masuk wishlist." });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: user.id, productId: input.productId } },
      update: {},
      create: { userId: user.id, productId: input.productId },
    });
    return ok({ wishlist, message: "Produk masuk wishlist." });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, wishlistSchema);
    if (isFirebaseBackend()) {
      await firebaseRemoveWishlist(user, input.productId);
      return ok({ message: "Produk dihapus dari wishlist." });
    }

    await prisma.wishlist.delete({
      where: { userId_productId: { userId: user.id, productId: input.productId } },
    });
    return ok({ message: "Produk dihapus dari wishlist." });
  } catch (error) {
    return apiError(error);
  }
}
