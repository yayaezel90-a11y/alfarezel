import { ok, apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    return apiError(error);
  }
}
