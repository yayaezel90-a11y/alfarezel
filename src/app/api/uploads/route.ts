import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { firebaseBucket, isFirebaseBackend } from "@/lib/firebase-admin";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(3),
  contentType: z.string().min(3),
  dataUrl: z.string().startsWith("data:"),
  folder: z.enum(["avatars", "banners", "products", "proofs", "chat"]).default("avatars"),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!isFirebaseBackend()) throw new Error("Upload production aktif di mode Firebase.");
    const input = await parseJson(request, uploadSchema);
    const [, payload] = input.dataUrl.split(",");
    if (!payload) throw new Error("File upload tidak valid.");

    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
    const path = `${input.folder}/${user.id}/${Date.now()}-${safeName}`;
    const file = firebaseBucket().file(path);
    await file.save(Buffer.from(payload, "base64"), {
      contentType: input.contentType,
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "01-01-2035",
    });
    return ok({ url, path, message: "Upload berhasil." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
