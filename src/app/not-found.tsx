import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <SearchX className="h-14 w-14 text-slate-500" />
      <h1 className="mt-5 text-3xl font-black text-slate-950">404 Halaman tidak ditemukan</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>
      <Link href="/marketplace" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Buka marketplace</Link>
    </main>
  );
}
