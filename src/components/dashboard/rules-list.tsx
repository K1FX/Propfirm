import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Card, CardTitle } from "@/components/ui/card";
import { evaluationRules, fundedRules } from "@/config/rules";
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

export function RulesList({ account }: { account: AccountView }) {
  const t = useTranslations("Dashboard.account");
  const locale = useLocale();
  const e = account.evaluation;
  const isEval = account.phase === "evaluation";
  const money = (c: number) => formatMoney(c, { locale });

  const rows: { label: string; value: string; state: State }[] = [];

  if (isEval) {
    rows.push({
      label: t("target"),
      value: `${money(Math.max(0, e.profit))} / ${money(account.plan.profitTarget)}`,
      state: e.profit >= account.plan.profitTarget ? "ok" : "pending",
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
        : e.drawdownUsedPct >= evaluationRules.alertThresholdPct
          ? "warning"
          : "ok",
  });

  rows.push({
    label: t("minDays"),
    value: t("minDaysValue", { count: e.tradingDays, min: evaluationRules.minTradingDays }),
    state: e.minDaysMet ? "ok" : "pending",
  });

  if (isEval) {
    rows.push({
      label: t("consistency"),
      value:
        e.bestDayShareOfProfitPct === null
          ? t("consistencyNA")
          : t("consistencyValue", {
              pct: Math.round(e.bestDayShareOfProfitPct),
              max: evaluationRules.consistencyMaxBestDayPct,
            }),
      state: e.bestDayShareOfProfitPct === null ? "pending" : e.consistencyOk ? "ok" : "ko",
    });
  } else {
    rows.push({
      label: t("winningDays", { min: money(fundedRules.winningDayMin) }),
      value: t("winningDaysValue", {
        count: e.winningDays,
        required: fundedRules.payoutMinWinningDays,
      }),
      state: e.winningDays >= fundedRules.payoutMinWinningDays ? "ok" : "pending",
    });
  }

  const contractViolation = e.violations.some((v) => v.type === "maxContracts");
  rows.push({
    label: t("contracts"),
    value: t("contractsValue", account.plan.maxContracts),
    state: contractViolation ? "warning" : "ok",
  });

  return (
    <Card className="p-5">
      <CardTitle>{t("rules")}</CardTitle>
      <ul className="mt-4 flex flex-col divide-y divide-border">
        {rows.map((r) => {
          const Icon = icons[r.state];
          return (
            <li key={r.label} className="flex items-start gap-3 py-3.5">
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", tones[r.state])}
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">{r.label}</p>
                <p className="mt-0.5 tabular text-xs text-text-muted">{r.value}</p>
              </div>
              <span className={cn("text-xs font-semibold", tones[r.state])}>{t(r.state)}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
