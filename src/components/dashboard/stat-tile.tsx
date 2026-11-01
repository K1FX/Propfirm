import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "cyan" | "danger";
  /** Chiffres en police mono (par défaut) ou texte en police de titre. */
  mono?: boolean;
};

export function StatTile({ label, value, hint, icon: Icon, tone = "default", mono = true }: Props) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-text-muted">{label}</span>
        {Icon && <Icon className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />}
      </div>
      <span
        className={cn(
          mono ? "tabular text-2xl font-semibold" : "font-display text-2xl font-bold",
          tone === "cyan" && "text-cyan-light",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </Card>
  );
}
