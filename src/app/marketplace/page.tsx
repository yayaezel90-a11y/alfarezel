import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/badge";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { games, products } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Marketplace Akun Game",
  description: "Cari akun game verified seller dengan filter harga, rank, server, platform, status ready/sold, dan sistem escrow.",
};

export default function MarketplacePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Marketplace"
        title="Cari akun game yang siap transaksi"
        description="Filter produk berdasarkan game, harga, rank, server, platform, status ready/sold, dan verified seller."
      />

      <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-500" />
            <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Cari akun game, rank, skin, seller..." />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
            <SlidersHorizontal className="h-4 w-4" />
            Sort terbaru
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
            <Filter className="h-4 w-4" />
            Terapkan
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <FilterBox title="Game">
            {games.map((game) => (
              <Link key={game.slug} href={`/game/${game.slug}`} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                {game.name}
                <Badge tone="slate">{products.filter((product) => product.gameSlug === game.slug).length}</Badge>
              </Link>
            ))}
          </FilterBox>
          <FilterBox title="Harga">
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Min" />
              <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Max" />
            </div>
          </FilterBox>
          <FilterBox title="Filter cepat">
            {["Ready", "Sold", "Verified seller", "Rank tinggi", "Level tinggi", "Server Indonesia", "PC", "Android/iOS"].map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                {item}
              </label>
            ))}
          </FilterBox>
          <FilterBox title="Sort">
            {["Terbaru", "Termurah", "Termahal", "Terlaris", "Rating seller"].map((item) => (
              <button key={item} className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100">
                {item}
              </button>
            ))}
          </FilterBox>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-600">{products.length} produk ditemukan</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">Ready</Badge>
              <Badge tone="blue">Verified seller</Badge>
              <Badge tone="orange">Escrow aktif</Badge>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map((page) => (
              <button key={page} className={page === 1 ? "h-10 w-10 rounded-full bg-blue-600 text-sm font-black text-white" : "h-10 w-10 rounded-full border border-slate-200 bg-white text-sm font-black text-slate-600 hover:border-blue-200 hover:text-blue-700"}>
                {page}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 font-black text-slate-950">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
