import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Register",
  description: "Daftar akun buyer Alfarezel Market untuk top up saldo dan beli akun game dengan escrow.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">Buat akun baru</h1>
            <p className="text-sm text-slate-500">Akun buyer bisa langsung top up, wishlist, dan beli produk.</p>
          </div>
        </div>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-slate-600">
          Sudah punya akun? <Link href="/login" className="font-black text-blue-700">Login</Link>
        </p>
      </div>
    </main>
  );
}
