import { ok, apiError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    await request.json().catch(() => ({}));
    return ok({
      message:
        "Kalau email terdaftar, instruksi reset akan dikirim.",
    });
  } catch (error) {
    return apiError(error);
  }
}
