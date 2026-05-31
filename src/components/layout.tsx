import Link from "next/link";
import { Bell, HelpCircle, Home, Menu, MessageCircle, Search, ShieldCheck, ShoppingBag, UserRound, Wallet } from "lucide-react";

const navItems = [
  ["Marketplace", "/marketplace"],
  ["Kategori Game", "/game/mobile-legends"],
  ["Cara Kerja", "/#cara-kerja"],
  ["Top Up", "/top-up"],
  ["Join Seller", "/join-seller"],
  ["Bantuan", "/bantuan"],
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">AM</div>
          <div className="leading-tight">
            <p className="font-black text-slate-950">Alfarezel Market</p>
            <p className="text-xs font-semibold text-slate-500">alfarez.com</p>
          </div>
        </Link>
        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/marketplace" className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700">
            <Search className="h-4 w-4" />
            Cari akun
          </Link>
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            Login
          </Link>
          <Link href="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:scale-105 hover:bg-blue-700">
            Register
          </Link>
        </div>
        <button className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_.8fr_.8fr_.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">AM</div>
            <div>
              <p className="font-black">Alfarezel Market</p>
              <p className="text-sm text-slate-400">Marketplace akun game aman untuk user Indonesia.</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Semua transaksi wajib lewat saldo Alfarezel Market, escrow, invoice, chat transaksi, dan report agar buyer dan seller sama-sama aman.
          </p>
        </div>
        <FooterColumn title="Marketplace" links={[["Belanja akun", "/marketplace"], ["Top up saldo", "/top-up"], ["Join seller", "/join-seller"], ["Voucher", "/marketplace?voucher=true"]]} />
        <FooterColumn title="Bantuan" links={[["FAQ", "/bantuan"], ["Rules marketplace", "/rules"], ["Report transaksi", "/report"], ["Kontak admin", "/bantuan#kontak"]]} />
        <FooterColumn title="Dashboard" links={[["Buyer", "/dashboard/buyer"], ["Seller", "/dashboard/seller"], ["Admin", "/dashboard/admin"], ["Invoice", "/invoice/ORDER-20260601-DEMO"]]} />
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© 2026 Alfarezel Market · alfarez.com</div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-4 font-bold">{title}</p>
      <div className="space-y-3">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block text-sm text-slate-400 hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const items = [
    ["Home", "/", Home],
    ["Market", "/marketplace", ShoppingBag],
    ["Saldo", "/top-up", Wallet],
    ["Chat", "/chat/ORDER-20260601-DEMO", MessageCircle],
    ["Akun", "/dashboard/buyer", UserRound],
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(([label, href, Icon]) => (
          <Link key={href as string} href={href as string} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-700">
            <Icon className="h-5 w-5" />
            {label as string}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function FloatingChatButton() {
  return (
    <Link
      href="/chat/ORDER-20260601-DEMO"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition hover:scale-105 md:bottom-6"
      aria-label="Buka chat transaksi"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}

export function SecurityStrip() {
  return (
    <div className="border-y border-emerald-200 bg-emerald-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm font-semibold text-emerald-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.
        </span>
        <Link href="/rules" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900">
          <HelpCircle className="h-4 w-4" />
          Baca aturan
        </Link>
      </div>
    </div>
  );
}

export function NotificationBell() {
  return (
    <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600" aria-label="Notifikasi">
      <Bell className="h-5 w-5" />
      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
    </button>
  );
}
