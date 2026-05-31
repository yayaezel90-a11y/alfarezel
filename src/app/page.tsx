import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, MessageCircle, Search, ShieldCheck, Store, Wallet } from "lucide-react";
import { Badge } from "@/components/badge";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { adminNumber, faqs, games, products, sellers, testimonials } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

export default function Home() {
  const featured = products.filter((product) => product.status === "Ready").slice(0, 8);
  const recommended = products.filter((product) => product.price > 600000).slice(0, 4);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 soft-grid opacity-20" />
        <div className="mx-auto grid min-h-[calc(100vh-112px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <Reveal className="relative z-10">
            <Badge tone="white" className="mb-5">
              Escrow · Chat transaksi · Report admin
            </Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Jual Beli Akun Game Aman & Cepat
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Top up saldo, pilih akun game, transaksi pakai sistem aman, dan seller bisa withdraw hasil jualan.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white hover:scale-105 hover:bg-blue-500">
                Mulai Belanja
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/join-seller" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white hover:scale-105 hover:bg-white/15">
                Join Seller
                <Store className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 max-w-2xl rounded-[24px] bg-white p-2 shadow-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">
                  <Search className="h-5 w-5" />
                  <input className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none" placeholder="Cari akun ML Mythic, Valorant skin Vandal, COC TH13..." />
                </label>
                <Link href="/marketplace" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700">
                  Cari Akun
                </Link>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-slate-300 sm:max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">12K+</p>
                <p>Transaksi aman</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.9/5</p>
                <p>Rating seller</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">24 Jam</p>
                <p>Audit order</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative z-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <ProductVisual game="Mobile Legends" title="Preview akun ML" imageKey={1} className="shadow-2xl" />
                <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Saldo tersedia</p>
                      <p className="mt-1 text-2xl font-black">{formatIDR(1500000)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-300" />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-2/3 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-[24px] border border-white/15 bg-white p-5 text-slate-950 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge tone="green">Order aman</Badge>
                    <span className="text-xs font-bold text-slate-500">ORDER-20260601-DEMO</span>
                  </div>
                  <p className="font-black">Akun Valorant Platinum Region APAC</p>
                  <p className="mt-2 text-sm text-slate-500">Dana ditahan di escrow sampai buyer konfirmasi selesai.</p>
                  <div className="mt-4 space-y-3">
                    {["Pembayaran berhasil", "Seller kirim data akun", "Buyer cek akun", "Dana release"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                        <CheckCircle2 className={index < 2 ? "h-5 w-5 text-emerald-500" : "h-5 w-5 text-slate-300"} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-6 w-6 text-blue-300" />
                    <div>
                      <p className="font-black">Chat transaksi tercatat</p>
                      <p className="text-sm text-slate-300">Admin bisa masuk saat dispute.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading title="Kategori game populer" description="Setiap game punya halaman, filter, tips aman, seller aktif, dan produk yang relevan." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {games.map((game) => (
            <Link key={game.slug} href={`/game/${game.slug}`} className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: game.accent }}>
                {game.icon}
              </div>
              <p className="font-black text-slate-950">{game.name}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{game.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Produk terbaru"
            description="Listing dummy realistis untuk akun game populer. Produk sold tidak bisa dibeli ulang."
            action={
              <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
                Lihat marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading title="Rekomendasi akun premium" description="Produk dengan rank tinggi, seller terverifikasi, dan detail akun yang lebih lengkap." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="bg-slate-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading inverse title="Cara kerja transaksi aman" description="Alurnya dibuat familiar seperti marketplace besar, tapi khusus akun game dan saldo web." />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              [CreditCard, "Top up saldo", `Transfer via DANA/GoPay ke admin ${adminNumber}, upload bukti, tunggu verifikasi.`],
              [ShoppingIcon, "Pilih produk", "Cari akun game, cek seller, rank, bind akun, screenshot, dan status ready."],
              [ShieldCheck, "Dana escrow", "Saldo buyer dipotong dan ditahan dulu. Seller belum menerima dana sampai akun aman."],
              [MessageCircle, "Chat & selesai", "Seller kirim data akun lewat chat transaksi. Buyer cek lalu konfirmasi selesai."],
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                <Icon className="h-7 w-7 text-blue-300" />
                <p className="mt-4 font-black">{title as string}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Seller terpercaya" description="Seller dengan badge verified, rating tinggi, dan riwayat transaksi yang bersih." />
          <div className="grid gap-5 md:grid-cols-3">
            {sellers.map((seller) => (
              <Link key={seller.slug} href={`/seller/${seller.slug}`} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{seller.avatar}</div>
                  <div>
                    <p className="font-black text-slate-950">{seller.name}</p>
                    <p className="text-sm text-slate-500">{seller.rating}/5 · {seller.sales} transaksi</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{seller.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {seller.games.map((game) => (
                    <Badge key={game} tone="slate">{game}</Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeading title="Keamanan transaksi" description="Semua aksi penting masuk audit log dan bisa dicek admin saat terjadi dispute." />
          <div className="grid gap-3 sm:grid-cols-2">
            {["Escrow saldo tertahan", "Invoice unik", "Chat transaksi tercatat", "Report/dispute", "Seller verification", "Blacklist user", "Refund buyer", "Release dana seller"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeading title="Testimoni buyer" description="Copywriting dibuat natural untuk pengalaman user Indonesia." />
          <div className="space-y-4">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">“{item.text}”</p>
                <p className="mt-3 text-sm font-black text-slate-950">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="FAQ" description="Jawaban singkat untuk pertanyaan yang paling sering muncul sebelum transaksi." />
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-black text-slate-950">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ShoppingIcon(props: React.ComponentProps<typeof Store>) {
  return <Store {...props} />;
}
