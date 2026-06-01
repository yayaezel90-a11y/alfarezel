import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseUpdateUserAvatar } from "@/lib/firebase-store";

const schema = z.object({ avatarUrl: z.string().url() });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!isFirebaseBackend()) throw new Error("Pengaturan foto akun aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseUpdateUserAvatar(user, input.avatarUrl);
    return ok({ message: "Foto akun berhasil diperbarui." });
  } catch (error) {
    return apiError(error);
  }
}
