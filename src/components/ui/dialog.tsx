import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-display text-lg font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-lg p-2 text-slate-500 hover:bg-paper"><X size={18} /></button></div>
      {children}
    </div>
  </div>;
}
