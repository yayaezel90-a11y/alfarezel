"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Upload } from "lucide-react";
import { games } from "@/lib/demo-data";
import { formatIDR } from "@/lib/invoice";

type ApiState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialState: ApiState = { loading: false, message: "", error: "" };

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Request gagal diproses.");
  return data;
}

export function TopupForm() {
  const [amount, setAmount] = useState(50000);
  const [proofImage, setProofImage] = useState("");
  const [state, setState] = useState(initialState);
  const fee = useMemo(() => Math.ceil(amount * 0.02) + 1000, [amount]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await postJson("/api/topups", {
        amount,
        paymentMethod: form.get("paymentMethod"),
        proofImage: proofImage || undefined,
        userNote: form.get("userNote"),
      });
      setState({ loading: false, message: data.message ?? "Top up berhasil dikirim, tunggu admin cek ya.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Top up gagal dikirim." });
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Nominal top up</span>
        <input value={amount} onChange={(event) => setAmount(Number(event.target.value || 0))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Metode</span>
        <select name="paymentMethod" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400">
          <option>DANA</option>
          <option>GoPay</option>
        </select>
      </label>
      <div className="sm:col-span-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Row label="Nominal top up" value={formatIDR(amount)} />
        <Row label="Fee admin" value={formatIDR(fee)} />
        <Row label="Total transfer" value={formatIDR(amount + fee)} strong />
        <Row label="Saldo masuk" value={formatIDR(amount)} />
      </div>
      <label className="sm:col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-300 hover:bg-blue-50">
        <Upload className="h-8 w-8 text-blue-600" />
        <span className="mt-3 text-sm font-black text-slate-950">{proofImage ? "Bukti dipilih" : "Upload bukti transfer"}</span>
        <span className="mt-1 text-xs text-slate-500">{proofImage || "PNG/JPG maksimal 5MB, cloud-ready untuk produksi"}</span>
        <input
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setProofImage(file ? `/uploads/topups/${file.name}` : "");
          }}
        />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Catatan user</span>
        <textarea name="userNote" rows={4} placeholder="Contoh: Saya transfer dari DANA atas nama..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <Status state={state} className="sm:col-span-2" />
      <button disabled={state.loading} className="sm:col-span-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {state.loading ? "Mengirim..." : "Kirim request top up"}
      </button>
    </form>
  );
}

export function JoinSellerForm() {
  const [state, setState] = useState(initialState);
  const [proofImage, setProofImage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await postJson("/api/seller/apply", {
        storeName: form.get("storeName"),
        whatsapp: form.get("whatsapp"),
        email: form.get("email"),
        description: form.get("description"),
        gamesSold: [form.get("game")],
        experience: form.get("experience"),
        reason: form.get("reason"),
        socialLink: form.get("socialLink") || undefined,
        proofImage: proofImage || undefined,
        agreeRules: form.get("agreeRules") === "on",
      });
      setState({ loading: false, message: data.message ?? "Pengajuan seller berhasil dikirim.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Pengajuan seller gagal." });
    }
  }

  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field name="storeName" label="Nama toko" placeholder="Contoh: Reza Store ID" />
      <Field name="whatsapp" label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" />
      <Field name="email" label="Email" placeholder="seller@email.com" type="email" />
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Game yang dijual</span>
        <select name="game" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400">
          {games.map((game) => <option key={game.slug}>{game.name}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Deskripsi seller</span>
        <textarea required name="description" rows={4} placeholder="Contoh: Saya menjual akun game original, data lengkap, aman, dan siap membantu buyer jika ada kendala." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <Field name="experience" label="Pengalaman jual beli akun" placeholder="Contoh: 2 tahun jual akun ML dan FF" />
      <Field name="reason" label="Alasan ingin jadi seller" placeholder="Ingin jualan lewat escrow yang aman" />
      <Field name="socialLink" label="Link sosial media opsional" placeholder="Instagram/TikTok/Website" required={false} />
      <UploadButton label="Upload bukti/testimoni" value={proofImage} onFile={(path) => setProofImage(path)} />
      <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <input required name="agreeRules" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600" />
        Saya setuju aturan seller dan menyatakan tidak menjual akun hasil hack, phishing, cracking, carding, atau akun curian.
      </label>
      <Status state={state} className="sm:col-span-2" />
      <button disabled={state.loading} className="sm:col-span-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {state.loading ? "Mengirim..." : "Kirim pengajuan seller"}
      </button>
    </form>
  );
}

export function WithdrawForm() {
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await postJson("/api/withdraws", {
        amount: form.get("amount"),
        method: form.get("method"),
        destinationNumber: form.get("destinationNumber"),
        receiverName: form.get("receiverName"),
        sellerNote: form.get("sellerNote") || undefined,
      });
      setState({ loading: false, message: data.message ?? "Withdraw berhasil diajukan.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Withdraw gagal diajukan." });
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field name="amount" label="Nominal withdraw" placeholder="250000" />
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Metode</span>
        <select name="method" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400">
          <option>DANA</option>
          <option>GoPay</option>
          <option>Bank Transfer</option>
        </select>
      </label>
      <Field name="destinationNumber" label="Nomor tujuan / rekening" placeholder="08xxxxxxxxxx / nomor rekening" />
      <Field name="receiverName" label="Nama penerima" placeholder="Nama sesuai akun tujuan" />
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Catatan seller</span>
        <textarea name="sellerNote" rows={4} placeholder="Catatan tambahan untuk admin" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <Status state={state} className="sm:col-span-2" />
      <button disabled={state.loading} className="sm:col-span-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {state.loading ? "Mengirim..." : "Ajukan withdraw"}
      </button>
    </form>
  );
}

export function ReportForm() {
  const [state, setState] = useState(initialState);
  const [proofUrl, setProofUrl] = useState("");
  const reasons = ["Produk mencurigakan", "Seller mencurigakan", "Buyer bermasalah", "Order bermasalah", "Chat bermasalah", "Bukti tidak valid", "Akun tidak sesuai deskripsi", "Data akun salah", "Akun ditarik kembali", "Penipuan/scam attempt"];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const reason = String(form.get("reason"));
      const data = await postJson("/api/reports", {
        type: reason,
        reason,
        description: form.get("description"),
        orderId: form.get("orderId") || undefined,
        proofUrl: proofUrl || undefined,
      });
      setState({ loading: false, message: data.message ?? "Report berhasil dikirim.", error: "" });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Report gagal dikirim." });
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Alasan</span>
        <select name="reason" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400">
          {reasons.map((reason) => <option key={reason}>{reason}</option>)}
        </select>
      </label>
      <Field name="orderId" label="Order terkait" placeholder="ORDER-20260601-DEMO" required={false} />
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Deskripsi masalah</span>
        <textarea required name="description" rows={5} placeholder="Ceritakan masalahnya dengan jelas. Sertakan timeline dan bukti yang kamu punya." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <div className="sm:col-span-2">
        <UploadButton label="Upload bukti gambar" value={proofUrl} onFile={(path) => setProofUrl(path)} tone="red" />
      </div>
      <Status state={state} className="sm:col-span-2" />
      <button disabled={state.loading} className="sm:col-span-2 rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white hover:scale-[1.02] hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {state.loading ? "Mengirim..." : "Submit report"}
      </button>
    </form>
  );
}

export function AddProductForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [screenshot, setScreenshot] = useState("/visuals/product-upload.png");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    const form = new FormData(event.currentTarget);
    try {
      const data = await postJson("/api/products", {
        title: form.get("title"),
        gameSlug: form.get("gameSlug"),
        price: form.get("price"),
        rank: form.get("rank"),
        level: form.get("level"),
        server: form.get("server"),
        platform: form.get("platform"),
        bindInfo: form.get("bindInfo"),
        description: form.get("description"),
        securityNote: form.get("securityNote") || "Demi keamanan, transaksi wajib lewat saldo Alfarezel Market.",
        images: [screenshot],
        attributes: {
          "Garansi cek": "1x24 jam",
          "Status bind": String(form.get("bindInfo")),
        },
        legalConfirm: form.get("legalConfirm") === "on",
      });
      setState({ loading: false, message: data.message ?? "Produk berhasil disimpan.", error: "" });
      router.refresh();
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Produk gagal disimpan." });
    }
  }

  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Field name="title" label="Nama produk" placeholder="Akun ML Mythic 45 Stars, Skin Epic Banyak" />
      <label>
        <span className="mb-2 block text-sm font-black text-slate-700">Game</span>
        <select name="gameSlug" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400">
          {games.map((game) => <option key={game.slug} value={game.slug}>{game.name}</option>)}
        </select>
      </label>
      <Field name="price" label="Harga IDR" placeholder="425000" />
      <Field name="rank" label="Rank" placeholder="Mythic 45 Stars" />
      <Field name="level" label="Level" placeholder="82" />
      <Field name="server" label="Server / region" placeholder="Indonesia / APAC" />
      <Field name="platform" label="Platform" placeholder="Android/iOS/PC" />
      <Field name="bindInfo" label="Bind akun" placeholder="Moonton + Email full access" />
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Deskripsi akun</span>
        <textarea required name="description" rows={5} placeholder="Jelaskan skin, hero, rank, status bind, garansi cek, dan hal penting lain." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <div className="sm:col-span-2">
        <UploadButton label="Upload screenshot akun minimal 1" value={screenshot} onFile={(path) => setScreenshot(path)} />
      </div>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-black text-slate-700">Catatan keamanan</span>
        <textarea name="securityNote" rows={3} placeholder="Transaksi wajib lewat escrow Alfarezel Market." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
      </label>
      <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-900">
        <input required name="legalConfirm" type="checkbox" className="mt-1 h-4 w-4 rounded border-red-300 text-red-600" />
        Saya menyatakan akun ini bukan hasil hack, phishing, cracking, carding, atau akun curian.
      </label>
      <Status state={state} className="sm:col-span-2" />
      <button disabled={state.loading} className="sm:col-span-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {state.loading ? "Menyimpan..." : "Simpan produk"}
      </button>
    </form>
  );
}

export function ChatComposer({ orderId }: { orderId: string }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    try {
      const data = await postJson(`/api/chat/${orderId}/messages`, { body, attachments: [] });
      setBody("");
      setState({
        loading: false,
        message: data.warning ? "Pesan terkirim. Sistem juga menampilkan warning anti transaksi luar platform." : "Pesan terkirim.",
        error: "",
      });
    } catch (error) {
      setState({ loading: false, message: "", error: error instanceof Error ? error.message : "Pesan gagal dikirim." });
    }
  }

  return (
    <form className="border-t border-slate-200 bg-white p-4" onSubmit={onSubmit}>
      <div className="flex gap-2">
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700" aria-label="Upload gambar bukti">
          <Upload className="h-5 w-5" />
        </button>
        <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Tulis pesan transaksi..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-400" />
        <button disabled={state.loading || !body.trim()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" aria-label="Kirim pesan">
          <Send className="h-5 w-5" />
        </button>
      </div>
      <Status state={state} className="mt-3" />
    </form>
  );
}

function Field({ name, label, placeholder, type = "text", required = true }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <input required={required} name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400" />
    </label>
  );
}

function UploadButton({ label, value, onFile, tone = "blue" }: { label: string; value: string; onFile: (path: string) => void; tone?: "blue" | "red" }) {
  const toneClass = tone === "red" ? "hover:border-red-300 hover:bg-red-50 text-red-600" : "hover:border-blue-300 hover:bg-blue-50 text-blue-600";
  return (
    <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 ${toneClass}`}>
      <Upload className="h-5 w-5" />
      {value ? value.split("/").at(-1) : label}
      <input
        type="file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          onFile(file ? `/uploads/${file.name}` : "");
        }}
      />
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mb-2 flex justify-between gap-4 last:mb-0">
      <span>{label}</span>
      <span className={strong ? "font-black" : "font-bold"}>{value}</span>
    </div>
  );
}

function Status({ state, className = "" }: { state: ApiState; className?: string }) {
  if (state.error) return <div className={`rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700 ${className}`}>{state.error}</div>;
  if (state.message) return <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700 ${className}`}>{state.message}</div>;
  return null;
}
