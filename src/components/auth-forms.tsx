"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

type ApiState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialState: ApiState = { loading: false, message: "", error: "" };

function dashboardFor(role?: string) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/dashboard/admin";
  if (role === "SELLER") return "/dashboard/seller";
  return "/dashboard/buyer";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: form.get("identifier"),
        password: form.get("password"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setState({ loading: false, message: "", error: data.error ?? "Login gagal." });
      return;
    }
    setState({ loading: false, message: data.message ?? "Login berhasil.", error: "" });
    const next = searchParams.get("next");
    router.push(next || dashboardFor(data.user?.role));
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field name="identifier" label="Username atau email" placeholder="Masukkan username atau email" />
      <Field name="password" label="Password" placeholder="Masukkan password" type="password" />
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 font-semibold text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
          Ingat saya
        </label>
        <Link href="/forgot-password" className="font-bold text-blue-700 hover:text-blue-800">Lupa password?</Link>
      </div>
      <Status state={state} />
      <button disabled={state.loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        <LogIn className="h-4 w-4" />
        {state.loading ? "Memproses..." : "Login"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setState({ loading: false, message: "", error: data.error ?? "Register gagal." });
      return;
    }
    setState({ loading: false, message: data.message ?? "Akun berhasil dibuat.", error: "" });
    router.push("/dashboard/buyer");
    router.refresh();
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field name="username" label="Username" placeholder="contoh: buyer.kamu" />
      <Field name="email" label="Email" placeholder="nama@email.com" type="email" />
      <Field name="phone" label="Nomor HP" placeholder="08xxxxxxxxxx" />
      <Field name="password" label="Password" placeholder="Minimal 8 karakter" type="password" />
      <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <input required type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
        Saya setuju semua transaksi dilakukan lewat sistem Alfarezel Market dan tidak mengajak transaksi di luar platform.
      </label>
      <div className="sm:col-span-2">
        <Status state={state} />
      </div>
      <button disabled={state.loading} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        <UserPlus className="h-4 w-4" />
        {state.loading ? "Membuat akun..." : "Register"}
      </button>
    </form>
  );
}

function Field({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <input required name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
    </label>
  );
}

function Status({ state }: { state: ApiState }) {
  if (state.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</div>;
  if (state.message) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.message}</div>;
  return null;
}
