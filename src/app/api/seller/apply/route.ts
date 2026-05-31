import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { sellerApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, sellerApplicationSchema);
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (existing && existing.status !== "REJECTED") {
      throw new Error("Pengajuan seller kamu masih aktif atau sudah diterima.");
    }

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        storeName: input.storeName,
        slug: `${slugify(input.storeName)}-${Date.now().toString(36)}`,
        whatsapp: input.whatsapp,
        description: input.description,
        gamesSold: input.gamesSold,
        experience: input.experience,
        reason: input.reason,
        socialLink: input.socialLink,
        proofImage: input.proofImage,
        status: "PENDING_REVIEW",
      },
      create: {
        userId: user.id,
        storeName: input.storeName,
        slug: `${slugify(input.storeName)}-${Date.now().toString(36)}`,
        whatsapp: input.whatsapp,
        description: input.description,
        gamesSold: input.gamesSold,
        experience: input.experience,
        reason: input.reason,
        socialLink: input.socialLink,
        proofImage: input.proofImage,
        status: "PENDING_REVIEW",
      },
    });

    return ok({ profile, message: "Pengajuan seller berhasil dikirim. Tunggu admin review ya." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
