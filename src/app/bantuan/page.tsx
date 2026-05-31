import type { Metadata } from "next";
import { HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { adminNumber, faqs } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Bantuan",
  description: "FAQ, cara top up, cara beli akun, join seller, withdraw, report transaksi, kontak admin, dan aturan keamanan.",
};

export default function HelpPage() {
  const guides = [
    ["Cara top up", "Isi nominal, pilih DANA/GoPay, transfer ke nomor admin, upload bukti, tunggu admin verifikasi."],
    ["Cara beli akun", "Pilih produk ready, cek detail, bayar pakai saldo, dana masuk escrow, lalu cek data akun dari seller."],
    ["Cara join seller", "Isi form toko, deskripsi seller, game yang dijual, pengalaman, dan setujui aturan seller."],
    ["Cara withdraw", "Seller pilih metode DANA/GoPay/Bank Transfer, isi tujuan, lalu tunggu admin proses."],
    ["Cara report transaksi", "Buka report dari order terkait, jelaskan masalah, upload bukti, admin akan menengahi."],
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] bg-slate-950 p-8 text-white">
        <HelpCircle className="h-10 w-10 text-blue-300" />
        <h1 className="mt-5 text-4xl font-black">Pusat bantuan</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          FAQ, cara top up, cara beli akun, join seller, withdraw, report transaksi, kontak admin, dan aturan keamanan.
        </p>
      </section>
      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {guides.map(([title, text]) => (
          <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
      <section id="kontak" className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer font-black text-slate-950">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 font-black text-blue-900">
              <MessageCircle className="h-5 w-5" />
              Kontak admin
            </div>
            <p className="mt-3 text-2xl font-black text-blue-900">{adminNumber}</p>
            <p className="mt-2 text-sm leading-6 text-blue-900">Nomor ini dipakai untuk top up manual via DANA/GoPay.</p>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 font-black text-emerald-900">
              <ShieldCheck className="h-5 w-5" />
              Aturan keamanan
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-900">Semua transaksi harus lewat sistem Alfarezel Market. Jangan transfer langsung ke seller.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
