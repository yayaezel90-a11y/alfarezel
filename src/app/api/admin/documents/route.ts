import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateAdminDocument } from "@/lib/firebase-store";

const schema = z.object({
  collection: z.enum(["banners", "vouchers", "notifications"]),
  title: z.string().min(2),
  body: z.string().optional(),
  code: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Admin document aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    const { collection, ...payload } = input;
    const document = await firebaseCreateAdminDocument(admin, collection, payload);
    return ok({ document, message: "Data admin berhasil dibuat." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
