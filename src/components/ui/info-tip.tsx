"use client";

import { HelpCircle } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

/** Petite icône « ? » avec infobulle (survol, focus clavier ou clic sur mobile). */
export function InfoTip({
  label,
  text,
  className,
}: {
  label: string;
  text: string;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex size-4 items-center justify-center rounded-full text-text-muted transition-colors hover:text-cyan-light"
      >
        <HelpCircle className="size-3.5" strokeWidth={1.75} />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-[10px] px-3 py-2 text-left text-xs leading-relaxed font-normal text-text glass"
        >
          {text}
        </span>
      )}
    </span>
  );
}
