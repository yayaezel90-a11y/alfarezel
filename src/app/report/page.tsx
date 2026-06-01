import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { ReportForm } from "@/components/flow-forms";

export const metadata: Metadata = {
  title: "Report Transaksi",
  description: "Laporkan produk, seller, buyer, order, chat, atau bukti transaksi bermasalah.",
};

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <BackLink href="/dashboard/buyer" label="Kembali ke dashboard" />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Buka report / dispute</h1>
            <p className="text-sm text-slate-500">Ada kendala? Buka report biar admin bantu cek.</p>
          </div>
        </div>
        <ReportForm />
      </section>
    </main>
  );
}
