import type { Metadata } from "next";
import { Lock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/badge";
import { RealtimeChat } from "@/components/realtime-chat";

export const metadata: Metadata = {
  title: "Chat Transaksi",
  description: "Chat transaksi khusus order dengan buyer, seller, admin mediator, lampiran bukti, dan pesan sistem otomatis.",
};

export default async function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const messages = [
    ["system", "Order dibuat."],
    ["system", "Pembayaran berhasil."],
    ["seller", "Halo kak, aku proses dulu ya. Data akun akan dikirim lewat sistem aman."],
    ["system", "Seller sedang memproses pesanan."],
    ["seller", "Data akun telah dikirim. Silakan cek login dan bind akun."],
    ["buyer", "Sudah masuk. Aku cek beberapa data dulu sebelum konfirmasi selesai."],
    ["system", "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller."],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">Chat transaksi</p>
              <h1 className="text-2xl font-black text-slate-950">{orderId}</h1>
              <p className="mt-1 text-sm text-slate-500">Buyer · Seller · Admin jika dispute</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">Order dibayar</Badge>
              <Badge tone="orange">Escrow held</Badge>
              <Badge tone="blue">Admin dapat join</Badge>
            </div>
          </div>
        </header>
        <div className="grid min-h-[620px] lg:grid-cols-[1fr_300px]">
          <RealtimeChat
            orderId={orderId}
            initialMessages={messages.map(([role, body]) => ({ type: role as "buyer" | "seller" | "system", body }))}
          />
          <aside className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <Lock className="h-5 w-5" />
                Chat tercatat
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-900">Admin bisa membaca chat saat ada report dan masuk sebagai mediator.</p>
            </div>
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-2 font-black text-orange-900">
                <ShieldAlert className="h-5 w-5" />
                Warning anti scam
              </div>
              <p className="mt-2 text-sm leading-6 text-orange-900">Kata seperti “transfer langsung”, “di luar web”, atau “WA aja bayar langsung” akan diberi warning otomatis.</p>
            </div>
            <button className="mt-4 w-full rounded-full border border-red-200 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50">Panggil admin / report</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
