import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { DashboardShell, DataTable, MetricCard, buyerNav } from "@/components/dashboard-shell";
import { products } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Dashboard Buyer",
  description: "Dashboard buyer untuk saldo, pesanan, chat transaksi, report, wishlist, invoice, dan notifikasi.",
};

export default function BuyerDashboardPage() {
  const rows = [
    ["ORDER-20260601-A8F2", "Akun Valorant Platinum Region APAC", <Badge key="status" tone="orange">Menunggu seller</Badge>, formatIDR(556200)],
    ["ORDER-20260528-8892", "Akun ML Mythic 45 Stars", <Badge key="status" tone="green">Selesai</Badge>, formatIDR(437750)],
    ["ORDER-20260521-7781", "Akun Roblox Item Banyak", <Badge key="status" tone="red">Report aktif</Badge>, formatIDR(319300)],
  ];
  return (
    <DashboardShell title="Dashboard Buyer" subtitle="Cek saldo, order aktif, chat transaksi, report, invoice, wishlist, dan notifikasi." roleLabel="Buyer" nav={buyerNav}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Saldo tersedia" value={formatIDR(1500000)} helper="Bisa dipakai beli akun ready." tone="blue" />
        <MetricCard label="Saldo tertahan" value={formatIDR(556200)} helper="Dana escrow order aktif." tone="orange" />
        <MetricCard label="Pesanan aktif" value="3" helper="Termasuk 1 report aktif." tone="green" />
        <MetricCard label="Wishlist" value="8" helper="Produk yang kamu pantau." tone="slate" />
      </div>

      <section id="orders" className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Pesanan terbaru</h2>
          <Link href="/invoice/ORDER-20260601-A8F2" className="text-sm font-black text-blue-700">Lihat invoice</Link>
        </div>
        <DataTable headers={["Invoice", "Produk", "Status", "Total"]} rows={rows} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Chat transaksi</h2>
          <p className="mt-2 text-sm text-slate-600">Seller sedang memproses pesanan. Ada kendala? Buka report biar admin bantu cek.</p>
          <Link href="/chat/support" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
            Hubungi admin
          </Link>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Wishlist</h2>
          <div className="mt-4 space-y-3">
            {products.slice(0, 3).map((product) => (
              <Link key={product.slug} href={`/produk/${product.slug}`} className="block rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700 hover:bg-blue-50">
                {product.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
