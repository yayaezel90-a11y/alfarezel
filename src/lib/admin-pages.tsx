import Link from "next/link";
import { Badge } from "@/components/badge";
import { DataTable } from "@/components/dashboard-shell";
import {
  AdminDocumentForm,
  FeeSettingForm,
  GameCategoryForm,
  PlatformSettingForm,
  ProductReviewForm,
  ReportResolveForm,
  SellerDecisionForm,
  TopupDecisionForm,
  WalletAdjustForm,
  WithdrawDecisionForm,
} from "@/components/admin-action-forms";
import { AdminVisualUploadCard } from "@/components/upload-controls";

export type AdminSection = {
  slug: string;
  title: string;
  subtitle: string;
  collection: string;
  headers: string[];
  actionTitle: string;
  action: React.ReactNode;
};

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return new Intl.NumberFormat("id-ID").format(value);
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
  return String(value);
}

export function rowsFor(section: AdminSection, records: Record<string, unknown>[]) {
  return records.map((record) => {
    if (section.slug === "users") {
      return [
        <span key="user" className="font-black text-slate-950">{valueText(record.username ?? record.email)}</span>,
        valueText(record.email),
        <Badge key="role" tone={record.role === "SUPER_ADMIN" ? "blue" : record.role === "SELLER" ? "green" : "slate"}>{valueText(record.role)}</Badge>,
        <Badge key="status" tone={record.status === "ACTIVE" ? "green" : "red"}>{valueText(record.status)}</Badge>,
        valueText(record.id),
      ];
    }
    if (section.slug === "sellers") {
      return [valueText(record.storeName ?? record.userId), valueText(record.userId ?? record.id), <Badge key="status" tone={record.status === "APPROVED" ? "green" : "orange"}>{valueText(record.status)}</Badge>, valueText(record.isVerified), valueText(record.ratingAverage)];
    }
    if (section.slug === "products") {
      return [valueText(record.title ?? record.id), valueText(record.gameSlug), valueText(record.sellerId), <Badge key="status" tone={record.status === "READY" ? "green" : record.status === "SOLD" ? "red" : "orange"}>{valueText(record.status)}</Badge>, valueText(record.price)];
    }
    if (section.slug === "orders") {
      return [valueText(record.invoiceId ?? record.id), valueText(record.buyerId), valueText(record.sellerId), <Badge key="status" tone={record.status === "COMPLETED" ? "green" : "orange"}>{valueText(record.status)}</Badge>, valueText(record.totalPaid)];
    }
    if (section.slug === "topups") {
      return [valueText(record.invoiceId ?? record.id), valueText(record.userId), valueText(record.amount), valueText(record.fee), <Badge key="status" tone={record.status === "SUCCESS" ? "green" : record.status === "REJECTED" ? "red" : "orange"}>{valueText(record.status)}</Badge>];
    }
    if (section.slug === "withdraws") {
      return [valueText(record.invoiceId ?? record.id), valueText(record.sellerId), valueText(record.amount), valueText(record.totalReceived), <Badge key="status" tone={record.status === "SUCCESS" ? "green" : record.status === "REJECTED" ? "red" : "orange"}>{valueText(record.status)}</Badge>];
    }
    if (section.slug === "reports") {
      return [valueText(record.reason ?? record.type), valueText(record.reporterId), valueText(record.orderId), <Badge key="status" tone={record.status === "RESOLVED" ? "green" : "red"}>{valueText(record.status)}</Badge>, valueText(record.id)];
    }
    return section.headers.map((header) => {
      const key = header.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase());
      return valueText(record[key] ?? record[header] ?? record.id);
    });
  });
}

export function AdminSectionContent({ section, records }: { section: AdminSection; records: Record<string, unknown>[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Data {section.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{records.length} data terbaru dari Firestore.</p>
          </div>
          <Link href="/dashboard/admin" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
            Kembali overview
          </Link>
        </div>
        <DataTable headers={section.headers} rows={rowsFor(section, records)} />
      </section>
      <aside className="self-start rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">{section.actionTitle}</h2>
        <p className="mb-4 mt-2 text-sm leading-6 text-slate-500">Semua aksi admin dicatat agar keputusan bisa diaudit.</p>
        {section.action}
      </aside>
    </div>
  );
}

export const adminSections: Record<string, AdminSection> = {
  users: {
    slug: "users",
    title: "User Management",
    subtitle: "Cari user, cek role/status, suspend, reset, dan koreksi saldo dengan alasan wajib.",
    collection: "users",
    headers: ["User", "Email", "Role", "Status", "ID"],
    actionTitle: "Edit saldo user",
    action: <WalletAdjustForm />,
  },
  sellers: {
    slug: "sellers",
    title: "Seller Management",
    subtitle: "Approve, reject, verifikasi, suspend seller, dan catat keputusan admin.",
    collection: "seller_profiles",
    headers: ["Toko", "User ID", "Status", "Verified", "Rating"],
    actionTitle: "Keputusan seller",
    action: <SellerDecisionForm />,
  },
  products: {
    slug: "products",
    title: "Product Management",
    subtitle: "Review produk, tandai featured, hide, reject, dan cek listing mencurigakan.",
    collection: "products",
    headers: ["Produk", "Game", "Seller", "Status", "Harga"],
    actionTitle: "Review produk",
    action: <ProductReviewForm />,
  },
  orders: {
    slug: "orders",
    title: "Order Management",
    subtitle: "Pantau invoice, buyer, seller, status escrow, refund, release, dan hold transaksi.",
    collection: "orders",
    headers: ["Invoice", "Buyer", "Seller", "Status", "Total"],
    actionTitle: "Resolve report/order",
    action: <ReportResolveForm />,
  },
  topups: {
    slug: "topups",
    title: "Top Up Management",
    subtitle: "Approve atau reject top up manual DANA/GoPay dan catat fee platform.",
    collection: "topup_requests",
    headers: ["Invoice", "User", "Nominal", "Fee", "Status"],
    actionTitle: "Proses top up",
    action: <TopupDecisionForm />,
  },
  withdraws: {
    slug: "withdraws",
    title: "Withdraw Management",
    subtitle: "Approve/reject withdraw seller, upload bukti transfer, dan catat fee withdraw.",
    collection: "withdraw_requests",
    headers: ["Invoice", "Seller", "Nominal", "Diterima", "Status"],
    actionTitle: "Proses withdraw",
    action: <WithdrawDecisionForm />,
  },
  wallets: {
    slug: "wallets",
    title: "Wallet Management",
    subtitle: "Lihat saldo tersedia, saldo hold, mutasi saldo, lock/unlock, dan transaksi mencurigakan.",
    collection: "wallets",
    headers: ["ID", "UserId", "BalanceAvailable", "BalanceHold", "IsLocked"],
    actionTitle: "Penyesuaian saldo",
    action: <WalletAdjustForm />,
  },
  reports: {
    slug: "reports",
    title: "Report & Dispute Center",
    subtitle: "Tinjau report, minta bukti, refund buyer, release seller, atau tutup dispute.",
    collection: "reports",
    headers: ["Alasan", "Reporter", "Order", "Status", "ID"],
    actionTitle: "Keputusan report",
    action: <ReportResolveForm />,
  },
  chats: {
    slug: "chats",
    title: "Chat Monitoring",
    subtitle: "Pantau room chat yang sedang bermasalah dan masuk sebagai mediator saat diperlukan.",
    collection: "order_chats",
    headers: ["ID", "OrderId", "RoomType", "Title", "IsLocked"],
    actionTitle: "Buka support",
    action: <Link href="/chat/support" className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Masuk chat support</Link>,
  },
  games: {
    slug: "games",
    title: "Game Category Management",
    subtitle: "Tambah game, edit slug, filter khusus, icon, banner, dan status featured.",
    collection: "games",
    headers: ["ID", "Name", "Slug", "Description", "Icon"],
    actionTitle: "Tambah / edit game",
    action: <GameCategoryForm />,
  },
  banners: {
    slug: "banners",
    title: "Banner & Promotion Management",
    subtitle: "Atur banner homepage, kategori game, promo card, featured seller, dan featured product.",
    collection: "banners",
    headers: ["ID", "Title", "Body", "ImageUrl", "Status"],
    actionTitle: "Buat banner/promo",
    action: <AdminDocumentForm collection="banners" />,
  },
  vouchers: {
    slug: "vouchers",
    title: "Voucher Management",
    subtitle: "Buat voucher diskon, cashback, potongan fee, kuota, tanggal aktif, dan status.",
    collection: "vouchers",
    headers: ["ID", "Title", "Code", "Body", "Status"],
    actionTitle: "Buat voucher",
    action: <AdminDocumentForm collection="vouchers" />,
  },
  fees: {
    slug: "fees",
    title: "Fee Settings",
    subtitle: "Atur fee top up, withdraw, platform, minimal, maksimal, dan status aktif.",
    collection: "fee_settings",
    headers: ["ID", "Kind", "Percentage", "FixedFee", "IsActive"],
    actionTitle: "Edit fee",
    action: <FeeSettingForm />,
  },
  settings: {
    slug: "settings",
    title: "Platform Settings",
    subtitle: "Atur nama website, nomor admin top up, mode maintenance, review produk, rules, FAQ, dan kontak.",
    collection: "platform_settings",
    headers: ["ID", "Key", "Value", "UpdatedBy", "UpdatedAt"],
    actionTitle: "Edit platform",
    action: (
      <div className="space-y-5">
        <PlatformSettingForm />
        <AdminVisualUploadCard />
      </div>
    ),
  },
  logs: {
    slug: "logs",
    title: "Admin Logs",
    subtitle: "Semua aksi admin seperti approve top up, edit saldo, refund, release, dan edit fee.",
    collection: "admin_logs",
    headers: ["ID", "Action", "ActorId", "Entity", "EntityId"],
    actionTitle: "Audit",
    action: <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Log tersimpan otomatis setiap aksi admin.</p>,
  },
  security: {
    slug: "security",
    title: "Security Center",
    subtitle: "Login history, suspicious activity, blacklist, failed login, dan chat mencurigakan.",
    collection: "security_flags",
    headers: ["ID", "Type", "UserId", "Reason", "Severity"],
    actionTitle: "Buka log login",
    action: <Link href="/dashboard/admin/logs" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Lihat admin logs</Link>,
  },
  cms: {
    slug: "cms",
    title: "CMS Pages",
    subtitle: "Kelola konten bantuan, rules marketplace, FAQ, dan halaman informasi.",
    collection: "platform_settings",
    headers: ["ID", "Key", "Value", "UpdatedBy", "UpdatedAt"],
    actionTitle: "Update konten",
    action: <PlatformSettingForm />,
  },
  notifications: {
    slug: "notifications",
    title: "Notification Center",
    subtitle: "Buat notifikasi untuk buyer, seller, top up, withdraw, report, dan produk seller.",
    collection: "notifications",
    headers: ["ID", "Title", "Body", "UserId", "Status"],
    actionTitle: "Kirim notifikasi",
    action: <AdminDocumentForm collection="notifications" />,
  },
  backup: {
    slug: "backup",
    title: "Backup / Export Data",
    subtitle: "Pantau koleksi penting dan siapkan export data operasional dari Firestore.",
    collection: "wallet_transactions",
    headers: ["ID", "UserId", "Type", "Amount", "ReferenceId"],
    actionTitle: "Export manual",
    action: <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Gunakan Firebase Console untuk export penuh. Data mutasi saldo tetap immutable di wallet transactions.</p>,
  },
};

export const adminSectionSlugs = Object.keys(adminSections);
