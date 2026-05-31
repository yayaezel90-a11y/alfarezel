import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const palettes = [
  ["#0f172a", "#2563eb", "#22c55e"],
  ["#111827", "#f97316", "#0ea5e9"],
  ["#0b1220", "#16a34a", "#eab308"],
  ["#101827", "#dc2626", "#38bdf8"],
  ["#0f172a", "#64748b", "#ffffff"],
  ["#172033", "#7c3aed", "#f97316"],
  ["#23180f", "#b45309", "#22c55e"],
  ["#0f172a", "#0284c7", "#94a3b8"],
];

type ProductVisualProps = {
  game: string;
  title: string;
  imageKey: number;
  className?: string;
};

export function ProductVisual({ game, title, imageKey, className }: ProductVisualProps) {
  const palette = palettes[imageKey % palettes.length];
  return (
    <div
      className={cn("relative aspect-[4/3] overflow-hidden rounded-[18px] border border-white/30 shadow-inner", className)}
      style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
    >
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_25%_25%,rgba(255,255,255,.22),transparent_28%),linear-gradient(120deg,transparent,rgba(255,255,255,.10),transparent)]" />
      <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-950 shadow-sm">
        {game}
      </div>
      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-sm font-black text-white ring-1 ring-white/30">
        {game
          .split(" ")
          .map((word) => word[0])
          .slice(0, 3)
          .join("")}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-[18px] border border-white/20 bg-white/92 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Screenshot akun diverifikasi
          </div>
          <div className="h-3 w-4/5 rounded-full bg-slate-900" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-200" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-10 rounded-xl" style={{ backgroundColor: item === 1 ? palette[2] : "#e2e8f0" }} />
            ))}
          </div>
          <span className="sr-only">{title}</span>
        </div>
      </div>
    </div>
  );
}
