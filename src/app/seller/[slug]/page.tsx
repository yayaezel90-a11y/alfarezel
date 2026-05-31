import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, MessageCircle, ShieldCheck, Star, Verified } from "lucide-react";
import { Badge } from "@/components/badge";
import { ProductCard } from "@/components/product-card";
import { products, sellers } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Profil Seller",
  description: "Profil seller Alfarezel Market dengan badge verified, rating, produk aktif, review buyer, dan tombol report.",
};

export function generateStaticParams() {
  return sellers.map((seller) => ({ slug: seller.slug }));
}

export default async function SellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = sellers.find((item) => item.slug === slug);
  if (!seller) notFound();
  const sellerProducts = products.filter((product) => product.sellerSlug === seller.slug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-xl font-black text-slate-950">{seller.avatar}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black">{seller.name}</h1>
                {seller.verified ? <Verified className="h-7 w-7 fill-emerald-500 text-white" /> : null}
              </div>
              <p className="mt-2 text-sm text-slate-300">Bergabung {seller.joined} · {seller.sales} transaksi sukses</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="white">Verified Seller</Badge>
                <Badge tone="white">{seller.rating}/5 rating</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/chat/ORDER-20260601-DEMO" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500">
              <MessageCircle className="h-4 w-4" />
              Chat seller
            </Link>
            <Link href="/report" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
              <Flag className="h-4 w-4" />
              Report seller
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-950">Deskripsi seller</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{seller.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {seller.games.map((game) => <Badge key={game} tone="blue">{game}</Badge>)}
            </div>
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 font-black text-emerald-900">
              <ShieldCheck className="h-5 w-5" />
              Riwayat aman
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-900">Seller ini sudah diverifikasi admin. Tetap lakukan transaksi hanya lewat saldo Alfarezel Market.</p>
          </div>
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Produk aktif</h2>
              <p className="mt-1 text-sm text-slate-500">{sellerProducts.length} produk dari seller ini.</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-black text-orange-600">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
              {seller.rating}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sellerProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Review buyer</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["Seller ramah, data akun sesuai. Proses pindah bind dibantu sampai aman.", "Transaksi cepat dan admin hold bikin lebih tenang."].map((review) => (
                <div key={review} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  “{review}”
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
