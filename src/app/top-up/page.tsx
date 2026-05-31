import type { Metadata } from "next";
import { CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/badge";
import { TopupForm } from "@/components/flow-forms";
import { adminNumber } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Top Up Saldo",
  description: "Top up saldo manual Alfarezel Market via DANA dan GoPay dengan fee transparan.",
};

export default function TopUpPage() {
  const amount = 50000;
  const fee = 1000;
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Top up saldo manual</h1>
            <p className="text-sm text-slate-500">Transfer sesuai total pembayaran, upload bukti, lalu tunggu admin cek ya.</p>
          </div>
        </div>
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Nomor admin</p>
            <p className="mt-1 text-2xl font-black text-blue-700">{adminNumber}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Transfer sesuai total pembayaran ke nomor admin {adminNumber} via DANA/GoPay. Setelah transfer, upload bukti pembayaran dan tunggu admin melakukan verifikasi.
            </p>
        </div>
        <TopupForm />
      </section>

      <aside className="space-y-5">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-black text-slate-950">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Ringkasan fee
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Nominal top up" value={formatIDR(amount)} />
            <Row label="Fee admin" value={formatIDR(fee)} />
            <Row label="Total transfer" value={formatIDR(amount + fee)} strong />
            <Row label="Saldo masuk" value={formatIDR(amount)} />
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">Status top up</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Menunggu pembayaran", "Menunggu konfirmasi admin", "Berhasil", "Ditolak", "Kadaluarsa"].map((status) => (
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
