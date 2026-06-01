"use client";

import { useState } from "react";

type State = { loading: boolean; message: string; error: string };
const initialState: State = { loading: false, message: "", error: "" };

async function request(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Aksi gagal diproses.");
  return data;
}

function Status({ state }: { state: State }) {
  if (state.error) return <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>;
  if (state.message) return <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.message}</p>;
  return null;
}

function Field({ name, label, placeholder, type = "text", required = true }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase text-slate-500">{label}</span>
      <input required={required} name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400" />
    </label>
  );
}

function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button disabled={loading} className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
      {loading ? "Memproses..." : children}
    </button>
  );
}

export function SellerDecisionForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("sellerId"));
      const data = await request(`/api/admin/sellers/${id}/decision`, { decision: form.get("decision"), note: form.get("note") || undefined });
      setState({ loading: false, message: data.message ?? "Status seller tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="sellerId" label="User ID seller" placeholder="seller-reza-store-id" />
      <label>
        <span className="mb-2 block text-xs font-black uppercase text-slate-500">Keputusan</span>
        <select name="decision" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
          <option value="approve">Approve seller</option>
          <option value="verify">Beri badge verified</option>
          <option value="unverify">Cabut badge verified</option>
          <option value="reject">Reject seller</option>
          <option value="suspend">Suspend seller</option>
        </select>
      </label>
      <Field name="note" label="Catatan admin" placeholder="Alasan keputusan" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan keputusan seller</Submit>
    </form>
  );
}

export function ProductReviewForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("productId"));
      const data = await request(`/api/products/${id}/review`, { decision: form.get("decision"), note: form.get("note") || undefined });
      setState({ loading: false, message: data.message ?? "Keputusan produk tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="productId" label="Product ID / slug" placeholder="akun-ml-mythic-45-stars-skin-epic-banyak-siap-main" />
      <label>
        <span className="mb-2 block text-xs font-black uppercase text-slate-500">Keputusan</span>
        <select name="decision" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
          <option value="approve">Approve tayang</option>
          <option value="reject">Reject produk</option>
          <option value="hide">Sembunyikan</option>
          <option value="feature">Jadikan featured</option>
        </select>
      </label>
      <Field name="note" label="Catatan admin" placeholder="Catatan review produk" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan keputusan produk</Submit>
    </form>
  );
}

export function TopupDecisionForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("topupId"));
      const action = String(form.get("action"));
      const data = await request(`/api/topups/${id}/${action}`, { adminNote: form.get("adminNote") || undefined });
      setState({ loading: false, message: data.message ?? "Top up diproses.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="topupId" label="Top up ID" placeholder="ID request top up" />
      <select name="action" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
        <option value="approve">Approve</option>
        <option value="reject">Reject</option>
      </select>
      <Field name="adminNote" label="Catatan admin" placeholder="Catatan untuk user" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Proses top up</Submit>
    </form>
  );
}

export function WithdrawDecisionForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("withdrawId"));
      const action = String(form.get("action"));
      const data = await request(`/api/withdraws/${id}/${action}`, { adminNote: form.get("adminNote") || "Diproses admin.", proofImage: form.get("proofImage") || undefined });
      setState({ loading: false, message: data.message ?? "Withdraw diproses.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="withdrawId" label="Withdraw ID" placeholder="ID request withdraw" />
      <select name="action" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
        <option value="approve">Approve</option>
        <option value="reject">Reject</option>
      </select>
      <Field name="proofImage" label="URL bukti transfer" placeholder="https://..." required={false} />
      <Field name="adminNote" label="Catatan admin" placeholder="Catatan untuk seller" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Proses withdraw</Submit>
    </form>
  );
}

export function WalletAdjustForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("userId"));
      const data = await request(`/api/admin/users/${id}/wallet-adjust`, { amount: form.get("amount"), reason: form.get("reason") });
      setState({ loading: false, message: data.message ?? "Saldo tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="userId" label="User ID" placeholder="ID user" />
      <Field name="amount" label="Nominal (+/-)" placeholder="50000 atau -25000" type="number" />
      <Field name="reason" label="Alasan wajib" placeholder="Penyesuaian saldo berdasarkan bukti admin" />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan penyesuaian saldo</Submit>
    </form>
  );
}

export function ReportResolveForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const id = String(form.get("reportId"));
      const data = await request(`/api/reports/${id}/resolve`, { decision: form.get("decision"), resolution: form.get("resolution") });
      setState({ loading: false, message: data.message ?? "Report diputuskan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="reportId" label="Report ID" placeholder="ID report" />
      <select name="decision" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
        <option value="refund_buyer">Refund buyer</option>
        <option value="release_seller">Release dana seller</option>
        <option value="close">Tutup report</option>
        <option value="request_buyer_evidence">Minta bukti buyer</option>
        <option value="request_seller_evidence">Minta bukti seller</option>
      </select>
      <Field name="resolution" label="Keputusan admin" placeholder="Tuliskan alasan keputusan" />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan keputusan report</Submit>
    </form>
  );
}

export function FeeSettingForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/api/admin/fee-settings", {
        kind: form.get("kind"),
        percentage: form.get("percentage"),
        fixedFee: form.get("fixedFee"),
        minAmount: form.get("minAmount") || undefined,
        maxAmount: form.get("maxAmount") || undefined,
      });
      setState({ loading: false, message: data.message ?? "Fee tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <select name="kind" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
        <option value="TOPUP">Fee top up</option>
        <option value="WITHDRAW">Fee withdraw</option>
        <option value="PLATFORM">Fee platform</option>
      </select>
      <Field name="percentage" label="Persentase" placeholder="2" type="number" />
      <Field name="fixedFee" label="Fixed fee" placeholder="1000" type="number" />
      <Field name="minAmount" label="Minimal nominal" placeholder="10000" type="number" required={false} />
      <Field name="maxAmount" label="Maksimal nominal" placeholder="10000000" type="number" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan fee</Submit>
    </form>
  );
}

export function PlatformSettingForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/api/admin/platform-settings", { key: form.get("key"), value: form.get("value") });
      setState({ loading: false, message: data.message ?? "Pengaturan tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="key" label="Key" placeholder="admin_topup_number / product_review_mode / maintenance_mode" />
      <Field name="value" label="Value" placeholder="087760337535 / on / off" />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan pengaturan</Submit>
    </form>
  );
}

export function GameCategoryForm() {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/api/admin/games", {
        name: form.get("name"),
        slug: form.get("slug"),
        description: form.get("description") || undefined,
        icon: form.get("icon") || undefined,
        banner: form.get("banner") || undefined,
      });
      setState({ loading: false, message: data.message ?? "Game tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="name" label="Nama game" placeholder="Mobile Legends" />
      <Field name="slug" label="Slug" placeholder="mobile-legends" />
      <Field name="icon" label="Icon pendek" placeholder="ML" required={false} />
      <Field name="banner" label="URL banner" placeholder="https://..." required={false} />
      <Field name="description" label="Deskripsi" placeholder="Deskripsi kategori game" required={false} />
      <Status state={state} />
      <Submit loading={state.loading}>Simpan game</Submit>
    </form>
  );
}

export function AdminDocumentForm({ collection }: { collection: "banners" | "vouchers" | "notifications" }) {
  const [state, setState] = useState(initialState);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await request("/api/admin/documents", {
        collection,
        title: form.get("title"),
        body: form.get("body") || undefined,
        code: form.get("code") || undefined,
        imageUrl: form.get("imageUrl") || undefined,
        status: form.get("status") || "ACTIVE",
      });
      setState({ loading: false, message: data.message ?? "Data dibuat.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Aksi gagal." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="title" label="Judul" placeholder="Promo / voucher / notifikasi" />
      <Field name="code" label="Kode opsional" placeholder="PROMO10" required={false} />
      <Field name="imageUrl" label="URL gambar opsional" placeholder="https://..." required={false} />
      <Field name="body" label="Isi" placeholder="Konten singkat" required={false} />
      <select name="status" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-400">
        <option value="ACTIVE">ACTIVE</option>
        <option value="PAUSED">PAUSED</option>
      </select>
      <Status state={state} />
      <Submit loading={state.loading}>Simpan data</Submit>
    </form>
  );
}
