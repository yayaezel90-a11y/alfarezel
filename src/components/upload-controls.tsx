"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";

type UploadState = {
  loading: boolean;
  url: string;
  message: string;
  error: string;
};

const initialState: UploadState = { loading: false, url: "", message: "", error: "" };

async function uploadFile(file: File, folder: "avatars" | "banners" | "products" | "proofs" | "chat") {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("File gagal dibaca."));
    reader.readAsDataURL(file);
  });

  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, dataUrl, folder }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Upload gagal.");
  return data.url as string;
}

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan perubahan.");
  return data;
}

export function AvatarUploadCard({ title, description }: { title: string; description: string }) {
  const [state, setState] = useState(initialState);

  async function onFile(file?: File) {
    if (!file) return;
    setState({ loading: true, url: "", message: "", error: "" });
    try {
      const url = await uploadFile(file, "avatars");
      await postJson("/api/account/photo", { avatarUrl: url });
      setState({ loading: false, url, message: "Foto akun berhasil diperbarui.", error: "" });
    } catch (error) {
      setState({ loading: false, url: "", message: "", error: error instanceof Error ? error.message : "Upload gagal." });
    }
  }

  return <UploadPanel title={title} description={description} folderLabel="Pilih foto akun" state={state} onFile={onFile} />;
}

export function SellerPhotoUploadCard() {
  const [avatar, setAvatar] = useState(initialState);
  const [banner, setBanner] = useState(initialState);

  async function upload(kind: "storeAvatar" | "storeBanner", file?: File) {
    if (!file) return;
    const setState = kind === "storeAvatar" ? setAvatar : setBanner;
    setState({ loading: true, url: "", message: "", error: "" });
    try {
      const url = await uploadFile(file, kind === "storeAvatar" ? "avatars" : "banners");
      await postJson("/api/seller/store-photo", { [kind]: url });
      setState({ loading: false, url, message: kind === "storeAvatar" ? "Avatar toko tersimpan." : "Banner toko tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, url: "", message: "", error: error instanceof Error ? error.message : "Upload gagal." });
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <UploadPanel title="Avatar toko" description="Dipakai di profil seller, card seller, dan dashboard toko." folderLabel="Upload avatar toko" state={avatar} onFile={(file) => upload("storeAvatar", file)} />
      <UploadPanel title="Banner toko" description="Dipakai sebagai visual utama profil toko seller." folderLabel="Upload banner toko" state={banner} onFile={(file) => upload("storeBanner", file)} />
    </div>
  );
}

export function AdminVisualUploadCard() {
  const [dashboardImage, setDashboardImage] = useState(initialState);
  const [logo, setLogo] = useState(initialState);

  async function upload(kind: "dashboardImage" | "logoUrl", file?: File) {
    if (!file) return;
    const setState = kind === "dashboardImage" ? setDashboardImage : setLogo;
    setState({ loading: true, url: "", message: "", error: "" });
    try {
      const url = await uploadFile(file, kind === "dashboardImage" ? "banners" : "avatars");
      await postJson("/api/admin/platform-visuals", { [kind]: url });
      setState({ loading: false, url, message: kind === "dashboardImage" ? "Foto dashboard tersimpan." : "Logo platform tersimpan.", error: "" });
    } catch (error) {
      setState({ loading: false, url: "", message: "", error: error instanceof Error ? error.message : "Upload gagal." });
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <UploadPanel title="Foto dashboard" description="Visual ini bisa dipakai untuk halaman admin, promo, atau banner operasional." folderLabel="Upload foto dashboard" state={dashboardImage} onFile={(file) => upload("dashboardImage", file)} />
      <UploadPanel title="Logo platform" description="Logo disimpan di pengaturan platform dan tercatat di admin log." folderLabel="Upload logo" state={logo} onFile={(file) => upload("logoUrl", file)} />
    </div>
  );
}

function UploadPanel({
  title,
  description,
  folderLabel,
  state,
  onFile,
}: {
  title: string;
  description: string;
  folderLabel: string;
  state: UploadState;
  onFile: (file?: File) => void;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {state.loading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <Save className="h-5 w-5 text-slate-400" />}
      </div>
      {state.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.url} alt={title} className="mt-4 h-32 w-full rounded-2xl object-cover" />
      ) : null}
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-black text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
        <ImagePlus className="h-5 w-5" />
        {state.loading ? "Mengupload..." : folderLabel}
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
      </label>
      {state.error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      {state.message ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.message}</p> : null}
    </div>
  );
}
