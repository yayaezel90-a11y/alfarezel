"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ImagePlus, Send } from "lucide-react";

type ChatMessage = {
  id?: string;
  type: "USER" | "SYSTEM" | "ADMIN" | "SECURE_ACCOUNT_DATA" | "buyer" | "seller" | "system";
  body: string;
  createdAt?: string;
  sender?: {
    username?: string | null;
    role?: string | null;
  } | null;
};

type RealtimeChatProps = {
  orderId: string;
  initialMessages: ChatMessage[];
};

export function RealtimeChat({ orderId, initialMessages }: RealtimeChatProps) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("Menghubungkan realtime...");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const client = io({
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    client.on("connect", () => {
      setStatus("Realtime aktif");
      client.emit("chat:join", { orderRef: orderId }, (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          setError(response.error ?? "Gagal join chat realtime.");
          setJoined(false);
        } else {
          setJoined(true);
        }
      });
    });

    client.on("connect_error", () => {
      setStatus("Realtime belum aktif. Pesan tetap bisa dikirim lewat API.");
      setJoined(false);
    });

    client.on("chat:message", (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
    });

    socketRef.current = client;
    return () => {
      socketRef.current = null;
      client.disconnect();
    };
  }, [orderId]);

  const statusTone = useMemo(() => {
    if (error) return "border-red-200 bg-red-50 text-red-700";
    if (status.includes("aktif")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-orange-200 bg-orange-50 text-orange-700";
  }, [error, status]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setError("");

    const activeSocket = socketRef.current;
    if (activeSocket?.connected && joined) {
      activeSocket.emit("chat:send", { orderRef: orderId, body, attachments: [] }, (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          setError(response.error ?? "Pesan gagal dikirim.");
        } else {
          setBody("");
        }
      });
      return;
    }

    try {
      const response = await fetch(`/api/chat/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, attachments: [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Pesan gagal dikirim.");
      setMessages((current) => [...current, data.message]);
      setBody("");
      setError("");
      setStatus(joined ? "Realtime aktif" : "Pesan terkirim lewat API. Realtime akan aktif saat room tersedia.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pesan gagal dikirim.");
    }
  }

  return (
    <div className="flex flex-col">
      <div className={`m-4 rounded-2xl border px-4 py-3 text-sm font-bold ${statusTone}`}>
        {error || status}
      </div>
      <div className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6">
        {messages.map((message, index) => {
          const side = message.type === "buyer" || message.sender?.role === "BUYER" ? "right" : "left";
          const isSystem = message.type === "system" || message.type === "SYSTEM";
          return (
            <div key={message.id ?? index} className={side === "right" && !isSystem ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  isSystem
                    ? "max-w-lg rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900"
                    : side === "right"
                      ? "max-w-lg rounded-[20px] bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm"
                      : "max-w-lg rounded-[20px] bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                }
              >
                <div className="mb-1 text-xs font-black uppercase opacity-70">
                  {isSystem ? "Sistem" : message.sender?.role === "ADMIN" || message.type === "ADMIN" ? "Admin" : side === "right" ? "Buyer" : "Seller"}
                </div>
                {message.body}
                <div className="mt-2 text-[11px] opacity-70">
                  {message.createdAt ? new Date(message.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Baru"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form className="border-t border-slate-200 bg-white p-4" onSubmit={sendMessage}>
        <div className="flex gap-2">
          <button type="button" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700" aria-label="Upload gambar bukti">
            <ImagePlus className="h-5 w-5" />
          </button>
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Tulis pesan transaksi..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-400" />
          <button disabled={!body.trim()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" aria-label="Kirim pesan">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
