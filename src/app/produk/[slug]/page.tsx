import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Clock, Flag, MessageCircle, ShieldCheck, Star, Store, Verified } from "lucide-react";
import { Badge } from "@/components/badge";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { PurchaseModal } from "@/components/purchase-modal";
import { getProduct, products } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product?.title ?? "Detail Produk",
    description: product?.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const similar = products.filter((item) => item.gameSlug === product.gameSlug && item.slug !== product.slug).slice(0, 4);
  const sellerProducts = products.filter((item) => item.sellerSlug === product.sellerSlug && item.slug !== product.slug).slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mb-5 text-sm font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-700">Home</Link> / <Link href="/marketplace" className="hover:text-blue-700">Marketplace</Link> / {product.game}
      </div>
      <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <ProductVisual game={product.game} title={product.title} imageKey={product.imageKey} className="rounded-[28px]" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((item) => (
              <ProductVisual key={item} game={product.game} title={`${product.title} ${item}`} imageKey={product.imageKey + item} className="rounded-[18px]" />
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone={product.status === "Ready" ? "green" : "red"}>{product.status}</Badge>
              <Badge tone="blue">{product.game}</Badge>
              {product.verified ? <Badge tone="green">Seller verified</Badge> : null}
            </div>
            <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{product.title}</h1>
            <p className="mt-4 text-3xl font-black text-slate-950">{formatIDR(product.price)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Rank / level" value={`${product.rank} · ${product.level}`} />
              <Info label="Server" value={product.server} />
              <Info label="Platform" value={product.platform} />
              <Info label="Bind akun" value={product.bind} />
            </div>
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <div className="mb-2 flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Catatan keamanan
              </div>
              Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <PurchaseModal product={product} />
              <Link href={`/chat/ORDER-20260601-DEMO`} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </div>
            <Link href="/report" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700">
              <Flag className="h-4 w-4" />
              Report produk
            </Link>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                {product.seller.split(" ").map((word) => word[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/seller/${product.sellerSlug}`} className="font-black text-slate-950 hover:text-blue-700">
                    {product.seller}
                  </Link>
                  <Verified className="h-5 w-5 fill-emerald-500 text-white" />
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  {product.rating} · {product.sold} produk terjual
                </div>
              </div>
              <Store className="h-6 w-6 text-slate-400" />
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Deskripsi lengkap</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {product.tags.map((tag) => (
              <div key={tag} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{tag}</div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 font-black text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Informasi tambahan
            </div>
            <p className="mt-2 text-sm leading-6 text-orange-900">
              Informasi login disimpan aman dan hanya muncul setelah transaksi sesuai aturan. Seller wajib menyatakan akun bukan hasil hack, phishing, cracking, atau curian.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Riwayat update</h2>
          <div className="mt-4 space-y-4">
            {["Produk dicek admin", "Screenshot diperbarui", "Harga seller disesuaikan"].map((item, index) => (
              <div key={item} className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-black text-slate-950">{item}</p>
                  <p className="text-xs text-slate-500">{index + 1} hari lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sellerProducts.length ? (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black text-slate-950">Produk lain dari seller</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sellerProducts.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-black text-slate-950">Produk serupa</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => <ProductCard key={item.slug} product={item} />)}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
