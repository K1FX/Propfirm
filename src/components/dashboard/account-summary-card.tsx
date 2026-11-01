import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "@/i18n/navigation";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AccountView } from "@/server/accounts/service";

import { formatDay } from "./format";
import { StatusBadge } from "./status-badge";

export function AccountSummaryCard({ account }: { account: AccountView }) {
  const t = useTranslations("Dashboard.account");
  const locale = useLocale();
  const money = (c: number, signed = false) => formatMoney(c, { locale, signed, showCents: false });
  const e = account.evaluation;
  const breached = account.status === "breached";
  const passed = account.status === "passed";
  const tPassed = useTranslations("Dashboard.account.passedCard");

  return (
    <Card
      highlighted={account.status === "funded"}
      className={cn(
        "flex flex-col gap-5 p-5 transition-colors",
        breached && "opacity-75",
        passed && "animated-glow border-cyan/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-chrome font-display text-3xl font-bold">
            {formatAccountSize(account.plan.accountSize)}
          </p>
          <p className="mt-1 tabular text-xs text-text-muted">{account.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={account.status} />
          {passed && (
            <Badge variant="cyan" className="animate-pulse">
              <Sparkles className="size-3" aria-hidden />
              {tPassed("update")}
            </Badge>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-text-muted">{t("balance")}</dt>
          <dd className="mt-1 tabular text-lg font-semibold">{money(e.balance)}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">{t("profit")}</dt>
          <dd
            className={cn(
              "mt-1 tabular text-lg font-semibold",
              e.profit >= 0 ? "text-cyan-light" : "text-danger",
            )}
          >
            {money(e.profit, true)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4">
        {account.plan && account.phase === "evaluation" && (
          <ProgressBar
            value={e.targetProgressPct}
            label={t("target")}
            valueLabel={`${money(Math.max(0, e.profit))} / ${money(account.plan.profitTarget)}`}
          />
        )}
        <ProgressBar
          value={e.drawdownUsedPct}
          tone="danger"
          label={t("drawdown")}
          valueLabel={money(e.drawdownRemaining)}
        />
      </div>

      {passed && (
        <ButtonLink href={`/dashboard/accounts/${account.id}`} variant="cyan" size="sm">
          {tPassed("cta")}
          <ArrowUpRight />
        </ButtonLink>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-text-muted">
        <span>{t("purchased", { date: formatDay(account.purchasedAt, locale) })}</span>
        <Link
          href={`/dashboard/accounts/${account.id}`}
          className="inline-flex items-center gap-1 font-semibold text-cyan-light hover:underline"
        >
          {t("details")}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
