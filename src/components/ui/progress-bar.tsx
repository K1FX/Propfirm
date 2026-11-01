"use client";

import { useInViewOnce } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

type Props = {
  /** Valeur entre 0 et 100. */
  value: number;
  tone?: "cyan" | "danger" | "chrome";
  label: string;
  /** Texte affiché à droite du label (ex. « 1 500 $ / 3 000 $ »). */
  valueLabel?: string;
  showLabel?: boolean;
  className?: string;
};

const toneClass = {
  cyan: "bg-gradient-to-r from-cyan-deep via-cyan to-cyan-light shadow-[0_0_16px_rgba(34,211,238,.45)]",
  danger: "bg-gradient-to-r from-[#7a1f30] to-danger shadow-[0_0_16px_rgba(255,77,106,.35)]",
  chrome: "bg-gradient-to-r from-[#8c939d] via-[#d5dae1] to-white",
} as const;

export function ProgressBar({
  value,
  tone = "cyan",
  label,
  valueLabel,
  showLabel = true,
  className,
}: Props) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>("0px");
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-text-muted">{label}</span>
          {valueLabel && <span className="tabular text-text">{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated ring-1 ring-border"
      >
        <div
          className={cn(
            "h-full origin-left rounded-full transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]",
            toneClass[tone],
          )}
          style={{ width: `${pct}%`, transform: `scaleX(${inView ? 1 : 0})` }}
        />
      </div>
    </div>
  );
}
