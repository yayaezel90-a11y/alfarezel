import Link from "next/link";
import { ServerCrash } from "lucide-react";

export default function ServerErrorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <ServerCrash className="h-14 w-14 text-orange-600" />
      <h1 className="mt-5 text-3xl font-black text-slate-950">500 Server Error</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Ada kendala di server. Coba lagi sebentar atau hubungi admin.</p>
      <Link href="/bantuan" className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Buka bantuan</Link>
    </main>
  );
}
