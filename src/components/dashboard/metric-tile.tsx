import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  tone?: "default" | "cyan" | "danger";
  hint?: ReactNode;
};

/** Indicateur compact : libellé en petites capitales + valeur en chiffres tabulaires. */
export function MetricTile({ label, value, tone = "default", hint }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-surface px-5 py-4">
      <span className="label-caps">{label}</span>
      <span
        className={cn(
          "tabular text-xl font-semibold sm:text-2xl",
          tone === "cyan" && "text-cyan-light",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </div>
  );
}
