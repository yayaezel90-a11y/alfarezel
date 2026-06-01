import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseUpdateSellerPhoto } from "@/lib/firebase-store";

const schema = z.object({
  storeAvatar: z.string().url().optional(),
  storeBanner: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const seller = await requireRole(["SELLER", "ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Pengaturan foto toko aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseUpdateSellerPhoto(seller, input);
    return ok({ message: "Foto toko berhasil diperbarui." });
  } catch (error) {
    return apiError(error);
  }
}
