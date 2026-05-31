import type { Prisma, UserRole } from "@prisma/client";
import { createInvoice } from "@/lib/invoice";

type Tx = Prisma.TransactionClient;

export async function calculateFee(tx: Tx, kind: "TOPUP" | "WITHDRAW" | "PLATFORM", amount: number) {
  const fee = await tx.feeSetting.findUnique({ where: { kind } });
  if (!fee || !fee.isActive) return 0;
  const percentageFee = Math.ceil((amount * fee.percentage) / 100);
  return percentageFee + fee.fixedFee;
}

export async function createWalletLog(
  tx: Tx,
  input: {
    userId: string;
    type: Prisma.WalletTransactionCreateInput["type"];
    amount: number;
    fee?: number;
    status?: Prisma.WalletTransactionCreateInput["status"];
    referenceId?: string;
    description: string;
    balanceBefore: number;
    balanceAfter: number;
  },
) {
  return tx.walletTransaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      fee: input.fee ?? 0,
      status: input.status ?? "SUCCESS",
      referenceId: input.referenceId,
      description: input.description,
      balanceBefore: input.balanceBefore,
      balanceAfter: input.balanceAfter,
    },
  });
}

export async function approveTopup(tx: Tx, input: { topupId: string; adminId: string; adminNote?: string }) {
  const topup = await tx.topupRequest.findUnique({ where: { id: input.topupId } });
  if (!topup) throw new Error("Request top up tidak ditemukan.");
  if (topup.status === "SUCCESS") throw new Error("Top up ini sudah berhasil.");

  const wallet = await tx.wallet.upsert({
    where: { userId: topup.userId },
    update: {},
    create: { userId: topup.userId },
  });

  const before = wallet.balanceAvailable;
  const after = before + topup.amount;

  await tx.wallet.update({
    where: { userId: topup.userId },
    data: { balanceAvailable: after },
  });

  await createWalletLog(tx, {
    userId: topup.userId,
    type: "TOP_UP",
    amount: topup.amount,
    fee: topup.fee,
    referenceId: topup.invoiceId,
    description: `Top up ${topup.invoiceId} berhasil diverifikasi admin.`,
    balanceBefore: before,
    balanceAfter: after,
  });

  await tx.topupRequest.update({
    where: { id: topup.id },
    data: {
      status: "SUCCESS",
      approvedBy: input.adminId,
      approvedAt: new Date(),
      adminNote: input.adminNote,
    },
  });

  await tx.notification.create({
    data: {
      userId: topup.userId,
      type: "TOPUP_SUCCESS",
      title: "Top up berhasil",
      body: "Saldo kamu sudah masuk. Silakan lanjut belanja akun yang kamu incar.",
    },
  });

  await tx.adminLog.create({
    data: {
      actorId: input.adminId,
      action: "APPROVE_TOPUP",
      entity: "topup_requests",
      entityId: topup.id,
      metadata: { invoiceId: topup.invoiceId, amount: topup.amount, fee: topup.fee },
    },
  });

  return topup;
}

export async function createOrderWithEscrow(tx: Tx, input: { buyerId: string; productId?: string; productSlug?: string }) {
  const product = await tx.product.findFirst({
    where: input.productId ? { id: input.productId } : { slug: input.productSlug },
    include: { seller: true },
  });
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (product.status !== "READY") throw new Error("Produk ini sudah sold atau belum siap dibeli.");
  if (product.sellerId === input.buyerId) throw new Error("Seller tidak bisa membeli produk sendiri.");

  const buyerWallet = await tx.wallet.findUnique({ where: { userId: input.buyerId } });
  if (!buyerWallet || buyerWallet.isLocked) throw new Error("Wallet tidak aktif.");

  const platformFee = await calculateFee(tx, "PLATFORM", product.price);
  const totalPaid = product.price + platformFee;
  if (buyerWallet.balanceAvailable < totalPaid) {
    throw new Error("Saldo kamu belum cukup. Top up dulu sebelum lanjut beli.");
  }

  const before = buyerWallet.balanceAvailable;
  const after = before - totalPaid;
  const invoiceId = createInvoice("ORDER");

  await tx.wallet.update({
    where: { userId: input.buyerId },
    data: { balanceAvailable: after },
  });

  await createWalletLog(tx, {
    userId: input.buyerId,
    type: "PURCHASE",
    amount: -totalPaid,
    fee: platformFee,
    referenceId: invoiceId,
    description: `Pembelian ${product.title}. Dana masuk escrow sampai transaksi aman.`,
    balanceBefore: before,
    balanceAfter: after,
  });

  const order = await tx.order.create({
    data: {
      invoiceId,
      buyerId: input.buyerId,
      sellerId: product.sellerId,
      productId: product.id,
      productPrice: product.price,
      platformFee,
      totalPaid,
      status: "WAITING_SELLER",
      escrowStatus: "HELD",
      chat: {
        create: {
          messages: {
            create: [
              { type: "SYSTEM", body: "Order dibuat." },
              { type: "SYSTEM", body: "Pembayaran berhasil. Dana ditahan dulu di escrow Alfarezel Market." },
              { type: "SYSTEM", body: "Seller sedang memproses pesanan." },
            ],
          },
        },
      },
    },
    include: { chat: true },
  });

  await tx.product.update({
    where: { id: product.id },
    data: { status: "SOLD", soldCount: { increment: 1 } },
  });

  await tx.notification.createMany({
    data: [
      {
        userId: input.buyerId,
        type: "ORDER_CREATED",
        title: "Pesanan kamu lagi diproses",
        body: `Invoice ${invoiceId} sudah dibuat. Cek chat transaksi untuk update seller.`,
      },
      {
        userId: product.sellerId,
        type: "PRODUCT_SOLD",
        title: "Produk kamu dibeli",
        body: `Buyer sudah membayar ${product.title}. Kirim data akun lewat sistem ya.`,
      },
    ],
  });

  return order;
}

export async function releaseEscrow(tx: Tx, input: { orderId: string; actorId: string; actorRole: UserRole }) {
  const order = await tx.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.escrowStatus !== "HELD" && order.escrowStatus !== "ADMIN_HOLD") {
    throw new Error("Dana escrow tidak bisa dirilis.");
  }

  const sellerWallet = await tx.wallet.upsert({
    where: { userId: order.sellerId },
    update: {},
    create: { userId: order.sellerId },
  });
  const before = sellerWallet.balanceAvailable;
  const after = before + order.productPrice;

  await tx.wallet.update({
    where: { userId: order.sellerId },
    data: { balanceAvailable: after },
  });
  await createWalletLog(tx, {
    userId: order.sellerId,
    type: "ESCROW_RELEASE",
    amount: order.productPrice,
    referenceId: order.invoiceId,
    description: `Dana penjualan ${order.invoiceId} diteruskan ke seller.`,
    balanceBefore: before,
    balanceAfter: after,
  });

  await tx.order.update({
    where: { id: order.id },
    data: {
      status: "COMPLETED",
      escrowStatus: "RELEASED",
      buyerConfirmedAt: new Date(),
      completedAt: new Date(),
    },
  });

  const chat = await tx.orderChat.findUnique({ where: { orderId: order.id } });
  if (chat) {
    await tx.chatMessage.createMany({
      data: [
        { chatId: chat.id, type: "SYSTEM", body: "Transaksi selesai." },
        { chatId: chat.id, type: "SYSTEM", body: "Dana telah diteruskan ke seller." },
      ],
    });
  }

  if (input.actorRole === "ADMIN" || input.actorRole === "SUPER_ADMIN") {
    await tx.adminLog.create({
      data: {
        actorId: input.actorId,
        action: "RELEASE_ESCROW",
        entity: "orders",
        entityId: order.id,
        metadata: { invoiceId: order.invoiceId },
      },
    });
  }

  return order;
}

export async function refundBuyer(tx: Tx, input: { orderId: string; adminId: string; reason: string }) {
  const order = await tx.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.escrowStatus !== "HELD" && order.escrowStatus !== "ADMIN_HOLD") {
    throw new Error("Dana escrow tidak bisa direfund.");
  }

  const buyerWallet = await tx.wallet.upsert({
    where: { userId: order.buyerId },
    update: {},
    create: { userId: order.buyerId },
  });
  const before = buyerWallet.balanceAvailable;
  const after = before + order.totalPaid;

  await tx.wallet.update({
    where: { userId: order.buyerId },
    data: { balanceAvailable: after },
  });
  await createWalletLog(tx, {
    userId: order.buyerId,
    type: "REFUND",
    amount: order.totalPaid,
    referenceId: order.invoiceId,
    description: `Refund order ${order.invoiceId}. ${input.reason}`,
    balanceBefore: before,
    balanceAfter: after,
  });

  await tx.order.update({
    where: { id: order.id },
    data: { status: "REFUNDED", escrowStatus: "REFUNDED" },
  });

  await tx.adminLog.create({
    data: {
      actorId: input.adminId,
      action: "REFUND_ORDER",
      entity: "orders",
      entityId: order.id,
      metadata: { invoiceId: order.invoiceId, reason: input.reason },
    },
  });

  return order;
}
