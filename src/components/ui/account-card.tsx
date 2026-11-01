import type { ComponentProps } from "react";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = {
  variant: "metal" | "funded";
  /** Taille affichée, ex. « 150K ». */
  size: string;
  /** Statut affiché, ex. « Évaluation ». */
  status: string;
  /** Ligne du bas, ex. un identifiant de compte ou « Compte simulé ». */
  footer?: string;
} & Omit<ComponentProps<"div">, "children">;

/** Visuel de compte façon carte bancaire (CLAUDE.md §3.2). */
export function AccountCard({ variant, size, status, footer, className, ...props }: Props) {
  const funded = variant === "funded";

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full max-w-[380px] overflow-hidden rounded-[20px] p-6 select-none",
        funded
          ? "border border-cyan/70 bg-[#07080A] shadow-[0_0_50px_rgba(34,211,238,.28)]"
          : "border border-[#4A5059] shadow-[0_20px_60px_rgba(0,0,0,.6)] bg-brushed",
        className,
      )}
      {...props}
    >
      {/* Reflet diagonal */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          funded
            ? "bg-[radial-gradient(120%_80%_at_100%_0%,rgba(34,211,238,.22),transparent_55%)]"
            : "bg-[linear-gradient(135deg,rgba(255,255,255,.18)_0%,transparent_40%,transparent_60%,rgba(255,255,255,.08)_100%)]",
        )}
      />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG décoratif */}
          <img src="/logo.svg" alt="" width={36} height={36} className="size-9" />
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase",
              funded
                ? "bg-cyan/15 text-cyan-light ring-1 ring-cyan/50"
                : "bg-black/40 text-[#E3E7EC]",
            )}
          >
            {status}
          </span>
        </div>

        {/* Puce */}
        <div
          aria-hidden
          className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#F6F8FA,#9DA4AE_55%,#D5DAE1)] opacity-90 shadow-inner"
        />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-xs tracking-widest uppercase",
                funded ? "text-cyan-light" : "text-[#C9CED6]",
              )}
            >
              {brand.name}
            </p>
            <p className="mt-1 tabular text-xs text-[#AEB5BF]">{footer}</p>
          </div>
          <p
            className={cn(
              "font-display text-4xl font-bold tracking-tight",
              funded ? "text-cyan drop-shadow-[0_0_12px_rgba(34,211,238,.6)]" : "text-chrome",
            )}
          >
            {size}
          </p>
        </div>
      </div>
    </div>
  );
}
