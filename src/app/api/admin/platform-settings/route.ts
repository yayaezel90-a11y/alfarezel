import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseUpdatePlatformSetting } from "@/lib/firebase-store";

const schema = z.object({
  key: z.string().min(2),
  value: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Platform settings admin aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseUpdatePlatformSetting(admin, input);
    return ok({ message: "Pengaturan platform berhasil disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
