import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldAlert, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";
import { Badge } from "@/components/badge";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { games, getGame, productsByGame, sellers } from "@/lib/demo-data";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  return {
    title: game ? `Akun ${game.name}` : "Kategori Game",
    description: game?.description,
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  const list = productsByGame(slug);

  return (
    <main>
      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
          <div className="self-center">
            <Badge tone="white" className="mb-5">
              Kategori game
            </Badge>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Akun {game.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{game.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {game.popularRanks.map((rank) => (
                <Badge key={rank} tone="white">{rank}</Badge>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#produk" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white hover:scale-105 hover:bg-blue-500">
                Lihat Produk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/rules" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white hover:bg-white/15">
                Tips aman
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <ProductVisual game={game.name} title={`Banner ${game.name}`} imageKey={games.findIndex((item) => item.slug === game.slug) + 2} className="shadow-2xl" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 font-black text-slate-950">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Filter {game.name}
            </div>
            <div className="space-y-2">
              {game.filters.map((filter) => (
                <label key={filter} className="block">
                  <span className="mb-1 block text-xs font-bold text-slate-500">{filter}</span>
                  <select className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400">
                    <option>Semua</option>
                    {game.popularRanks.map((rank) => (
                      <option key={rank}>{rank}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 font-black text-orange-900">
              <ShieldAlert className="h-5 w-5" />
              Tips aman
            </div>
            <div className="mt-3 space-y-3">
              {game.tips.map((tip) => (
                <p key={tip} className="text-sm leading-6 text-orange-900">{tip}</p>
              ))}
            </div>
          </div>
        </aside>

        <section id="produk">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Produk {game.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{list.length} produk aktif di kategori ini.</p>
            </div>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
              Semua marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {list.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-black text-slate-950">Produk belum tersedia</p>
              <p className="mt-2 text-sm text-slate-500">Kategori ini siap menerima listing seller.</p>
            </div>
          )}

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Seller aktif di {game.name}</h3>
              <div className="mt-4 space-y-3">
                {sellers.slice(0, 3).map((seller) => (
                  <Link key={seller.slug} href={`/seller/${seller.slug}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">{seller.avatar}</div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{seller.name}</p>
                        <p className="text-xs text-slate-500">{seller.sales} transaksi sukses</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-orange-600">
                      <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                      {seller.rating}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">FAQ {game.name}</h3>
              <div className="mt-4 space-y-3">
                {[
                  [`Apa yang perlu dicek sebelum beli akun ${game.name}?`, "Cek bind akun, screenshot terbaru, riwayat akun, dan jangan konfirmasi selesai sebelum berhasil login."],
                  ["Kalau akun tidak sesuai deskripsi?", "Buka report dari order terkait agar admin bisa menahan dana dan meminta bukti tambahan."],
                ].map(([question, answer]) => (
                  <details key={question} className="rounded-2xl bg-slate-50 p-4">
                    <summary className="cursor-pointer text-sm font-black text-slate-950">{question}</summary>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
