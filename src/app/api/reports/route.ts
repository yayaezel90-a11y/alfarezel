import { ok, apiError, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validators";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseCreateReport, firebaseListReports } from "@/lib/firebase-store";

export async function GET() {
  try {
    const user = await requireUser();
    if (isFirebaseBackend()) {
      const reports = await firebaseListReports(user);
      return ok({ reports });
    }

    const reports = await prisma.report.findMany({
      where: ["ADMIN", "SUPER_ADMIN"].includes(user.role)
        ? undefined
        : {
            OR: [{ reporterId: user.id }, { reportedUserId: user.id }],
          },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        reporter: { select: { username: true } },
        reportedUser: { select: { username: true } },
        order: { select: { invoiceId: true, status: true } },
        product: { select: { title: true } },
      },
    });
    return ok({ reports });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(request, reportSchema);
    if (isFirebaseBackend()) {
      const report = await firebaseCreateReport(user, input);
      return ok({ report, message: "Report berhasil dikirim. Admin akan bantu cek." }, 201);
    }

    const order = input.orderId
      ? await prisma.order.findFirst({ where: { OR: [{ id: input.orderId }, { invoiceId: input.orderId }] }, include: { chat: true } })
      : null;
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedUserId: input.reportedUserId,
        orderId: order?.id,
        productId: input.productId,
        type: input.type,
        reason: input.reason,
        description: input.description,
        priority: input.reason.toLowerCase().includes("scam") ? 3 : 2,
        messages: input.proofUrl
          ? {
              create: {
                senderId: user.id,
                body: input.description,
                proofUrl: input.proofUrl,
              },
            }
          : undefined,
      },
    });

    if (order) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "DISPUTED", escrowStatus: "ADMIN_HOLD" },
        include: { chat: true },
      });
      if (updatedOrder.chat) {
        await prisma.chatMessage.createMany({
          data: [
            { chatId: updatedOrder.chat.id, type: "SYSTEM", body: "Buyer membuka report." },
            { chatId: updatedOrder.chat.id, type: "SYSTEM", body: "Admin bergabung ke chat sebagai mediator jika diperlukan." },
          ],
        });
      }
    }

    return ok({ report, message: "Report berhasil dikirim. Admin akan bantu cek." }, 201);
  } catch (error) {
    return apiError(error);
  }
}
