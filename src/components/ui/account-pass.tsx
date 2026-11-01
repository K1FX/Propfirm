import type { ComponentProps } from "react";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = {
  variant: "evaluation" | "funded";
  /** Taille affichée, ex. « 150K ». */
  size: string;
  /** Statut affiché dans la pastille, ex. « Évaluation ». */
  status: string;
  /** Ligne sous la taille, ex. « Compte simulé ». */
  subtitle: string;
  /** Numéro imprimé sur le talon (sert aussi à générer le code-barres). */
  serial: string;
  /** Courbe décorative (valeurs relatives, de gauche à droite). */
  curve?: readonly number[];
} & Omit<ComponentProps<"div">, "children">;

const defaultCurves = {
  evaluation: [2, 4, 3, 7, 5, 9, 6, 11, 8, 13],
  funded: [1, 3, 2.5, 5, 7, 6, 9, 10, 12, 14],
} as const;

/** Hash FNV-1a → générateur déterministe, pour un code-barres propre à chaque numéro. */
function barcodeBars(serial: string): { x: number; w: number }[] {
  let h = 0x811c9dc5;
  for (const ch of serial) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    return h % 3;
  };
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 196) {
    const w = 1 + next();
    bars.push({ x, w });
    x += w + 1 + next();
  }
  return bars;
}

function curvePoints(values: readonly number[]): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 200;
      const y = 36 - ((v - min) / range) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Visuel de compte : billet « Aurum Pass » holographique détachable. */
export function AccountPass({
  variant,
  size,
  status,
  subtitle,
  serial,
  curve,
  className,
  ...props
}: Props) {
  const funded = variant === "funded";
  const accent = funded ? "#22D3EE" : "#C9CED6";

  return (
    <div
      className={cn(
        "relative w-full max-w-[250px]",
        funded
          ? "drop-shadow-[0_0_26px_rgba(34,211,238,.45)]"
          : "drop-shadow-[0_24px_40px_rgba(0,0,0,.7)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "@container relative flex aspect-[23/36] w-full flex-col overflow-hidden rounded-[18px] border bg-[linear-gradient(180deg,#1A1D22,#111317)] select-none ticket-notch",
          funded ? "border-cyan" : "border-[#3A3F47]",
        )}
      >
        {/* Bande holographique */}
        <div aria-hidden className={cn("h-[19%] shrink-0", funded ? "bg-holo-cyan" : "bg-holo")} />

        {/* Partie principale */}
        <div className="flex flex-col gap-2 px-[8%] pt-[6%]">
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG décoratif */}
            <img src="/logo.svg" alt="" width={30} height={30} className="size-[30px]" />
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.2em] uppercase",
                funded ? "border-cyan text-cyan-light" : "border-[#3A3F47] text-[#C9CED6]",
              )}
            >
              {status}
            </span>
          </div>
          <p
            className={cn(
              "font-display text-[clamp(1.75rem,19cqw,2.75rem)] leading-none font-bold tracking-tight",
              funded ? "text-cyan drop-shadow-[0_0_14px_rgba(34,211,238,.5)]" : "text-chrome",
            )}
          >
            {size}
          </p>
          <div className="font-mono text-[9px] leading-relaxed tracking-[0.15em] whitespace-nowrap text-text-muted uppercase">
            <p className="truncate">{brand.name}</p>
            <p className="truncate">{subtitle}</p>
          </div>
          <svg viewBox="0 0 200 40" className="h-auto max-h-[34px] w-full" aria-hidden>
            <polyline
              fill="none"
              stroke={funded ? accent : "#8C939D"}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={curvePoints(curve ?? defaultCurves[variant])}
            />
          </svg>
        </div>

        {/* Ligne prédécoupée (alignée sur les encoches à 69 %) */}
        <div
          aria-hidden
          className="absolute inset-x-[6%] top-[69%] border-t-2 border-dashed border-[#3A3F47]"
        />

        {/* Talon */}
        <div className="absolute inset-x-0 bottom-0 flex h-[31%] flex-col justify-center gap-2 px-[8%]">
          <svg
            viewBox="0 0 200 34"
            className="h-auto w-full"
            aria-hidden
            preserveAspectRatio="none"
          >
            {barcodeBars(serial).map((b) => (
              <rect key={b.x} x={b.x} y={0} width={b.w} height={34} fill={accent} />
            ))}
          </svg>
          <p className="font-mono text-[9px] tracking-[0.12em] text-text-muted">N° {serial}</p>
        </div>
      </div>
    </div>
  );
}
