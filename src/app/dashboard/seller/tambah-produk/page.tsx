import type { Metadata } from "next";
import { AddProductForm } from "@/components/flow-forms";

export const metadata: Metadata = {
  title: "Tambah Produk Seller",
  description: "Form tambah produk akun game seller dengan validasi dan checkbox legal.",
};

export default function AddProductPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Tambah produk akun game</h1>
        <p className="mt-2 text-sm text-slate-500">Produk bisa langsung tayang atau menunggu review admin sesuai pengaturan platform.</p>
        <AddProductForm />
      </section>
    </main>
  );
}
