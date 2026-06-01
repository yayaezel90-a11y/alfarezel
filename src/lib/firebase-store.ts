import { FieldValue } from "firebase-admin/firestore";
import type { UserRole } from "@prisma/client";
import { firebaseDb } from "./firebase-admin";
import { games as seedGames, products as seedProducts, sellers as seedSellers } from "./demo-data";
import { createInvoice, slugify } from "./invoice";
import { hashPassword } from "./password";

type SessionLike = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: string;
  mustChangePassword: boolean;
};

type AppUser = SessionLike & {
  passwordHash: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
};

type Wallet = {
  userId: string;
  balanceAvailable: number;
  balanceHold: number;
  isLocked?: boolean;
};

type ProductDoc = {
  id: string;
  sellerId: string;
  gameId: string;
  gameSlug: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  rank?: string;
  level?: string;
  server?: string;
  platform?: string;
  bindInfo?: string;
  description?: string;
  securityNote?: string;
  images?: { url: string; sortOrder: number; alt?: string }[];
  attributes?: { key: string; value: string }[];
  seller?: { username?: string; sellerProfile?: Record<string, unknown> | null };
  game?: { id: string; name: string; slug: string };
  soldCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type OrderDoc = {
  id: string;
  invoiceId: string;
  buyerId: string;
  sellerId: string;
  productId?: string;
  productTitle?: string;
  productPrice: number;
  platformFee?: number;
  totalPaid: number;
  status: string;
  escrowStatus: string;
  chatId: string;
  createdAt: string;
  completedAt?: string;
  roomType?: "ORDER" | "SUPPORT" | "SELLER";
};

const suspiciousWords = ["transfer langsung", "di luar web", "wa aja bayar langsung", "bayar langsung", "luar platform"];

function now() {
  return new Date().toISOString();
}

function lower(value: string) {
  return value.trim().toLowerCase();
}

function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function hasSuspiciousText(value: string) {
  const normalized = value.toLowerCase();
  return suspiciousWords.some((word) => normalized.includes(word));
}

function sortNewest<T>(items: T[]) {
  return items.sort((a, b) =>
    String((b as { createdAt?: unknown }).createdAt ?? "").localeCompare(
      String((a as { createdAt?: unknown }).createdAt ?? ""),
    ),
  );
}

function sessionFromUser(user: AppUser): SessionLike {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
  };
}

async function findOneByField<T>(collection: string, field: string, value: string) {
  const snapshot = await firebaseDb().collection(collection).where(field, "==", value).limit(1).get();
  const doc = snapshot.docs[0];
  if (!doc) return null;
  return { id: doc.id, ...doc.data() } as T & { id: string };
}

async function allDocs<T>(collection: string) {
  const snapshot = await firebaseDb().collection(collection).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T & { id: string });
}

async function getWallet(userId: string): Promise<Wallet> {
  const ref = firebaseDb().collection("wallets").doc(userId);
  const snapshot = await ref.get();
  if (snapshot.exists) return { userId, balanceAvailable: 0, balanceHold: 0, ...snapshot.data() } as Wallet;

  const wallet: Wallet = { userId, balanceAvailable: 0, balanceHold: 0, isLocked: false };
  await ref.set({ ...wallet, createdAt: now(), updatedAt: now() });
  return wallet;
}

async function readFee(kind: "TOPUP" | "WITHDRAW" | "PLATFORM", amount: number) {
  const snapshot = await firebaseDb().collection("fee_settings").doc(kind).get();
  const data = snapshot.data();
  if (!data || data.isActive === false) return 0;
  const percentage = Number(data.percentage ?? 0);
  const fixed = Number(data.fixedFee ?? 0);
  return Math.ceil((amount * percentage) / 100) + fixed;
}

export async function firebaseFindUserByIdentifier(identifier: string) {
  const normalized = lower(identifier);
  return (
    (await findOneByField<AppUser>("users", "emailLower", normalized)) ??
    (await findOneByField<AppUser>("users", "usernameLower", normalized))
  );
}

export async function firebaseGetSessionUser(id: string) {
  const snapshot = await firebaseDb().collection("users").doc(id).get();
  if (!snapshot.exists) return null;
  const user = { id: snapshot.id, ...snapshot.data() } as AppUser;
  if (user.status !== "ACTIVE") return null;
  return sessionFromUser(user);
}

export async function firebaseRecordLogin(input: {
  userId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string | null;
}) {
  await firebaseDb().collection("login_logs").add({ ...input, createdAt: now() });
}

export async function firebaseMarkLastLogin(userId: string) {
  await firebaseDb().collection("users").doc(userId).update({ lastLoginAt: now(), updatedAt: now() });
}

export async function firebaseResetUserPassword(email: string, password: string) {
  const user = await findOneByField<AppUser>("users", "emailLower", lower(email));
  if (!user) throw new Error("User tidak ditemukan.");
  await firebaseDb().collection("users").doc(user.id).update({
    passwordHash: await hashPassword(password),
    mustChangePassword: false,
    updatedAt: now(),
  });
}

export async function firebaseRegisterUser(input: { username: string; email: string; password: string; phone?: string }) {
  const emailLower = lower(input.email);
  const usernameLower = lower(input.username);
  const existingEmail = await findOneByField<AppUser>("users", "emailLower", emailLower);
  const existingUsername = await findOneByField<AppUser>("users", "usernameLower", usernameLower);
  if (existingEmail || existingUsername) throw new Error("Username atau email sudah dipakai.");

  const db = firebaseDb();
  const userRef = db.collection("users").doc();
  const passwordHash = await hashPassword(input.password);
  const createdAt = now();
  const user: AppUser = {
    id: userRef.id,
    username: input.username,
    email: input.email,
    passwordHash,
    phone: input.phone,
    role: "BUYER" as UserRole,
    status: "ACTIVE",
    mustChangePassword: false,
  };

  const batch = db.batch();
  batch.set(userRef, { ...user, emailLower, usernameLower, createdAt, updatedAt: createdAt });
  batch.set(db.collection("wallets").doc(userRef.id), {
    userId: userRef.id,
    balanceAvailable: 0,
    balanceHold: 0,
    isLocked: false,
    createdAt,
    updatedAt: createdAt,
  });
  batch.set(db.collection("user_profiles").doc(userRef.id), { userId: userRef.id, createdAt, updatedAt: createdAt });
  await batch.commit();
  return sessionFromUser(user);
}

export async function firebaseListProducts(searchParams?: URLSearchParams) {
  const query = searchParams?.get("q")?.toLowerCase() ?? "";
  const game = searchParams?.get("game") ?? "";
  const status = searchParams?.get("status") ?? "READY";
  const min = Number(searchParams?.get("min") ?? 0);
  const max = Number(searchParams?.get("max") ?? 0);
  const verified = searchParams?.get("verified") === "true";
  const sort = searchParams?.get("sort") ?? "newest";

  let products = await allDocs<ProductDoc>("products");
  products = products.filter((product) => {
    if (status !== "all" && product.status !== status) return false;
    if (query && !product.title.toLowerCase().includes(query)) return false;
    if (game && product.gameSlug !== game) return false;
    if (min && product.price < min) return false;
    if (max && product.price > max) return false;
    if (verified && !product.seller?.sellerProfile?.isVerified) return false;
    return true;
  });

  products.sort((a, b) => {
    if (sort === "cheapest") return a.price - b.price;
    if (sort === "expensive") return b.price - a.price;
    if (sort === "best-selling") return Number(b.soldCount ?? 0) - Number(a.soldCount ?? 0);
    return String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  });

  return products.slice(0, 48);
}

export async function firebaseCreateProduct(user: SessionLike, input: {
  title: string;
  gameId?: string;
  gameSlug?: string;
  price: number;
  rank?: string;
  level?: string;
  server?: string;
  platform?: string;
  bindInfo: string;
  description: string;
  securityNote?: string;
  images: string[];
  attributes?: Record<string, string>;
}) {
  const game =
    input.gameSlug
      ? await firebaseDb().collection("games").doc(input.gameSlug).get()
      : input.gameId
        ? await firebaseDb().collection("games").where("id", "==", input.gameId).limit(1).get().then((snapshot) => snapshot.docs[0])
        : null;
  if (!game || !game.exists) throw new Error("Game tidak ditemukan.");
  const gameData = game.data() as { id?: string; name: string; slug: string };
  const reviewMode = await firebaseDb().collection("platform_settings").doc("product_review_mode").get();
  const baseSlug = slugify(input.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const createdAt = now();
  const productRef = firebaseDb().collection("products").doc(slug);
  const sellerProfile = await firebaseDb().collection("seller_profiles").doc(user.id).get();
  const product: ProductDoc = {
    id: productRef.id,
    sellerId: user.id,
    gameId: gameData.id ?? game.id,
    gameSlug: gameData.slug,
    game: { id: gameData.id ?? game.id, name: gameData.name, slug: gameData.slug },
    seller: { username: user.username, sellerProfile: sellerProfile.exists ? sellerProfile.data() : null },
    title: input.title,
    slug,
    price: input.price,
    rank: input.rank,
    level: input.level,
    server: input.server,
    platform: input.platform,
    bindInfo: input.bindInfo,
    description: input.description,
    securityNote: input.securityNote,
    status: reviewMode.data()?.value === "off" || user.role !== "SELLER" ? "READY" : "PENDING_REVIEW",
    images: input.images.map((url, index) => ({ url, sortOrder: index, alt: `${input.title} screenshot ${index + 1}` })),
    attributes: Object.entries(input.attributes ?? {}).map(([key, value]) => ({ key, value })),
    soldCount: 0,
    isFeatured: false,
    isVerified: Boolean(sellerProfile.data()?.isVerified),
    createdAt,
    updatedAt: createdAt,
  };
  await productRef.set(product);
  return product;
}

export async function firebaseGetProduct(id: string) {
  const byId = await firebaseDb().collection("products").doc(id).get();
  const snapshot = byId.exists
    ? byId
    : await firebaseDb().collection("products").where("slug", "==", id).limit(1).get().then((query) => query.docs[0]);
  if (!snapshot?.exists) return null;
  return { id: snapshot.id, ...snapshot.data() } as ProductDoc;
}

export async function firebaseUpdateProduct(user: SessionLike, id: string, input: Record<string, unknown>) {
  const product = await firebaseGetProduct(id);
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (product.sellerId !== user.id && !isAdmin(user.role)) throw new Response("Forbidden", { status: 403 });
  await firebaseDb().collection("products").doc(product.id).update({ ...input, updatedAt: now() });
  return firebaseGetProduct(product.id);
}

export async function firebaseArchiveProduct(user: SessionLike, id: string) {
  const product = await firebaseGetProduct(id);
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (product.sellerId !== user.id && !isAdmin(user.role)) throw new Response("Forbidden", { status: 403 });
  await firebaseDb().collection("products").doc(product.id).update({ status: "ARCHIVED", updatedAt: now() });
}

export async function firebaseReviewProduct(admin: SessionLike, id: string, input: { decision: "approve" | "reject" | "hide" | "feature"; note?: string }) {
  const product = await firebaseGetProduct(id);
  if (!product) throw new Error("Produk tidak ditemukan.");
  const status =
    input.decision === "approve"
      ? "READY"
      : input.decision === "reject"
        ? "REJECTED"
        : input.decision === "hide"
          ? "HIDDEN"
          : product.status;
  await firebaseDb().collection("products").doc(product.id).update({
    status,
    isFeatured: input.decision === "feature" ? true : product.isFeatured ?? false,
    updatedAt: now(),
  });
  await firebaseDb().collection("admin_logs").add({
    actorId: admin.id,
    action: `PRODUCT_${input.decision.toUpperCase()}`,
    entity: "products",
    entityId: product.id,
    metadata: { note: input.note ?? null },
    createdAt: now(),
  });
  return firebaseGetProduct(product.id);
}

export async function firebaseCreateTopup(user: SessionLike, input: {
  amount: number;
  paymentMethod: "DANA" | "GoPay";
  proofImage?: string;
  userNote?: string;
}) {
  const fee = await readFee("TOPUP", input.amount);
  const id = firebaseDb().collection("topup_requests").doc().id;
  const topup = {
    id,
    invoiceId: createInvoice("TOPUP"),
    userId: user.id,
    amount: input.amount,
    fee,
    totalTransfer: input.amount + fee,
    paymentMethod: input.paymentMethod,
    adminNumber: process.env.ADMIN_TOPUP_NUMBER ?? "087760337535",
    proofImage: input.proofImage ?? null,
    userNote: input.userNote ?? null,
    status: input.proofImage ? "WAITING_ADMIN_CONFIRMATION" : "WAITING_PAYMENT",
    createdAt: now(),
  };
  await firebaseDb().collection("topup_requests").doc(id).set(topup);
  return topup;
}

export async function firebaseListTopups(user: SessionLike) {
  const topups = await allDocs<Record<string, unknown>>("topup_requests");
  return sortNewest(isAdmin(user.role) ? topups : topups.filter((topup) => topup.userId === user.id)).slice(0, 100);
}

export async function firebaseApproveTopup(topupId: string, admin: SessionLike, adminNote?: string) {
  const db = firebaseDb();
  const topupRef = db.collection("topup_requests").doc(topupId);
  await db.runTransaction(async (tx) => {
    const topupSnap = await tx.get(topupRef);
    if (!topupSnap.exists) throw new Error("Request top up tidak ditemukan.");
    const topup = topupSnap.data() as { userId: string; amount: number; fee: number; invoiceId: string; status: string };
    if (topup.status === "SUCCESS") throw new Error("Top up ini sudah berhasil.");
    const walletRef = db.collection("wallets").doc(topup.userId);
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : ({ balanceAvailable: 0, balanceHold: 0, isLocked: false } as Wallet);
    const before = Number(wallet.balanceAvailable ?? 0);
    const after = before + Number(topup.amount);
    tx.set(walletRef, { userId: topup.userId, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: now() }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId: topup.userId,
      type: "TOP_UP",
      amount: topup.amount,
      fee: topup.fee,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: topup.invoiceId,
      description: `Top up ${topup.invoiceId} berhasil diverifikasi admin.`,
      createdAt: now(),
    });
    tx.update(topupRef, { status: "SUCCESS", approvedBy: admin.id, approvedAt: now(), adminNote: adminNote ?? null });
    tx.set(db.collection("admin_logs").doc(), {
      actorId: admin.id,
      action: "APPROVE_TOPUP",
      entity: "topup_requests",
      entityId: topupId,
      metadata: { invoiceId: topup.invoiceId, amount: topup.amount, fee: topup.fee },
      createdAt: now(),
    });
  });
  const updated = await topupRef.get();
  return { id: updated.id, ...updated.data() };
}

export async function firebaseRejectTopup(topupId: string, admin: SessionLike, adminNote?: string) {
  await firebaseDb().collection("topup_requests").doc(topupId).update({
    status: "REJECTED",
    adminNote: adminNote ?? "Bukti transfer belum valid.",
    approvedBy: admin.id,
    approvedAt: now(),
  });
  await firebaseDb().collection("admin_logs").add({
    actorId: admin.id,
    action: "REJECT_TOPUP",
    entity: "topup_requests",
    entityId: topupId,
    createdAt: now(),
  });
}

export async function firebaseCreateOrderWithEscrow(user: SessionLike, input: { productId?: string; productSlug?: string }) {
  const db = firebaseDb();
  const productSnap = input.productId
    ? await db.collection("products").doc(input.productId).get()
    : await db.collection("products").where("slug", "==", input.productSlug).limit(1).get().then((snapshot) => snapshot.docs[0]);
  if (!productSnap?.exists) throw new Error("Produk tidak ditemukan.");
  const product = { id: productSnap.id, ...productSnap.data() } as ProductDoc;
  if (product.status !== "READY") throw new Error("Produk ini sudah sold atau belum siap dibeli.");
  if (product.sellerId === user.id) throw new Error("Seller tidak bisa membeli produk sendiri.");

  const orderRef = db.collection("orders").doc();
  const invoiceId = createInvoice("ORDER");
  const chatId = orderRef.id;
  const platformFee = await readFee("PLATFORM", product.price);
  const totalPaid = product.price + platformFee;
  const createdAt = now();

  await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(user.id);
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : ({ balanceAvailable: 0, balanceHold: 0, isLocked: false } as Wallet);
    if (wallet.isLocked) throw new Error("Wallet sedang dikunci admin.");
    const before = Number(wallet.balanceAvailable ?? 0);
    if (before < totalPaid) throw new Error("Saldo kamu belum cukup. Top up dulu sebelum lanjut beli.");
    const after = before - totalPaid;

    tx.set(walletRef, { userId: user.id, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: createdAt }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId: user.id,
      type: "PURCHASE",
      amount: -totalPaid,
      fee: platformFee,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: invoiceId,
      description: `Pembelian ${product.title}. Dana masuk escrow sampai transaksi aman.`,
      createdAt,
    });
    tx.set(orderRef, {
      id: orderRef.id,
      invoiceId,
      buyerId: user.id,
      sellerId: product.sellerId,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      platformFee,
      totalPaid,
      status: "WAITING_SELLER",
      escrowStatus: "HELD",
      chatId,
      createdAt,
    });
    tx.set(db.collection("order_chats").doc(chatId), { id: chatId, orderId: orderRef.id, isLocked: false, createdAt });
    for (const body of ["Order dibuat.", "Pembayaran berhasil. Dana ditahan dulu di escrow Alfarezel Market.", "Seller sedang memproses pesanan."]) {
      tx.set(db.collection("chat_messages").doc(), { chatId, orderId: orderRef.id, type: "SYSTEM", body, createdAt });
    }
    tx.update(productSnap.ref, { status: "SOLD", soldCount: FieldValue.increment(1), updatedAt: createdAt });
  });

  const order = await orderRef.get();
  return { id: order.id, ...order.data() } as OrderDoc;
}

export async function firebaseFindOrderForUser(orderRef: string, user: SessionLike) {
  if (orderRef === "support" || orderRef.startsWith("seller-")) {
    return firebaseFindRoomForUser(orderRef, user);
  }

  const byId = await firebaseDb().collection("orders").doc(orderRef).get();
  const snapshot = byId.exists
    ? byId
    : await firebaseDb().collection("orders").where("invoiceId", "==", orderRef).limit(1).get().then((query) => query.docs[0]);
  if (!snapshot?.exists) return null;
  const order = { id: snapshot.id, ...snapshot.data() } as OrderDoc;
  if (!isAdmin(user.role) && order.buyerId !== user.id && order.sellerId !== user.id) return null;
  return order;
}

async function firebaseFindRoomForUser(roomRef: string, user: SessionLike): Promise<OrderDoc> {
  const db = firebaseDb();
  const createdAt = now();

  if (roomRef === "support") {
    const roomId = isAdmin(user.role) ? "support-admin" : `support-${user.id}`;
    await db.collection("order_chats").doc(roomId).set(
      {
        id: roomId,
        orderId: roomId,
        roomType: "SUPPORT",
        title: "Bantuan admin",
        isLocked: false,
        createdAt,
        updatedAt: createdAt,
      },
      { merge: true },
    );
    return {
      id: roomId,
      invoiceId: "SUPPORT",
      buyerId: user.id,
      sellerId: "admin",
      productPrice: 0,
      totalPaid: 0,
      status: "ACTIVE",
      escrowStatus: "NONE",
      chatId: roomId,
      createdAt,
      roomType: "SUPPORT",
    };
  }

  const slug = roomRef.replace(/^seller-/, "");
  const sellerSnap = await db.collection("seller_profiles").where("slug", "==", slug).limit(1).get();
  const seller = sellerSnap.docs[0];
  if (!seller) throw new Error("Seller tidak ditemukan.");
  const sellerData = seller.data() as { userId?: string; storeName?: string };
  const sellerId = sellerData.userId ?? seller.id;
  const participantKey = user.id === sellerId ? "seller" : user.id;
  const roomId = `seller-${slug}-${participantKey}`;
  if (!isAdmin(user.role) && user.id !== sellerId && participantKey !== user.id) throw new Response("Forbidden", { status: 403 });
  await db.collection("order_chats").doc(roomId).set(
    {
      id: roomId,
      orderId: roomId,
      roomType: "SELLER",
      sellerId,
      buyerId: user.id === sellerId ? null : user.id,
      title: sellerData.storeName ?? "Chat seller",
      isLocked: false,
      createdAt,
      updatedAt: createdAt,
    },
    { merge: true },
  );
  return {
    id: roomId,
    invoiceId: roomId.toUpperCase(),
    buyerId: user.id === sellerId ? "buyer" : user.id,
    sellerId,
    productPrice: 0,
    totalPaid: 0,
    status: "ACTIVE",
    escrowStatus: "NONE",
    chatId: roomId,
    createdAt,
    roomType: "SELLER",
  };
}

export async function firebaseListOrders(user: SessionLike) {
  const orders = await allDocs<OrderDoc>("orders");
  return sortNewest(
    isAdmin(user.role)
      ? orders
      : user.role === "SELLER"
        ? orders.filter((order) => order.sellerId === user.id)
        : orders.filter((order) => order.buyerId === user.id),
  ).slice(0, 100);
}

export async function firebaseListChatMessages(orderRef: string, user: SessionLike) {
  const order = await firebaseFindOrderForUser(orderRef, user);
  if (!order) throw new Error("Chat transaksi tidak ditemukan.");
  const messages = await firebaseDb().collection("chat_messages").where("orderId", "==", order.id).get();
  return messages.docs
    .map(
      (doc) =>
        ({ id: doc.id, ...doc.data() }) as {
          id: string;
          type?: string;
          body?: string;
          createdAt?: string;
          sender?: { username?: string; role?: string } | null;
        },
    )
    .sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")));
}

export async function firebaseCreateChatMessage(orderRef: string, user: SessionLike, input: { body: string; attachments?: string[] }) {
  const db = firebaseDb();
  const order = await firebaseFindOrderForUser(orderRef, user);
  if (!order) throw new Error("Chat transaksi tidak ditemukan.");
  const chat = await db.collection("order_chats").doc(order.chatId).get();
  if (chat.data()?.isLocked) throw new Error("Chat transaksi sedang dikunci admin.");

  const message = {
    chatId: order.chatId,
    orderId: order.id,
    senderId: user.id,
    sender: { username: user.username, role: user.role },
    type: isAdmin(user.role) ? "ADMIN" : "USER",
    body: input.body,
    attachments: input.attachments ?? [],
    createdAt: now(),
  };
  const messageRef = await db.collection("chat_messages").add(message);
  const warning = hasSuspiciousText(input.body);
  if (warning) {
    await db.collection("chat_messages").add({
      chatId: order.chatId,
      orderId: order.id,
      type: "SYSTEM",
      body: "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
      createdAt: now(),
    });
    await db.collection("security_flags").add({
      userId: user.id,
      type: "SUSPICIOUS_CHAT",
      value: input.body.slice(0, 180),
      reason: "Chat mengandung ajakan transaksi di luar platform.",
      severity: 3,
      createdAt: now(),
    });
  }
  return { id: messageRef.id, ...message, warning };
}

export async function firebaseUpdateUserAvatar(user: SessionLike, avatarUrl: string) {
  await firebaseDb().collection("users").doc(user.id).set({ avatar: avatarUrl, updatedAt: now() }, { merge: true });
  if (user.role === "SELLER") {
    await firebaseDb().collection("seller_profiles").doc(user.id).set({ avatar: avatarUrl, updatedAt: now() }, { merge: true });
  }
}

export async function firebaseUpdateSellerPhoto(user: SessionLike, input: { storeBanner?: string; storeAvatar?: string }) {
  await firebaseDb().collection("seller_profiles").doc(user.id).set(
    {
      avatar: input.storeAvatar ?? undefined,
      banner: input.storeBanner ?? undefined,
      updatedAt: now(),
    },
    { merge: true },
  );
}

export async function firebaseUpdatePlatformVisuals(admin: SessionLike, input: { dashboardImage?: string; logoUrl?: string }) {
  await firebaseDb().collection("platform_settings").doc("visuals").set(
    {
      key: "visuals",
      dashboardImage: input.dashboardImage ?? null,
      logoUrl: input.logoUrl ?? null,
      updatedBy: admin.id,
      updatedAt: now(),
    },
    { merge: true },
  );
  await firebaseDb().collection("admin_logs").add({
    actorId: admin.id,
    action: "UPDATE_PLATFORM_VISUALS",
    entity: "platform_settings",
    entityId: "visuals",
    createdAt: now(),
  });
}

export async function firebaseConfirmOrder(user: SessionLike, orderId: string) {
  const db = firebaseDb();
  const order = await firebaseFindOrderForUser(orderId, user);
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.buyerId !== user.id && !isAdmin(user.role)) throw new Response("Forbidden", { status: 403 });
  if (order.escrowStatus !== "HELD" && order.escrowStatus !== "ADMIN_HOLD") throw new Error("Dana escrow tidak bisa dirilis.");
  await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(order.sellerId);
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : { balanceAvailable: 0, balanceHold: 0 };
    const before = Number(wallet.balanceAvailable ?? 0);
    const after = before + order.productPrice;
    tx.set(walletRef, { userId: order.sellerId, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: now() }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId: order.sellerId,
      type: "ESCROW_RELEASE",
      amount: order.productPrice,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: order.invoiceId,
      description: `Dana penjualan ${order.invoiceId} diteruskan ke seller.`,
      createdAt: now(),
    });
    tx.update(db.collection("orders").doc(order.id), {
      status: "COMPLETED",
      escrowStatus: "RELEASED",
      buyerConfirmedAt: now(),
      completedAt: now(),
    });
    tx.set(db.collection("chat_messages").doc(), { chatId: order.chatId, orderId: order.id, type: "SYSTEM", body: "Transaksi selesai.", createdAt: now() });
    tx.set(db.collection("chat_messages").doc(), { chatId: order.chatId, orderId: order.id, type: "SYSTEM", body: "Dana telah diteruskan ke seller.", createdAt: now() });
  });
}

export async function firebaseRefundOrder(admin: SessionLike, orderId: string, reason: string) {
  const db = firebaseDb();
  const order = await firebaseFindOrderForUser(orderId, admin);
  if (!order) throw new Error("Order tidak ditemukan.");
  await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(order.buyerId);
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : { balanceAvailable: 0, balanceHold: 0 };
    const before = Number(wallet.balanceAvailable ?? 0);
    const after = before + order.totalPaid;
    tx.set(walletRef, { userId: order.buyerId, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: now() }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId: order.buyerId,
      type: "REFUND",
      amount: order.totalPaid,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: order.invoiceId,
      description: `Refund order ${order.invoiceId}. ${reason}`,
      createdAt: now(),
    });
    tx.update(db.collection("orders").doc(order.id), { status: "REFUNDED", escrowStatus: "REFUNDED", updatedAt: now() });
    tx.set(db.collection("admin_logs").doc(), {
      actorId: admin.id,
      action: "REFUND_ORDER",
      entity: "orders",
      entityId: order.id,
      metadata: { invoiceId: order.invoiceId, reason },
      createdAt: now(),
    });
  });
}

export async function firebaseHoldOrder(admin: SessionLike, orderId: string) {
  const order = await firebaseFindOrderForUser(orderId, admin);
  if (!order) throw new Error("Order tidak ditemukan.");
  await firebaseDb().collection("orders").doc(order.id).update({ status: "ADMIN_HOLD", escrowStatus: "ADMIN_HOLD", updatedAt: now() });
  await firebaseDb().collection("admin_logs").add({ actorId: admin.id, action: "HOLD_ORDER", entity: "orders", entityId: order.id, createdAt: now() });
}

export async function firebaseSubmitAccountData(user: SessionLike, orderId: string, input: { accountData: string; note?: string }) {
  const order = await firebaseFindOrderForUser(orderId, user);
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.sellerId !== user.id && !isAdmin(user.role)) throw new Response("Forbidden", { status: 403 });
  await firebaseDb().collection("orders").doc(order.id).update({
    accountDataCipher: input.accountData,
    accountDataNote: input.note ?? null,
    status: "ACCOUNT_SENT",
    sellerSubmittedAt: now(),
    updatedAt: now(),
  });
  await firebaseDb().collection("chat_messages").add({
    chatId: order.chatId,
    orderId: order.id,
    senderId: user.id,
    type: "SECURE_ACCOUNT_DATA",
    body: "Data akun telah dikirim lewat penyimpanan aman.",
    createdAt: now(),
  });
  await firebaseDb().collection("chat_messages").add({ chatId: order.chatId, orderId: order.id, type: "SYSTEM", body: "Data akun telah dikirim.", createdAt: now() });
  await firebaseDb().collection("chat_messages").add({
    chatId: order.chatId,
    orderId: order.id,
    type: "SYSTEM",
    body: "Pastikan data akun sudah sesuai sebelum transaksi selesai.",
    createdAt: now(),
  });
}

export async function firebaseCreateWithdraw(user: SessionLike, input: {
  amount: number;
  method: "DANA" | "GoPay" | "Bank Transfer";
  destinationNumber: string;
  receiverName: string;
  sellerNote?: string;
}) {
  const wallet = await getWallet(user.id);
  const fee = await readFee("WITHDRAW", input.amount);
  if (wallet.balanceAvailable < input.amount) throw new Error("Saldo penjualan belum cukup untuk withdraw.");
  const id = firebaseDb().collection("withdraw_requests").doc().id;
  const withdraw = {
    id,
    invoiceId: createInvoice("WD"),
    sellerId: user.id,
    amount: input.amount,
    fee,
    totalReceived: input.amount - fee,
    method: input.method,
    destinationNumber: input.destinationNumber,
    receiverName: input.receiverName,
    sellerNote: input.sellerNote ?? null,
    status: "PENDING_ADMIN",
    createdAt: now(),
  };
  await firebaseDb().collection("withdraw_requests").doc(id).set(withdraw);
  return withdraw;
}

export async function firebaseListWithdraws(user: SessionLike) {
  const withdraws = await allDocs<Record<string, unknown>>("withdraw_requests");
  return sortNewest(isAdmin(user.role) ? withdraws : withdraws.filter((withdraw) => withdraw.sellerId === user.id)).slice(0, 100);
}

export async function firebaseApproveWithdraw(withdrawId: string, admin: SessionLike, adminNote?: string, proofImage?: string) {
  const db = firebaseDb();
  const withdrawRef = db.collection("withdraw_requests").doc(withdrawId);
  await db.runTransaction(async (tx) => {
    const withdrawSnap = await tx.get(withdrawRef);
    if (!withdrawSnap.exists) throw new Error("Request withdraw tidak ditemukan.");
    const withdraw = withdrawSnap.data() as { sellerId: string; amount: number; fee: number; invoiceId: string; status: string };
    if (withdraw.status === "SUCCESS") throw new Error("Withdraw ini sudah berhasil.");
    const walletRef = db.collection("wallets").doc(withdraw.sellerId);
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : { balanceAvailable: 0, balanceHold: 0 };
    const before = Number(wallet.balanceAvailable ?? 0);
    if (before < withdraw.amount) throw new Error("Saldo seller tidak cukup.");
    const after = before - withdraw.amount;
    tx.set(walletRef, { userId: withdraw.sellerId, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: now() }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId: withdraw.sellerId,
      type: "WITHDRAW",
      amount: -withdraw.amount,
      fee: withdraw.fee,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: withdraw.invoiceId,
      description: `Withdraw ${withdraw.invoiceId} berhasil diproses admin.`,
      createdAt: now(),
    });
    tx.update(withdrawRef, { status: "SUCCESS", adminNote: adminNote ?? null, proofImage: proofImage ?? null, approvedBy: admin.id, approvedAt: now() });
  });
}

export async function firebaseRejectWithdraw(withdrawId: string, admin: SessionLike, adminNote?: string) {
  await firebaseDb().collection("withdraw_requests").doc(withdrawId).update({
    status: "REJECTED",
    adminNote: adminNote ?? "Withdraw ditolak admin.",
    approvedBy: admin.id,
    approvedAt: now(),
  });
}

export async function firebaseApplySeller(user: SessionLike, input: Record<string, unknown>) {
  const profile = {
    userId: user.id,
    status: "PENDING_REVIEW",
    isVerified: false,
    storeName: input.storeName,
    whatsapp: input.whatsapp,
    email: input.email,
    description: input.description,
    gamesSold: input.gamesSold,
    experience: input.experience,
    reason: input.reason,
    socialLink: input.socialLink ?? null,
    proofImage: input.proofImage ?? null,
    updatedAt: now(),
  };
  await firebaseDb().collection("seller_profiles").doc(user.id).set({ ...profile, createdAt: now() }, { merge: true });
  return profile;
}

export async function firebaseSellerDecision(
  admin: SessionLike,
  sellerId: string,
  decision: "approve" | "reject" | "verify" | "unverify" | "suspend",
  adminNote?: string,
) {
  const status = decision === "approve" || decision === "verify" || decision === "unverify" ? "APPROVED" : decision === "suspend" ? "SUSPENDED" : "REJECTED";
  await firebaseDb().collection("seller_profiles").doc(sellerId).set(
    {
      status,
      isVerified: decision === "verify" ? true : decision === "unverify" ? false : undefined,
      adminNote: adminNote ?? null,
      reviewedBy: admin.id,
      reviewedAt: now(),
      updatedAt: now(),
    },
    { merge: true },
  );
  if (decision === "approve" || decision === "verify") await firebaseDb().collection("users").doc(sellerId).update({ role: "SELLER", status: "ACTIVE", updatedAt: now() });
  if (decision === "suspend") await firebaseDb().collection("users").doc(sellerId).update({ status: "SUSPENDED", updatedAt: now() });
  await firebaseDb().collection("admin_logs").add({
    actorId: admin.id,
    action: `SELLER_${decision.toUpperCase()}`,
    entity: "seller_profiles",
    entityId: sellerId,
    metadata: { note: adminNote ?? null },
    createdAt: now(),
  });
}

export async function firebaseAdjustWallet(admin: SessionLike, userId: string, amount: number, reason: string) {
  const db = firebaseDb();
  const walletRef = db.collection("wallets").doc(userId);
  await db.runTransaction(async (tx) => {
    const walletSnap = await tx.get(walletRef);
    const wallet = walletSnap.exists ? (walletSnap.data() as Wallet) : { balanceAvailable: 0, balanceHold: 0 };
    const before = Number(wallet.balanceAvailable ?? 0);
    const after = before + amount;
    if (after < 0) throw new Error("Saldo tidak boleh negatif.");
    tx.set(walletRef, { userId, balanceAvailable: after, balanceHold: wallet.balanceHold ?? 0, updatedAt: now() }, { merge: true });
    tx.set(db.collection("wallet_transactions").doc(), {
      userId,
      type: "ADMIN_ADJUSTMENT",
      amount,
      balanceBefore: before,
      balanceAfter: after,
      status: "SUCCESS",
      referenceId: `ADMIN-${Date.now()}`,
      description: reason,
      createdAt: now(),
    });
    tx.set(db.collection("admin_logs").doc(), {
      actorId: admin.id,
      action: "ADJUST_WALLET",
      entity: "wallets",
      entityId: userId,
      metadata: { targetUserId: userId, amount, reason },
      createdAt: now(),
    });
  });
  const updated = await walletRef.get();
  return { id: updated.id, ...updated.data() };
}

export async function firebaseCreateReport(user: SessionLike, input: Record<string, unknown>) {
  const id = firebaseDb().collection("reports").doc().id;
  const report = {
    id,
    reporterId: user.id,
    reportedUserId: input.reportedUserId ?? null,
    orderId: input.orderId ?? null,
    productId: input.productId ?? null,
    type: input.type,
    reason: input.reason,
    description: input.description,
    proofUrl: input.proofUrl ?? null,
    status: "NEW",
    priority: 2,
    createdAt: now(),
  };
  await firebaseDb().collection("reports").doc(id).set(report);
  if (typeof input.orderId === "string" && input.orderId) {
    const order = await firebaseFindOrderForUser(input.orderId, user);
    if (order) {
      await firebaseDb().collection("orders").doc(order.id).update({ status: "DISPUTED", escrowStatus: "ADMIN_HOLD", updatedAt: now() });
      await firebaseDb().collection("chat_messages").add({ chatId: order.chatId, orderId: order.id, type: "SYSTEM", body: "Buyer membuka report.", createdAt: now() });
      await firebaseDb().collection("chat_messages").add({ chatId: order.chatId, orderId: order.id, type: "SYSTEM", body: "Admin bergabung ke chat.", createdAt: now() });
    }
  }
  return report;
}

export async function firebaseListReports(user: SessionLike) {
  const reports = await allDocs<Record<string, unknown>>("reports");
  return sortNewest(isAdmin(user.role) ? reports : reports.filter((report) => report.reporterId === user.id)).slice(0, 100);
}

export async function firebaseResolveReport(admin: SessionLike, reportId: string, input: { resolution: string; decision: "REFUND_BUYER" | "RELEASE_SELLER" | "CLOSE_ONLY" }) {
  const report = await firebaseDb().collection("reports").doc(reportId).get();
  if (!report.exists) throw new Error("Report tidak ditemukan.");
  const data = report.data() as { orderId?: string | null };
  if (data.orderId && input.decision === "REFUND_BUYER") {
    await firebaseRefundOrder(admin, data.orderId, input.resolution);
  }
  if (data.orderId && input.decision === "RELEASE_SELLER") {
    await firebaseConfirmOrder(admin, data.orderId);
  }
  await firebaseDb().collection("reports").doc(reportId).update({
    status: "RESOLVED",
    resolution: input.resolution,
    resolvedBy: admin.id,
    closedAt: now(),
  });
  await firebaseDb().collection("admin_logs").add({
    actorId: admin.id,
    action: "RESOLVE_REPORT",
    entity: "reports",
    entityId: reportId,
    metadata: input,
    createdAt: now(),
  });
}

export async function firebaseAdminCollection(collection: string, limit = 80) {
  const allowed = new Set([
    "users",
    "seller_profiles",
    "products",
    "orders",
    "topup_requests",
    "withdraw_requests",
    "wallets",
    "wallet_transactions",
    "reports",
    "order_chats",
    "games",
    "banners",
    "vouchers",
    "fee_settings",
    "platform_settings",
    "admin_logs",
    "login_logs",
    "security_flags",
    "notifications",
  ]);
  if (!allowed.has(collection)) throw new Error("Collection admin tidak valid.");
  return sortNewest(await allDocs<Record<string, unknown>>(collection)).slice(0, limit);
}

export async function firebaseUpdateFeeSetting(admin: SessionLike, input: {
  kind: "TOPUP" | "WITHDRAW" | "PLATFORM";
  percentage: number;
  fixedFee: number;
  minAmount?: number;
  maxAmount?: number;
}) {
  await firebaseDb().collection("fee_settings").doc(input.kind).set({ ...input, isActive: true, updatedBy: admin.id, updatedAt: now() }, { merge: true });
  await firebaseDb().collection("admin_logs").add({ actorId: admin.id, action: "UPDATE_FEE", entity: "fee_settings", entityId: input.kind, metadata: input, createdAt: now() });
}

export async function firebaseUpdatePlatformSetting(admin: SessionLike, input: { key: string; value: string }) {
  await firebaseDb().collection("platform_settings").doc(input.key).set({ key: input.key, value: input.value, updatedBy: admin.id, updatedAt: now() }, { merge: true });
  await firebaseDb().collection("admin_logs").add({ actorId: admin.id, action: "UPDATE_PLATFORM_SETTING", entity: "platform_settings", entityId: input.key, metadata: input, createdAt: now() });
}

export async function firebaseCreateGameCategory(admin: SessionLike, input: { name: string; slug: string; description?: string; icon?: string; banner?: string }) {
  await firebaseDb().collection("games").doc(input.slug).set({ ...input, id: input.slug, updatedBy: admin.id, updatedAt: now(), createdAt: now() }, { merge: true });
  await firebaseDb().collection("admin_logs").add({ actorId: admin.id, action: "UPSERT_GAME", entity: "games", entityId: input.slug, metadata: input, createdAt: now() });
}

export async function firebaseCreateAdminDocument(admin: SessionLike, collection: "banners" | "vouchers" | "notifications", input: Record<string, unknown>) {
  const ref = await firebaseDb().collection(collection).add({ ...input, createdBy: admin.id, status: input.status ?? "ACTIVE", createdAt: now(), updatedAt: now() });
  await firebaseDb().collection("admin_logs").add({ actorId: admin.id, action: `CREATE_${collection.toUpperCase()}`, entity: collection, entityId: ref.id, metadata: input, createdAt: now() });
  return { id: ref.id, ...input };
}

export async function firebaseAdminOverview() {
  const [users, products, orders, reports, topups, withdraws] = await Promise.all([
    allDocs<Record<string, unknown>>("users"),
    allDocs<Record<string, unknown>>("products"),
    allDocs<Record<string, unknown>>("orders"),
    allDocs<Record<string, unknown>>("reports"),
    allDocs<Record<string, unknown>>("topup_requests"),
    allDocs<Record<string, unknown>>("withdraw_requests"),
  ]);
  return {
    totalUsers: users.length,
    totalBuyers: users.filter((user) => user.role === "BUYER").length,
    totalSellers: users.filter((user) => user.role === "SELLER").length,
    sellerPending: (await allDocs<Record<string, unknown>>("seller_profiles")).filter((seller) => seller.status === "PENDING_REVIEW").length,
    totalProducts: products.length,
    productsPending: products.filter((product) => product.status === "PENDING_REVIEW").length,
    productsSold: products.filter((product) => product.status === "SOLD").length,
    totalOrders: orders.length,
    activeReports: reports.filter((report) => ["NEW", "REVIEWING", "WAITING_BUYER_EVIDENCE", "WAITING_SELLER_EVIDENCE"].includes(String(report.status))).length,
    totalTopup: topups.filter((topup) => topup.status === "SUCCESS").reduce((sum, topup) => sum + Number(topup.amount ?? 0), 0),
    totalTopupFee: topups.filter((topup) => topup.status === "SUCCESS").reduce((sum, topup) => sum + Number(topup.fee ?? 0), 0),
    totalWithdraw: withdraws.filter((withdraw) => withdraw.status === "SUCCESS").reduce((sum, withdraw) => sum + Number(withdraw.amount ?? 0), 0),
    gmv: orders.reduce((sum, order) => sum + Number(order.totalPaid ?? 0), 0),
  };
}

export async function firebaseCreateReview(user: SessionLike, input: { orderId: string; rating: number; body: string; proofUrl?: string }) {
  const order = await firebaseFindOrderForUser(input.orderId, user);
  if (!order) throw new Error("Order tidak ditemukan.");
  if (order.buyerId !== user.id) throw new Response("Forbidden", { status: 403 });
  if (order.status !== "COMPLETED") throw new Error("Review hanya bisa dibuat setelah transaksi selesai.");
  const review = {
    orderId: order.id,
    productId: order.productId,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    rating: input.rating,
    body: input.body,
    proofUrl: input.proofUrl ?? null,
    createdAt: now(),
  };
  const ref = await firebaseDb().collection("reviews").add(review);
  const reviews = (await allDocs<Record<string, unknown>>("reviews")).filter((item) => item.sellerId === order.sellerId);
  const rating = reviews.reduce((sum, item) => sum + Number(item.rating ?? 0), 0) / Math.max(reviews.length, 1);
  await firebaseDb().collection("seller_profiles").doc(order.sellerId).set({ ratingAverage: rating, ratingCount: reviews.length, updatedAt: now() }, { merge: true });
  return { id: ref.id, ...review };
}

export async function firebaseListWishlist(user: SessionLike) {
  const wishlists = (await allDocs<Record<string, unknown>>("wishlists")).filter((item) => item.userId === user.id);
  return sortNewest(wishlists);
}

export async function firebaseAddWishlist(user: SessionLike, productId: string) {
  const id = `${user.id}_${productId}`;
  const wishlist = { id, userId: user.id, productId, createdAt: now() };
  await firebaseDb().collection("wishlists").doc(id).set(wishlist, { merge: true });
  return wishlist;
}

export async function firebaseRemoveWishlist(user: SessionLike, productId: string) {
  await firebaseDb().collection("wishlists").doc(`${user.id}_${productId}`).delete();
}

export async function firebaseHealthCheck() {
  await firebaseDb().collection("_health").doc("db").set({ checkedAt: now() }, { merge: true });
}

export async function firebaseSeed() {
  const db = firebaseDb();
  const createdAt = now();
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? "alfarez@gmail.com";
  const adminUsername = process.env.ADMIN_DEFAULT_USERNAME ?? "alfarez@gmail.com";
  const adminPassword = process.env.ADMIN_DEFAULT_TEMP_PASSWORD ?? "ezel301123";
  const adminHash = await hashPassword(adminPassword);

  const admin =
    (await findOneByField<AppUser>("users", "emailLower", lower(adminEmail))) ??
    (await findOneByField<AppUser>("users", "usernameLower", lower(adminUsername)));
  const adminRef = admin ? db.collection("users").doc(admin.id) : db.collection("users").doc();
  await adminRef.set(
    {
      id: adminRef.id,
      username: adminUsername,
      usernameLower: lower(adminUsername),
      email: adminEmail,
      emailLower: lower(adminEmail),
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      mustChangePassword: true,
      phone: process.env.ADMIN_TOPUP_NUMBER ?? "087760337535",
      createdAt: admin?.createdAt ?? createdAt,
      updatedAt: createdAt,
    },
    { merge: true },
  );
  await db.collection("wallets").doc(adminRef.id).set({ userId: adminRef.id, balanceAvailable: 0, balanceHold: 0, isLocked: false, createdAt, updatedAt: createdAt }, { merge: true });

  await db.collection("platform_settings").doc("admin_topup_number").set({ key: "admin_topup_number", value: process.env.ADMIN_TOPUP_NUMBER ?? "087760337535", updatedAt: createdAt });
  await db.collection("platform_settings").doc("product_review_mode").set({ key: "product_review_mode", value: "on", updatedAt: createdAt });
  await db.collection("fee_settings").doc("TOPUP").set({ kind: "TOPUP", percentage: 2, fixedFee: 1000, minAmount: 10000, maxAmount: 10000000, isActive: true, updatedAt: createdAt });
  await db.collection("fee_settings").doc("WITHDRAW").set({ kind: "WITHDRAW", percentage: 1, fixedFee: 1500, minAmount: 25000, maxAmount: 5000000, isActive: true, updatedAt: createdAt });
  await db.collection("fee_settings").doc("PLATFORM").set({ kind: "PLATFORM", percentage: 3, fixedFee: 0, minAmount: 0, maxAmount: 0, isActive: true, updatedAt: createdAt });

  for (const game of seedGames) {
    await db.collection("games").doc(game.slug).set({ ...game, id: game.slug, createdAt, updatedAt: createdAt }, { merge: true });
  }

  const sellerIds: string[] = [];
  for (const seller of seedSellers.slice(0, 3)) {
    const email = `${seller.slug}@alfarez.local`;
    const userRef = db.collection("users").doc(`seller-${seller.slug}`);
    sellerIds.push(userRef.id);
    await userRef.set({
      id: userRef.id,
      username: seller.slug,
      usernameLower: lower(seller.slug),
      email,
      emailLower: lower(email),
      passwordHash: await hashPassword("seller12345"),
      role: "SELLER",
      status: "ACTIVE",
      mustChangePassword: false,
      createdAt,
      updatedAt: createdAt,
    }, { merge: true });
    await db.collection("wallets").doc(userRef.id).set({ userId: userRef.id, balanceAvailable: 1250000, balanceHold: 540000, isLocked: false, createdAt, updatedAt: createdAt }, { merge: true });
    await db.collection("seller_profiles").doc(userRef.id).set({
      userId: userRef.id,
      storeName: seller.name,
      slug: seller.slug,
      description: seller.description,
      gamesSold: seller.games,
      ratingAverage: seller.rating,
      ratingCount: seller.sales,
      successfulTransactions: seller.sales,
      isVerified: seller.verified,
      status: "APPROVED",
      createdAt,
      updatedAt: createdAt,
    }, { merge: true });
  }

  for (const [index, product] of seedProducts.entries()) {
    const sellerId = sellerIds[index % sellerIds.length] ?? adminRef.id;
    const sellerProfile = await db.collection("seller_profiles").doc(sellerId).get();
    await db.collection("products").doc(product.slug).set({
      id: product.slug,
      sellerId,
      gameId: product.gameSlug,
      gameSlug: product.gameSlug,
      game: { id: product.gameSlug, name: product.game, slug: product.gameSlug },
      seller: { username: product.sellerSlug, sellerProfile: sellerProfile.data() ?? null },
      title: product.title,
      slug: product.slug,
      price: product.price,
      status: product.status === "Ready" ? "READY" : "SOLD",
      rank: product.rank,
      level: product.level,
      server: product.server,
      platform: product.platform,
      bindInfo: product.bind,
      description: product.description,
      securityNote: "Demi keamanan, transaksi wajib lewat saldo Alfarezel Market.",
      images: [{ url: `/visuals/product-${(product.imageKey % 6) + 1}.png`, sortOrder: 0, alt: product.title }],
      attributes: product.tags.map((tag) => ({ key: "Tag", value: tag })),
      soldCount: product.sold,
      isVerified: product.verified,
      isFeatured: index < 6,
      createdAt,
      updatedAt: createdAt,
    }, { merge: true });
  }

  await db.collection("admin_logs").add({
    actorId: adminRef.id,
    action: "FIREBASE_SEED",
    entity: "system",
    metadata: { products: seedProducts.length, games: seedGames.length },
    createdAt,
  });
}
