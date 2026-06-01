import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/badge";
import { RealtimeChat } from "@/components/realtime-chat";
import { getCurrentUser } from "@/lib/auth";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseListChatMessages } from "@/lib/firebase-store";

export const metadata: Metadata = {
  title: "Chat Transaksi",
  description: "Chat transaksi khusus order dengan buyer, seller, admin mediator, lampiran bukti, dan pesan sistem otomatis.",
};

export default async function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  const messages =
    user && isFirebaseBackend()
      ? await firebaseListChatMessages(orderId, user).catch(() => [])
      : [];
  const roomTitle = orderId === "support" ? "Bantuan admin" : orderId.startsWith("seller-") ? "Chat seller" : orderId;
  const isOrderRoom = !orderId.startsWith("seller-") && orderId !== "support";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/dashboard/buyer" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
          Kembali ke dashboard
        </Link>
      </div>
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">{isOrderRoom ? "Chat transaksi" : "Chat marketplace"}</p>
              <h1 className="text-2xl font-black text-slate-950">{roomTitle}</h1>
              <p className="mt-1 text-sm text-slate-500">Buyer, seller, dan admin mediator saat diperlukan</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">Chat tercatat</Badge>
              {isOrderRoom ? <Badge tone="orange">Escrow room</Badge> : <Badge tone="blue">Support room</Badge>}
              <Badge tone="blue">Admin dapat join</Badge>
            </div>
          </div>
        </header>
        <div className="grid min-h-[620px] lg:grid-cols-[1fr_300px]">
          <RealtimeChat
            orderId={orderId}
            initialMessages={messages.map((message) => ({
              type: String(message.type ?? "system") as "buyer" | "seller" | "system",
              body: String(message.body ?? ""),
              createdAt: typeof message.createdAt === "string" ? message.createdAt : undefined,
              sender: (message.sender as { username?: string; role?: string } | undefined) ?? null,
            }))}
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
              <p className="mt-2 text-sm leading-6 text-orange-900">Kata seperti transfer langsung, di luar web, atau WA aja bayar langsung akan diberi warning otomatis.</p>
            </div>
            <Link href="/report" className="mt-4 block w-full rounded-full border border-red-200 px-4 py-3 text-center text-sm font-black text-red-600 hover:bg-red-50">
              Panggil admin / report
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
