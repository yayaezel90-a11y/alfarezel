import type { Metadata } from "next";
import { ShieldCheck, Store } from "lucide-react";
import { JoinSellerForm } from "@/components/flow-forms";

export const metadata: Metadata = {
  title: "Join Seller",
  description: "Ajukan toko seller Alfarezel Market untuk menjual akun game lewat sistem escrow.",
};

export default function JoinSellerPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
      <section className="self-start rounded-[28px] bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
          <Store className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-black leading-tight">Bangun toko akun game yang lebih dipercaya buyer</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Seller diterima akan mendapat dashboard produk, pesanan masuk, chat buyer, withdraw saldo, rating toko, dan badge verified jika lolos review admin.
        </p>
        <div className="mt-6 space-y-3">
          {["Dana buyer ditahan dulu di escrow", "Semua chat transaksi tercatat", "Withdraw seller diproses admin", "Report dibantu mediator"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">Form join seller</h2>
        <p className="mt-2 text-sm text-slate-500">Deskripsi seller wajib supaya admin bisa menilai toko kamu dengan jelas.</p>
        <JoinSellerForm />
      </section>
    </main>
  );
}
