import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseArchiveProduct, firebaseGetProduct, firebaseUpdateProduct } from "@/lib/firebase-store";

const productUpdateSchema = z.object({
  title: z.string().min(10).optional(),
  price: z.coerce.number().int().min(10000).optional(),
  rank: z.string().optional(),
  level: z.string().optional(),
  server: z.string().optional(),
  platform: z.string().optional(),
  bindInfo: z.string().min(5).optional(),
  description: z.string().min(30).optional(),
  securityNote: z.string().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (isFirebaseBackend()) {
      const product = await firebaseGetProduct(id);
      if (!product) throw new Error("Produk tidak ditemukan.");
      return ok({ product });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        game: true,
        seller: { include: { sellerProfile: true } },
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        reviews: { include: { buyer: true }, take: 10 },
      },
    });
    if (!product) throw new Error("Produk tidak ditemukan.");
    return ok({ product });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = await parseJson(request, productUpdateSchema);
    if (isFirebaseBackend()) {
      const updated = await firebaseUpdateProduct(user, id, input);
      return ok({ product: updated, message: "Produk berhasil diperbarui." });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Produk tidak ditemukan.");
    if (product.sellerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: input.title,
        price: input.price,
        rank: input.rank,
        level: input.level,
        server: input.server,
        platform: input.platform,
        bindInfo: input.bindInfo,
        description: input.description,
        securityNote: input.securityNote,
      },
    });
    return ok({ product: updated, message: "Produk berhasil diperbarui." });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    if (isFirebaseBackend()) {
      await firebaseArchiveProduct(user, id);
      return ok({ message: "Produk berhasil diarsipkan." });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Produk tidak ditemukan.");
    if (product.sellerId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new Response("Forbidden", { status: 403 });
    }
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    return ok({ message: "Produk berhasil diarsipkan." });
  } catch (error) {
    return apiError(error);
  }
}
