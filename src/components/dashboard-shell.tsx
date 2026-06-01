import Link from "next/link";
import { BarChart3, Bell, FileText, Flag, Home, MessageCircle, Package, Settings, ShieldCheck, ShoppingBag, Store, Users, Wallet } from "lucide-react";
import { NotificationBell } from "@/components/layout";
import { cn } from "@/lib/utils";

const iconMap = {
  Home,
  Wallet,
  ShoppingBag,
  MessageCircle,
  Flag,
  Store,
  Package,
  Users,
  Settings,
  FileText,
  Bell,
  ShieldCheck,
  BarChart3,
};

type IconName = keyof typeof iconMap;

type DashboardShellProps = {
  title: string;
  subtitle: string;
  roleLabel: string;
  nav: { label: string; href: string; icon: IconName; active?: boolean }[];
  children: React.ReactNode;
};

export function DashboardShell({ title, subtitle, roleLabel, nav, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-5 pb-24 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="hidden max-h-[calc(100vh-96px)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:block">
          <Link href="/" className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-950 p-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">AM</div>
            <div>
              <p className="font-black">Alfarezel Market</p>
              <p className="text-xs text-slate-300">{roleLabel}</p>
            </div>
          </Link>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                    item.active && "bg-blue-50 text-blue-700",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">{roleLabel}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link href="/dashboard/buyer/settings" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
                Pengaturan
              </Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, helper, tone = "blue" }: { label: string; value: string; helper: string; tone?: "blue" | "green" | "orange" | "red" | "slate" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={cn("mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold", toneClass)}>{label}</div>
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 align-top text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const buyerNav = [
  { label: "Ringkasan", href: "/dashboard/buyer", icon: "Home" as const, active: true },
  { label: "Saldo & Top Up", href: "/top-up", icon: "Wallet" as const },
  { label: "Pesanan", href: "/dashboard/buyer#orders", icon: "ShoppingBag" as const },
  { label: "Chat Bantuan", href: "/chat/support", icon: "MessageCircle" as const },
  { label: "Report", href: "/report", icon: "Flag" as const },
  { label: "Invoice", href: "/dashboard/buyer#orders", icon: "FileText" as const },
];

export const sellerNav = [
  { label: "Ringkasan", href: "/dashboard/seller", icon: "Home" as const, active: true },
  { label: "Produk", href: "/dashboard/seller#products", icon: "Package" as const },
  { label: "Pesanan Masuk", href: "/dashboard/seller#orders", icon: "ShoppingBag" as const },
  { label: "Chat Support", href: "/chat/support", icon: "MessageCircle" as const },
  { label: "Withdraw", href: "/withdraw", icon: "Wallet" as const },
  { label: "Toko", href: "/seller/reza-store-id", icon: "Store" as const },
];

const adminBaseNav = [
  { label: "Overview", slug: "", icon: "BarChart3" as const },
  { label: "User Management", slug: "users", icon: "Users" as const },
  { label: "Seller Management", slug: "sellers", icon: "Store" as const },
  { label: "Product Management", slug: "products", icon: "Package" as const },
  { label: "Order Management", slug: "orders", icon: "ShoppingBag" as const },
  { label: "Top Up Management", slug: "topups", icon: "Wallet" as const },
  { label: "Withdraw Management", slug: "withdraws", icon: "Wallet" as const },
  { label: "Wallet Management", slug: "wallets", icon: "Wallet" as const },
  { label: "Report & Dispute", slug: "reports", icon: "Flag" as const },
  { label: "Chat Monitoring", slug: "chats", icon: "MessageCircle" as const },
  { label: "Game Categories", slug: "games", icon: "Package" as const },
  { label: "Banner & Promotion", slug: "banners", icon: "Bell" as const },
  { label: "Voucher Management", slug: "vouchers", icon: "FileText" as const },
  { label: "Fee Settings", slug: "fees", icon: "Settings" as const },
  { label: "Platform Settings", slug: "settings", icon: "Settings" as const },
  { label: "Admin Logs", slug: "logs", icon: "FileText" as const },
  { label: "Security Center", slug: "security", icon: "ShieldCheck" as const },
  { label: "CMS Pages", slug: "cms", icon: "FileText" as const },
  { label: "Notification Center", slug: "notifications", icon: "Bell" as const },
  { label: "Backup / Export", slug: "backup", icon: "FileText" as const },
];

export function adminNav(activeSlug = "") {
  return adminBaseNav.map((item) => ({
    label: item.label,
    href: item.slug ? `/dashboard/admin/${item.slug}` : "/dashboard/admin",
    icon: item.icon,
    active: item.slug === activeSlug,
  }));
}
