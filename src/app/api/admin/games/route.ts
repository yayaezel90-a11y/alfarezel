import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateGameCategory } from "@/lib/firebase-store";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  banner: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Game category admin aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseCreateGameCategory(admin, input);
    return ok({ message: "Kategori game berhasil disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
