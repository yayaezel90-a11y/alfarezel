import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseUpdateFeeSetting } from "@/lib/firebase-store";

const schema = z.object({
  kind: z.enum(["TOPUP", "WITHDRAW", "PLATFORM"]),
  percentage: z.coerce.number().min(0).max(100),
  fixedFee: z.coerce.number().int().min(0),
  minAmount: z.coerce.number().int().min(0).optional(),
  maxAmount: z.coerce.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!isFirebaseBackend()) throw new Error("Fee settings admin aktif di mode Firebase.");
    const input = await parseJson(request, schema);
    await firebaseUpdateFeeSetting(admin, input);
    return ok({ message: "Fee berhasil disimpan." });
  } catch (error) {
    return apiError(error);
  }
}
