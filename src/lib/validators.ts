import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const productSchema = z.object({
  title: z.string().min(10),
  gameId: z.string().min(1).optional(),
  gameSlug: z.string().min(1).optional(),
  price: z.coerce.number().int().min(10000),
  rank: z.string().optional(),
  level: z.string().optional(),
  server: z.string().optional(),
  platform: z.string().optional(),
  bindInfo: z.string().min(5),
  description: z.string().min(30),
  securityNote: z.string().optional(),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).min(1),
  attributes: z.record(z.string(), z.string()).optional(),
  legalConfirm: z.boolean().refine(Boolean, "Seller wajib menyatakan akun bukan hasil hack/phishing/cracking/curian."),
}).refine((value) => value.gameId || value.gameSlug, "Game wajib dipilih.");

export const topupSchema = z.object({
  amount: z.coerce.number().int().min(10000),
  paymentMethod: z.enum(["DANA", "GoPay"]),
  proofImage: z.string().min(1).optional(),
  userNote: z.string().max(500).optional(),
});

export const topupDecisionSchema = z.object({
  adminNote: z.string().max(500).optional(),
});

export const orderSchema = z.object({
  productId: z.string().min(1).optional(),
  productSlug: z.string().min(1).optional(),
  voucherCode: z.string().optional(),
}).refine((value) => value.productId || value.productSlug, "Produk wajib dipilih.");

export const accountDataSchema = z.object({
  accountData: z.string().min(10),
  note: z.string().max(500).optional(),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().int().min(25000),
  method: z.enum(["DANA", "GoPay", "Bank Transfer"]),
  destinationNumber: z.string().min(5),
  receiverName: z.string().min(3),
  sellerNote: z.string().max(500).optional(),
});

export const reportSchema = z.object({
  type: z.string().min(3),
  reason: z.string().min(5),
  description: z.string().min(20),
  reportedUserId: z.string().optional(),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  proofUrl: z.string().optional(),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10),
  proofUrl: z.string().optional(),
});

export const chatMessageSchema = z.object({
  body: z.string().min(1).max(2000),
  attachments: z.array(z.string()).default([]),
});

export const sellerApplicationSchema = z.object({
  storeName: z.string().min(3),
  whatsapp: z.string().min(8),
  email: z.string().email(),
  description: z.string().min(40),
  gamesSold: z.array(z.string()).min(1),
  experience: z.string().min(10),
  reason: z.string().min(10),
  socialLink: z.string().optional(),
  proofImage: z.string().optional(),
  agreeRules: z.boolean().refine(Boolean),
});
