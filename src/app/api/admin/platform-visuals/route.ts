import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseUpdatePlatformVisuals } from "@/lib/firebase-store";

const schema = z.object({
  dashboardImage: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Pengaturan visual platform aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseUpdatePlatformVisuals(admin, input);
    return ok({ message: "Visual dashboard berhasil disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
