import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Login",
  description: "Login ke Alfarezel Market untuk mengakses saldo, order, chat transaksi, dan dashboard.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Masuk ke Alfarezel Market" subtitle="Kelola saldo, order, chat transaksi, dan dashboard kamu.">
      <Suspense fallback={<div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Menyiapkan form login...</div>}>
        <LoginForm />
      </Suspense>
      <p className="mt-5 text-center text-sm text-slate-600">
        Belum punya akun? <Link href="/register" className="font-black text-blue-700">Register</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
      <section className="self-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Login aman dengan session cookie httpOnly
        </div>
        <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{subtitle}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Saldo web", "Escrow", "Audit log"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-700 shadow-sm">{item}</div>
          ))}
        </div>
      </section>
      <section className="self-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Lock className="h-6 w-6" />
        </div>
        {children}
      </section>
    </main>
  );
}
