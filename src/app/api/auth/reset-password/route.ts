import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, resetSchema);
    const resetToken = process.env.RESET_PASSWORD_TOKEN;
    if (!resetToken || input.token !== resetToken) throw new Error("Token reset tidak valid atau sudah kedaluwarsa.");
    const passwordHash = await hashPassword(input.password);
    await prisma.user.update({
      where: { email: input.email },
      data: { passwordHash, mustChangePassword: false },
    });
    return ok({ message: "Password berhasil direset. Silakan login lagi." });
  } catch (error) {
    return apiError(error);
  }
}
