import { ok, apiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const [
      totalUser,
      totalBuyer,
      totalSeller,
      sellerPending,
      totalProduct,
      pendingProduct,
      soldProduct,
      totalOrder,
      activeReport,
      totalTopup,
      totalWithdraw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.sellerProfile.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.product.count({ where: { status: "SOLD" } }),
      prisma.order.count(),
      prisma.report.count({ where: { status: { in: ["NEW", "REVIEWING", "WAITING_BUYER_EVIDENCE", "WAITING_SELLER_EVIDENCE"] } } }),
      prisma.topupRequest.aggregate({ _sum: { amount: true, fee: true }, where: { status: "SUCCESS" } }),
      prisma.withdrawRequest.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    ]);

    const gmv = await prisma.order.aggregate({ _sum: { totalPaid: true } });
    return ok({
      overview: {
        totalUser,
        totalBuyer,
        totalSeller,
        sellerPending,
        totalProduct,
        pendingProduct,
        soldProduct,
        totalOrder,
        totalGmv: gmv._sum.totalPaid ?? 0,
        totalTopup: totalTopup._sum.amount ?? 0,
        totalFeeTopup: totalTopup._sum.fee ?? 0,
        totalWithdraw: totalWithdraw._sum.amount ?? 0,
        activeReport,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
