import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/invoice";
import { productSchema } from "@/lib/validators";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateProduct, firebaseListProducts } from "@/lib/firebase-store";

export async function GET(request: Request) {
  try {
    if (isFirebaseBackend()) {
      const url = new URL(request.url);
      const products = await firebaseListProducts(url.searchParams);
      return ok({ products });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? undefined;
    const game = url.searchParams.get("game") ?? undefined;
    const status = url.searchParams.get("status") ?? "READY";
    const min = url.searchParams.get("min");
    const max = url.searchParams.get("max");
    const verified = url.searchParams.get("verified") === "true";
    const sort = url.searchParams.get("sort") ?? "newest";

    const products = await prisma.product.findMany({
      where: {
        status: status === "all" ? undefined : (status as never),
        title: query ? { contains: query, mode: "insensitive" } : undefined,
        game: game ? { slug: game } : undefined,
        price: {
          gte: min ? Number(min) : undefined,
          lte: max ? Number(max) : undefined,
        },
        seller: verified ? { sellerProfile: { isVerified: true } } : undefined,
      },
      include: {
        game: true,
        seller: { include: { sellerProfile: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy:
        sort === "cheapest"
          ? { price: "asc" }
          : sort === "expensive"
            ? { price: "desc" }
            : sort === "best-selling"
              ? { soldCount: "desc" }
              : { createdAt: "desc" },
      take: 48,
    });

    return ok({ products });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["SELLER", "ADMIN", "SUPER_ADMIN"]);
    const input = await parseJson(request, productSchema);
    if (isFirebaseBackend()) {
      const product = await firebaseCreateProduct(user, input);
      return ok(
        {
          product,
          message:
            product.status === "PENDING_REVIEW"
              ? "Produk berhasil dikirim. Tunggu admin review sebelum tayang."
              : "Produk berhasil tayang.",
        },
        201,
      );
    }

    const game = await prisma.game.findFirst({
      where: input.gameId ? { id: input.gameId } : { slug: input.gameSlug },
    });
    if (!game) throw new Error("Game tidak ditemukan.");
    const reviewMode = await prisma.platformSetting.findUnique({ where: { key: "product_review_mode" } });
    const baseSlug = slugify(input.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        sellerId: user.id,
        gameId: game.id,
        title: input.title,
        slug,
        price: input.price,
        rank: input.rank,
        level: input.level,
        server: input.server,
        platform: input.platform,
        bindInfo: input.bindInfo,
        description: input.description,
        securityNote: input.securityNote,
        status: reviewMode?.value === "off" || user.role !== "SELLER" ? "READY" : "PENDING_REVIEW",
        images: {
          create: input.images.map((url, index) => ({
            url,
            sortOrder: index,
            alt: `${input.title} screenshot ${index + 1}`,
          })),
        },
        attributes: {
          create: Object.entries(input.attributes ?? {}).map(([key, value]) => ({ key, value })),
        },
      },
    });

    return ok(
      {
        product,
        message:
          product.status === "PENDING_REVIEW"
            ? "Produk berhasil dikirim. Tunggu admin review sebelum tayang."
            : "Produk berhasil tayang.",
      },
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
