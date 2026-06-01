import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href = "/dashboard/buyer", label = "Kembali" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
