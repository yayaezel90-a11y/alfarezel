import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <ShieldX className="h-14 w-14 text-red-600" />
      <h1 className="mt-5 text-3xl font-black text-slate-950">403 Unauthorized</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Role akun kamu tidak punya akses ke halaman ini.</p>
      <Link href="/" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Kembali ke home</Link>
    </main>
  );
}
