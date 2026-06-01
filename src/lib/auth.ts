import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseGetSessionUser } from "@/lib/firebase-store";

const cookieName = "alfarezel_session";
const encoder = new TextEncoder();

function jwtSecret() {
  const secret = process.env.JWT_SECRET ?? "development-only-change-me";
  return encoder.encode(secret);
}

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: string;
  mustChangePassword: boolean;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, jwtSecret());
    const id = verified.payload.sub;
    if (!id) return null;

    const user = isFirebaseBackend()
      ? await firebaseGetSessionUser(id)
      : await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            mustChangePassword: true,
          },
        });
    if (!user || user.status !== "ACTIVE") return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requestMeta() {
  const headerStore = await headers();
  return {
    ip: headerStore.get("x-forwarded-for")?.split(",")[0] ?? "local",
    userAgent: headerStore.get("user-agent") ?? "unknown",
  };
}
