import Link from "next/link";

export default function EmptyMarketplacePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-black text-slate-950">Marketplace masih kosong</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Belum ada produk yang cocok dengan filter kamu.</p>
      <Link href="/marketplace" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Reset filter</Link>
    </main>
  );
}
