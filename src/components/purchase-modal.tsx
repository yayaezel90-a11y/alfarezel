"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import type { Product } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export function PurchaseModal({ product }: { product: Product }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fee = Math.ceil(product.price * 0.03);
  const total = product.price + fee;
  const balance = 1500000;
  const insufficient = balance < total;

  async function payWithBalance() {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Pembayaran gagal diproses.");
      setMessage(data.message ?? "Pesanan kamu lagi diproses.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pembayaran gagal diproses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        disabled={product.status === "Sold"}
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {product.status === "Sold" ? "Produk ini sudah sold" : "Beli Sekarang"}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
          <div className="animate-slide-in w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-blue-700">Konfirmasi pembelian</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{product.title}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Tutup modal">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 rounded-[22px] bg-slate-50 p-4 text-sm">
              <Row label="Harga produk" value={formatIDR(product.price)} />
              <Row label="Fee layanan" value={formatIDR(fee)} />
              <Row label="Total bayar" value={formatIDR(total)} strong />
              <Row label="Saldo kamu" value={formatIDR(balance)} />
            </div>
            {insufficient ? (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900">
                Saldo kamu belum cukup. Top up dulu sebelum lanjut beli.
              </div>
            ) : (
              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
                Saya setuju transaksi diproses lewat saldo Alfarezel Market dan dana ditahan dulu di escrow sampai akun aman.
              </label>
            )}
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
            {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/top-up" className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
                Top Up Saldo
              </Link>
              <button
                disabled={insufficient || !agree || loading}
                onClick={payWithBalance}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                {loading ? "Memproses..." : "Bayar Pakai Saldo"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "text-base font-black text-slate-950" : "font-bold text-slate-800"}>{value}</span>
    </div>
  );
}
