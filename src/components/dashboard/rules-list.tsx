import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Card, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AccountView } from "@/server/accounts/service";

type State = "ok" | "pending" | "ko" | "warning";

const icons = { ok: CheckCircle2, pending: CircleDashed, ko: XCircle, warning: AlertTriangle };
const tones = {
  ok: "text-cyan",
  pending: "text-text-muted",
  ko: "text-danger",
  warning: "text-rank-gold",
};

/** Règles du compte, lues dans sa copie figée (`account.rules`). */
export function RulesList({ account }: { account: AccountView }) {
  const t = useTranslations("Dashboard.account");
  const locale = useLocale();
  const e = account.evaluation;
  const r = account.rules;
  const isEval = r.phase === "evaluation";
  const money = (c: number) => formatMoney(c, { locale });

  const rows: { label: string; value: string; state: State }[] = [];

  if (isEval && r.profitTarget !== null) {
    rows.push({
      label: t("target"),
      value: `${money(Math.max(0, e.profit))} / ${money(r.profitTarget)}`,
      state: e.profit >= r.profitTarget ? "ok" : "pending",
    });
  }

  rows.push({
    label: `${t("drawdown")} · ${t("trailing")}`,
    value: e.drawdownLocked
      ? t("locked", { amount: money(e.drawdownThreshold) })
      : `${t("threshold")} ${money(e.drawdownThreshold)}`,
    state:
      account.status === "breached"
        ? "ko"
        : e.drawdownUsedPct >= r.alertThresholdPct
          ? "warning"
          : "ok",
  });

  rows.push({
    label: t("dailyLoss"),
    value:
      r.dailyLossLimit === null
        ? t("none")
        : t("dailyLossValue", { amount: money(r.dailyLossLimit) }),
    state: e.dailyLossLockedDays.length > 0 ? "warning" : "ok",
  });

  if (isEval && r.minTradingDays > 0) {
    rows.push({
      label: t("minDays"),
      value: t("minDaysValue", { count: e.tradingDays, min: r.minTradingDays }),
      state: e.minDaysMet ? "ok" : "pending",
    });
  }

  rows.push({
    label: isEval ? t("consistency") : t("consistencyFunded"),
    value:
      r.consistencyPct === null
        ? t("none")
        : e.bestDayShareOfProfitPct === null
          ? t("consistencyNA", { max: r.consistencyPct })
          : t("consistencyValue", {
              pct: Math.round(e.bestDayShareOfProfitPct),
              max: r.consistencyPct,
            }),
    state:
      r.consistencyPct === null || e.bestDayShareOfProfitPct === null
        ? r.consistencyPct === null
          ? "ok"
          : "pending"
        : e.consistencyOk
          ? "ok"
          : "ko",
  });

  if (!isEval && e.payout) {
    rows.push({
      label: t("winningDays", { min: money(r.winningDayMin) }),
      value: t("winningDaysValue", {
        count: e.payout.winningDays,
        required: e.payout.requiredWinningDays,
      }),
      state: e.payout.winningDays >= e.payout.requiredWinningDays ? "ok" : "pending",
    });
  }

  rows.push({
    label: t("contracts"),
    value: t("contractsValue", r.maxContracts),
    state: e.violations.some((v) => v.type === "maxContracts") ? "warning" : "ok",
  });

  return (
    <Card className="p-5">
      <CardTitle>{t("rules")}</CardTitle>
      <ul className="mt-4 flex flex-col divide-y divide-border">
        {rows.map((row) => {
          const Icon = icons[row.state];
          return (
            <li key={row.label} className="flex items-start gap-3 py-3.5">
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", tones[row.state])}
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">{row.label}</p>
                <p className="mt-0.5 tabular text-xs text-text-muted">{row.value}</p>
              </div>
              <span className={cn("text-xs font-semibold", tones[row.state])}>{t(row.state)}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
