import { createSession } from "@/lib/auth";
import { ok, apiError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, registerSchema);
    const passwordHash = await hashPassword(input.password);

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }],
      },
    });
    if (exists) throw new Error("Username atau email sudah dipakai.");

    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
        phone: input.phone,
        role: "BUYER",
        wallet: { create: {} },
        profile: { create: {} },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
      },
    });

    await createSession(user);
    return ok({ user, message: "Akun berhasil dibuat. Selamat datang di Alfarezel Market." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
