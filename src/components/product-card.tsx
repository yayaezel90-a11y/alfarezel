import Link from "next/link";
import { Heart, Star, Store, Verified } from "lucide-react";
import type { Product } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";
import { Badge } from "@/components/badge";
import { ProductVisual } from "@/components/product-visual";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <ProductVisual game={product.game} title={product.title} imageKey={product.imageKey} />
      <div className="space-y-3 p-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/produk/${product.slug}`} className="line-clamp-2 text-sm font-bold leading-6 text-slate-950 hover:text-blue-700">
            {product.title}
          </Link>
          <button
            aria-label="Tambah ke wishlist"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:scale-105 hover:text-red-600"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={product.status === "Ready" ? "green" : "red"}>{product.status}</Badge>
          {product.verified ? <Badge tone="blue">Verified Seller</Badge> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <span>{product.rank}</span>
          <span>{product.server}</span>
          <span>{product.level}</span>
          <span>{product.platform}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-lg font-black text-slate-950">{formatIDR(product.price)}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
              {product.rating} / {product.sold} terjual
            </div>
          </div>
          <Link
            href={`/produk/${product.slug}`}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:scale-105 hover:bg-blue-700"
          >
            Detail
          </Link>
        </div>
        <Link href={`/seller/${product.sellerSlug}`} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700">
          <Store className="h-4 w-4" />
          {product.seller}
          {product.verified ? <Verified className="h-4 w-4 fill-emerald-500 text-white" /> : null}
        </Link>
      </div>
    </article>
  );
}
