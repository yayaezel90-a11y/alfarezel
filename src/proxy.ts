import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPrefixes = ["/dashboard", "/top-up", "/withdraw", "/report", "/chat", "/invoice"];

async function readRole(request: NextRequest) {
  const token = request.cookies.get("alfarezel_session")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "development-only-change-me");
    const verified = await jwtVerify(token, secret);
    return verified.payload.role as string | undefined;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const role = await readRole(request);
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard/admin") && !["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (pathname.startsWith("/dashboard/seller") && !["SELLER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
