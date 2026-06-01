import type { Metadata } from "next";
import { Banknote, Wallet } from "lucide-react";
import { Badge } from "@/components/badge";
import { BackLink } from "@/components/back-link";
import { WithdrawForm } from "@/components/flow-forms";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Withdraw Seller",
  description: "Ajukan withdraw saldo penjualan seller Alfarezel Market dengan fee transparan.",
};

export default function WithdrawPage() {
  const amount = 250000;
  const fee = 4000;
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <BackLink href="/dashboard/seller" label="Kembali ke dashboard seller" />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Withdraw saldo seller</h1>
            <p className="text-sm text-slate-500">Withdraw diproses manual admin setelah saldo tersedia dan data tujuan valid.</p>
          </div>
        </div>
        <WithdrawForm />
      </section>
      <aside className="space-y-5">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">Saldo tersedia</p>
              <p className="text-2xl font-black text-slate-950">{formatIDR(1250000)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Row label="Nominal" value={formatIDR(amount)} />
            <Row label="Fee withdraw" value={formatIDR(fee)} />
            <Row label="Total diterima" value={formatIDR(amount - fee)} strong />
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">Status withdraw</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Menunggu admin", "Diproses", "Berhasil", "Ditolak"].map((status) => (
              <Badge key={status} tone={status === "Berhasil" ? "green" : status === "Ditolak" ? "red" : "orange"}>{status}</Badge>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-black text-slate-950" : "font-bold text-slate-700"}>{value}</span>
    </div>
  );
}
