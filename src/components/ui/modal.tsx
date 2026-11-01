"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fenêtre modale basée sur <dialog> natif : focus piégé, fermeture Échap et clic sur le fond.
 */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,560px)] rounded-[20px] border border-border bg-surface p-0 text-text shadow-[0_30px_80px_rgba(0,0,0,.7),0_0_40px_rgba(34,211,238,.12)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="inline-flex size-8 items-center justify-center rounded-[10px] text-text-muted hover:bg-bg-elevated hover:text-text"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
    </dialog>
  );
}
