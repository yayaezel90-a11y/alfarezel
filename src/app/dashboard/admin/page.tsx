import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { DashboardShell, DataTable, MetricCard, adminNav } from "@/components/dashboard-shell";
import { adminMenus, products, sellers } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel lengkap untuk user, seller, produk, order, top up, withdraw, wallet, report, chat, fee, security, dan logs.",
};

export default function AdminDashboardPage() {
  const productRows = products.slice(0, 6).map((product) => [
    product.title,
    product.game,
    product.seller,
    <Badge key={product.slug} tone={product.status === "Ready" ? "green" : "red"}>{product.status}</Badge>,
    formatIDR(product.price),
  ]);

  return (
    <DashboardShell title="Admin Dashboard" subtitle="Pantau GMV, top up, withdraw, report, seller review, produk pending, security flag, dan audit log." roleLabel="Super Admin" nav={adminNav}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total user" value="1.284" helper="Buyer, seller, admin aktif." tone="blue" />
        <MetricCard label="Total GMV" value={formatIDR(185430000)} helper="Semua transaksi sukses." tone="green" />
        <MetricCard label="Top up" value={formatIDR(76450000)} helper="Fee top up tercatat." tone="orange" />
        <MetricCard label="Report aktif" value="18" helper="Butuh review admin." tone="red" />
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Grafik transaksi harian</h2>
          <div className="mt-5 flex h-64 items-end gap-3 rounded-2xl bg-slate-50 p-4">
            {[40, 62, 48, 78, 90, 70, 96, 84, 110, 105, 120, 132].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-blue-600" style={{ height }} />
                <span className="text-[11px] font-bold text-slate-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Game terlaris</h2>
          <div className="mt-5 space-y-4">
            {["Mobile Legends", "Free Fire", "Valorant", "Genshin Impact"].map((game, index) => (
              <div key={game}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{game}</span>
                  <span className="text-slate-500">{92 - index * 14}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${92 - index * 14}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Seller menunggu review", "7", "Approve/reject join seller"],
          ["Produk pending review", "23", "Cek produk mencurigakan"],
          ["Withdraw menunggu admin", "14", "Upload bukti transfer"],
          ["Security flags", "31", "Chat mencurigakan dan failed login"],
        ].map(([title, value, helper]) => (
          <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section id="products" className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Product Management</h2>
          <Link href="/marketplace" className="text-sm font-black text-blue-700">Lihat marketplace</Link>
        </div>
        <DataTable headers={["Produk", "Game", "Seller", "Status", "Harga"]} rows={productRows} />
      </section>

      <section id="sellers" className="mt-6 grid gap-5 lg:grid-cols-3">
        {sellers.map((seller) => (
          <div key={seller.slug} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{seller.avatar}</div>
              <div>
                <p className="font-black text-slate-950">{seller.name}</p>
                <p className="text-sm text-slate-500">{seller.rating}/5 · {seller.sales} sales</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="green">Verified</Badge>
              <Badge tone="blue">Approved</Badge>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Menu admin lengkap</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {adminMenus.map((menu) => (
            <div key={menu} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{menu}</div>
          ))}
        </div>
      </section>

      <section id="fees" className="mt-6 grid gap-5 lg:grid-cols-3">
        {[
          ["Fee top up", "2% + Rp1.000", "Minimal top up Rp10.000"],
          ["Fee withdraw", "1% + Rp1.500", "Minimal withdraw Rp25.000"],
          ["Fee platform", "3%", "Masuk pendapatan platform"],
        ].map(([title, value, helper]) => (
          <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section id="security" className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Security Center</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Login history", "Suspicious activity", "Blacklist nomor", "Blacklist email", "Blacklist device/IP sederhana", "Rate limit login", "Failed login attempts", "Admin action logs", "Export logs"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 p-3 text-sm font-bold text-slate-700">{item}</div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
