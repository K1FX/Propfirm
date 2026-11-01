import { useLocale, useTranslations } from "next-intl";

import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Row = { name: string; xp: number; me?: boolean };

export function Leaderboard({ rows }: { rows: readonly Row[] }) {
  const t = useTranslations("Dashboard.pass");
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);

  return (
    <Card className="p-5">
      <CardTitle>{t("leaderboard")}</CardTitle>
      <ol className="mt-4 flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
              r.me ? "border border-cyan/50 bg-cyan/10" : "bg-bg/60",
            )}
          >
            <span
              className={cn(
                "w-6 text-center tabular text-xs font-semibold",
                i === 0
                  ? "text-rank-gold"
                  : i === 1
                    ? "text-rank-silver"
                    : i === 2
                      ? "text-rank-bronze"
                      : "text-text-muted",
              )}
            >
              {i + 1}
            </span>
            <span className="flex-1 truncate">
              {r.name}
              {r.me && <span className="ml-2 text-xs text-cyan-light">({t("you")})</span>}
            </span>
            <span className="tabular text-xs text-text-muted">{nf.format(r.xp)} XP</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-text-muted">{t("demoNote")}</p>
    </Card>
  );
}
