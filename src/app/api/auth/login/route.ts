import { ok, apiError, parseJson } from "@/lib/api";
import { createSession, requestMeta } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, loginSchema);
    const meta = await requestMeta();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: input.identifier }, { email: input.identifier }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        mustChangePassword: true,
      },
    });

    if (!user) throw new Error("Username/email atau password tidak cocok.");

    const valid = await verifyPassword(input.password, user.passwordHash);
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        success: valid,
        reason: valid ? null : "INVALID_PASSWORD",
      },
    });

    if (!valid) throw new Error("Username/email atau password tidak cocok.");
    if (user.status !== "ACTIVE") throw new Error("Akun sedang dibatasi. Hubungi admin.");

    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    };

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await createSession(sessionUser);

    return ok({
      user: sessionUser,
      message: user.mustChangePassword
        ? "Login berhasil. Demi keamanan, ganti password sementara kamu sekarang."
        : "Login berhasil.",
    });
  } catch (error) {
    return apiError(error);
  }
}
