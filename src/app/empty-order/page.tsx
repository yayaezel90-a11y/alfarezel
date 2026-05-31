import Link from "next/link";

export default function EmptyOrderPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-black text-slate-950">Belum ada pesanan</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Mulai dari marketplace dan pilih akun game yang kamu incar.</p>
      <Link href="/marketplace" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Mulai belanja</Link>
    </main>
  );
}
