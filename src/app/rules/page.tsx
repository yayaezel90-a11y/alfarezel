import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Rules Marketplace",
  description: "Aturan marketplace Alfarezel Market untuk buyer, seller, transaksi, report, dan keamanan anti scam.",
};

export default function RulesPage() {
  const rules = [
    "Dilarang menjual akun hasil hack, phishing, cracking, carding, atau akun curian.",
    "Seller wajib memberi informasi akun dengan jujur.",
    "Buyer wajib membaca deskripsi sebelum membeli.",
    "Top up dan withdraw diproses manual oleh admin.",
    "Dana transaksi bisa ditahan jika ada report.",
    "Admin berhak menolak transaksi mencurigakan.",
    "Admin berhak suspend akun yang melanggar.",
    "Semua transaksi harus lewat sistem Alfarezel Market.",
    "Dilarang ajak transaksi di luar platform.",
    "Jika transaksi di luar platform, risiko ditanggung sendiri.",
    "Report palsu bisa membuat akun dibatasi.",
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Rules marketplace</h1>
            <p className="text-sm text-slate-500">Aturan ini wajib dipatuhi buyer, seller, admin, dan super admin.</p>
          </div>
        </div>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
              {rule}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
