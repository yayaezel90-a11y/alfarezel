import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { DashboardShell, DataTable, MetricCard, sellerNav } from "@/components/dashboard-shell";
import { products } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Dashboard Seller",
  description: "Dashboard seller untuk produk, pesanan masuk, chat buyer, withdraw, rating, review, dan statistik toko.",
};

export default function SellerDashboardPage() {
  const rows = products.slice(0, 5).map((product) => [
    product.title,
    product.game,
    <Badge key={product.slug} tone={product.status === "Ready" ? "green" : "red"}>{product.status}</Badge>,
    formatIDR(product.price),
  ]);

  return (
    <DashboardShell title="Dashboard Seller" subtitle="Kelola produk, pesanan masuk, chat buyer, report/dispute, statistik toko, dan withdraw saldo." roleLabel="Seller" nav={sellerNav}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Saldo tersedia" value={formatIDR(1250000)} helper="Siap diajukan withdraw." tone="green" />
        <MetricCard label="Saldo tertahan" value={formatIDR(540000)} helper="Escrow dari order aktif." tone="orange" />
        <MetricCard label="Total penjualan" value={formatIDR(12650000)} helper="GMV toko bulan ini." tone="blue" />
        <MetricCard label="Rating toko" value="4.9/5" helper="Dari 126 transaksi sukses." tone="slate" />
      </div>

      <section id="products" className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Produk seller</h2>
          <Link href="/dashboard/seller/tambah-produk" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
            Tambah produk
          </Link>
        </div>
        <DataTable headers={["Produk", "Game", "Status", "Harga"]} rows={rows} />
      </section>

      <section id="orders" className="mt-6 grid gap-5 lg:grid-cols-3">
        {["Pesanan masuk", "Chat buyer", "Report/dispute"].map((title, index) => (
          <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <Badge tone={index === 2 ? "red" : "blue"}>{index === 2 ? "Perlu dicek" : "Aktif"}</Badge>
            <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {index === 0 ? "Seller bisa menandai pesanan diproses dan submit data akun lewat sistem aman." : index === 1 ? "Balas chat buyer dan upload bukti jika diperlukan." : "Admin dapat masuk sebagai mediator jika buyer membuka report."}
            </p>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
