import type { Metadata } from "next";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/badge";
import { formatIDR } from "@/lib/invoice";

export const metadata: Metadata = {
  title: "Invoice",
  description: "Detail invoice transaksi Alfarezel Market.",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-700">Invoice</p>
              <h1 className="text-2xl font-black text-slate-950">{id}</h1>
            </div>
          </div>
          <Badge tone="green">Dibayar</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Tanggal" value="1 Juni 2026, 03:30 WIB" />
          <Info label="User" value="Buyer" />
          <Info label="Produk" value="Akun Valorant Platinum Region APAC" />
          <Info label="Seller" value="Reza Store ID" />
          <Info label="Nominal" value={formatIDR(540000)} />
          <Info label="Fee" value={formatIDR(16200)} />
          <Info label="Total" value={formatIDR(556200)} />
          <Info label="Status" value="Escrow held" />
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-black text-slate-950">Timeline transaksi</h2>
          <div className="mt-4 space-y-4">
            {["Invoice dibuat", "Saldo buyer dipotong", "Dana masuk escrow", "Chat transaksi dibuat", "Menunggu seller kirim data akun"].map((item, index) => (
              <div key={item} className="flex gap-3">
                {index < 4 ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <Clock className="mt-0.5 h-5 w-5 text-orange-500" />}
                <div>
                  <p className="text-sm font-black text-slate-950">{item}</p>
                  <p className="text-xs text-slate-500">03:{30 + index} WIB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
