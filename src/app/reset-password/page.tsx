import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset password akun Alfarezel Market.",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Masukkan token reset yang dikirim ke email kamu, lalu buat password baru.</p>
        <form className="mt-6 space-y-4">
          <input type="email" placeholder="Email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
          <input placeholder="Token reset" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
          <input type="password" placeholder="Password baru" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
          <button className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Reset password</button>
        </form>
      </div>
    </main>
  );
}
