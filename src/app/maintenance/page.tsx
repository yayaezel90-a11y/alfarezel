import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <Wrench className="h-14 w-14 text-blue-600" />
      <h1 className="mt-5 text-3xl font-black text-slate-950">Maintenance</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Alfarezel Market sedang dirapikan. Transaksi aktif tetap tercatat aman.</p>
    </main>
  );
}
