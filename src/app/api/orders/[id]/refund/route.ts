import { z } from "zod";
import { ok, apiError, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refundBuyer } from "@/lib/wallet";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseRefundOrder } from "@/lib/firebase-store";

const refundSchema = z.object({ reason: z.string().min(10) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    const input = await parseJson(request, refundSchema);
    if (isFirebaseBackend()) {
      await firebaseRefundOrder(admin, id, input.reason);
      return ok({ message: "Refund buyer berhasil diproses." });
    }

    const order = await prisma.$transaction((tx) =>
      refundBuyer(tx, { orderId: id, adminId: admin.id, reason: input.reason }),
    );
    return ok({ order, message: "Refund buyer berhasil diproses." });
  } catch (error) {
    return apiError(error);
  }
}
