import { ok, apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseHealthCheck } from "@/lib/firebase-store";

export async function GET() {
  try {
    if (isFirebaseBackend()) {
      await firebaseHealthCheck();
      return ok({ status: "ok", database: "firebase-firestore", timestamp: new Date().toISOString() });
    }

    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    return apiError(error);
  }
}
