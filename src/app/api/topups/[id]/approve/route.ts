import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { topupDecisionSchema } from "@/lib/validators";
import { approveTopup } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseApproveTopup } from "@/lib/firebase-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, topupDecisionSchema);
    if (isFirebaseBackend()) {
      const topup = await firebaseApproveTopup(id, admin, input.adminNote);
      return ok({ topup, message: "Top up di-approve dan saldo user sudah ditambahkan." });
    }

    const topup = await prisma.$transaction((tx) =>
      approveTopup(tx, { topupId: id, adminId: admin.id, adminNote: input.adminNote }),
    );
    return ok({ topup, message: "Top up di-approve dan saldo user sudah ditambahkan." });
  } catch (error) {
    return apiError(error);
  }
}
