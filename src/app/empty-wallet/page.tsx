import Link from "next/link";

export default function EmptyWalletPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-black text-slate-950">Wallet belum punya mutasi</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Top up, pembelian, refund, dan withdraw akan muncul di sini.</p>
      <Link href="/top-up" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Top up saldo</Link>
    </main>
  );
}
