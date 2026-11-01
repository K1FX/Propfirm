import { cn } from "@/lib/utils";

type Props = {
  /** Seuil d'élimination (gauche). */
  min: number;
  start: number;
  /** Borne droite : objectif (évaluation) ou plus haut (financé). */
  max: number;
  balance: number;
  labels: { min: string; start: string; max: string };
  format: (cents: number) => string;
  /** Ligne de chiffres sous la barre. */
  stats: { label: string; value: string; tone?: "default" | "cyan" | "danger" }[];
};

const pct = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((v - min) / (max - min || 1)) * 100));

/** Barre « minimum ← départ → objectif » avec la position actuelle du solde. */
export function BalanceRange({ min, start, max, balance, labels, format, stats }: Props) {
  const startPct = pct(start, min, max);
  const balPct = pct(balance, min, max);
  const up = balance >= start;
  const fillLeft = Math.min(startPct, balPct);
  const fillWidth = Math.abs(balPct - startPct);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative pt-2 pb-6">
        {/* Piste : rouge côté minimum, cyan côté objectif */}
        <div className="h-2 w-full rounded-full bg-[linear-gradient(90deg,rgba(255,77,106,.35),rgba(38,42,49,.6)_30%,rgba(38,42,49,.6)_70%,rgba(34,211,238,.3))]" />
        {/* Remplissage départ → solde */}
        <div
          className={cn(
            "absolute top-2 h-2 rounded-full",
            up
              ? "bg-gradient-to-r from-cyan-deep to-cyan shadow-[0_0_14px_rgba(34,211,238,.6)]"
              : "bg-gradient-to-l from-[#7a1f30] to-danger shadow-[0_0_14px_rgba(255,77,106,.5)]",
          )}
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        {/* Repère de départ */}
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${startPct}%` }}
        >
          <span className="h-6 w-px bg-text-muted/60" />
          <span className="mt-1 label-caps !text-[10px]">{labels.start}</span>
        </div>
        {/* Position actuelle */}
        <span
          aria-hidden
          className={cn(
            "absolute top-1 size-4 -translate-x-1/2 rounded-full border-2 border-bg",
            up
              ? "bg-cyan-light shadow-[0_0_14px_rgba(103,232,249,.9)]"
              : "bg-danger shadow-[0_0_14px_rgba(255,77,106,.8)]",
          )}
          style={{ left: `${balPct}%` }}
        />
      </div>

      <div className="-mt-4 flex items-center justify-between text-xs">
        <span className="tabular text-danger">
          {format(min)} <span className="ml-1 label-caps">{labels.min}</span>
        </span>
        <span className="tabular text-cyan-light">
          <span className="mr-1 label-caps">{labels.max}</span> {format(max)}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-4 border-t border-border pt-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "flex flex-col gap-1",
              i === 1 && "items-center text-center",
              i === 2 && "items-end text-right",
            )}
          >
            <dd
              className={cn(
                "order-1 tabular text-lg font-semibold sm:text-2xl",
                s.tone === "cyan" && "text-cyan-light",
                s.tone === "danger" && "text-danger",
              )}
            >
              {s.value}
            </dd>
            <dt className="order-2 label-caps">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
