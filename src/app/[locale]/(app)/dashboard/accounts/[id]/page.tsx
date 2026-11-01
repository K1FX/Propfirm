import { ArrowLeft, Info, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { AlertsList } from "@/components/dashboard/alerts-list";
import { BalanceRange } from "@/components/dashboard/balance-range";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { formatDay } from "@/components/dashboard/format";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { PassedBanner } from "@/components/dashboard/passed-banner";
import { RulesList } from "@/components/dashboard/rules-list";
import { ProgramBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { TradingCalendar } from "@/components/dashboard/trading-calendar";
import { TradesTable } from "@/components/dashboard/trades-table";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { getTradingDay } from "@/lib/session";
import { getAccount } from "@/server/accounts/service";
import { demoAccounts } from "@/server/demo/data";

export function generateStaticParams() {
  return demoAccounts.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/accounts/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/dashboard/accounts/[id]">) {
  const { locale: raw, id } = await params;
  setRequestLocale(toLocale(raw));
  const account = await getAccount(id);
  if (!account) notFound();

  const locale = await getLocale();
  const t = await getTranslations("Dashboard");
  const e = account.evaluation;
  const isEval = account.phase === "evaluation";
  const fatal = e.violations.find((v) => v.fatal);
  const money = (c: number, signed = false) => formatMoney(c, { locale, signed, showCents: false });

  const rules = account.rules;
  const targetBalance = account.startBalance + (rules.profitTarget ?? 0);
  const highWater = Math.max(account.startBalance, ...account.days.map((d) => d.closingBalance));

  const chartData = [
    {
      label: formatDay(account.purchasedAt, locale),
      balance: account.startBalance / 100,
      threshold: (account.startBalance - rules.maxDrawdown) / 100,
    },
    ...e.drawdownHistory.map((h) => ({
      label: formatDay(h.day, locale),
      balance: h.closingBalance / 100,
      threshold: h.threshold / 100,
    })),
  ];

  const tradesPerDay = new Map<string, number>();
  for (const tr of account.trades) {
    const day = getTradingDay(new Date(tr.closedAt));
    tradesPerDay.set(day, (tradesPerDay.get(day) ?? 0) + 1);
  }
  const calendarDays = account.days.map((d) => ({
    day: d.day,
    pnl: d.pnl,
    trades: tradesPerDay.get(d.day) ?? 0,
  }));

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center gap-1.5 self-start text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("account.back")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-chrome font-display text-4xl font-bold">
            {formatAccountSize(account.startBalance)}
          </h1>
          <StatusBadge status={account.status} />
          <ProgramBadge type={account.programType} />
          <span className="tabular text-sm text-text-muted">{account.id}</span>
        </div>
      </div>

      {(account.status === "passed" || account.status === "passed_awaiting_activation") && (
        <PassedBanner
          activation={
            account.status === "passed_awaiting_activation" && account.activation
              ? {
                  fee: money(account.activation.fee),
                  deadline: formatDay(account.activation.deadline, locale, "long"),
                }
              : null
          }
        />
      )}
      {account.status === "expired" && (
        <p className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          {t("account.expired")}
        </p>
      )}
      {fatal && (
        <p className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          {t("account.breached", {
            date: formatDay(fatal.day, locale, "long"),
            reason: t(`violations.${fatal.type}`),
          })}
        </p>
      )}
      {!isEval && (
        <p className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          {t("account.fundedNote")}
        </p>
      )}
      {account.status !== "breached" && e.alerts.length > 0 && <AlertsList accounts={[account]} />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricTile label={t("account.metrics.balance")} value={money(e.balance)} />
        <MetricTile
          label={t("account.metrics.minimum")}
          value={money(e.drawdownThreshold)}
          tone="danger"
          hint={
            e.drawdownLocked
              ? t("account.locked", { amount: money(e.drawdownThreshold) })
              : t("account.trailing")
          }
        />
        <MetricTile
          label={t("account.metrics.pnl")}
          value={money(e.profit, true)}
          tone={e.profit >= 0 ? "cyan" : "danger"}
        />
        <MetricTile label={t("account.metrics.days")} value={e.tradingDays} />
        {isEval ? (
          <MetricTile
            label={t("account.metrics.target")}
            value={money(Math.max(0, (rules.profitTarget ?? 0) - e.profit))}
          />
        ) : (
          <MetricTile
            label={t("account.metrics.withdrawable")}
            value={money(e.payout?.traderShare ?? 0)}
            tone="cyan"
          />
        )}
      </div>

      <Card className="p-5 sm:p-6">
        <EquityChart
          data={chartData}
          target={isEval ? targetBalance / 100 : null}
          locale={locale}
          title={t("account.equity")}
          labels={{
            balance: t("account.legend.balance"),
            threshold: t("account.legend.minimum"),
            target: t("account.legend.target"),
          }}
        />
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 label-caps">{t("account.range.title")}</h2>
        <BalanceRange
          min={e.drawdownThreshold}
          start={account.startBalance}
          max={isEval ? targetBalance : Math.max(highWater, e.balance)}
          balance={e.balance}
          format={(c) => money(c)}
          labels={{
            min: t("account.range.mll"),
            start: t("account.range.start"),
            max: isEval ? t("account.range.target") : t("account.range.high"),
          }}
          stats={[
            {
              label: t("account.range.drawdown"),
              value: money(e.drawdownRemaining),
              tone: e.drawdownUsedPct >= 80 ? "danger" : "default",
            },
            {
              label: t("account.range.balance"),
              value: money(e.balance),
              tone: e.profit >= 0 ? "cyan" : "danger",
            },
            isEval
              ? {
                  label: t("account.range.remaining"),
                  value: money(Math.max(0, targetBalance - e.balance)),
                }
              : {
                  label: t("account.range.profit"),
                  value: money(Math.max(0, e.profit)),
                  tone: "cyan",
                },
          ]}
        />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr] [&>*]:min-w-0">
        <Card className="p-5 sm:p-6">
          <TradingCalendar days={calendarDays} locale={locale} />
        </Card>
        <RulesList account={account} />
      </div>

      <section aria-labelledby="trades-title" className="flex flex-col gap-4">
        <h2 id="trades-title" className="label-caps">
          {t("account.trades")}
        </h2>
        {account.trades.length > 0 ? (
          <TradesTable trades={account.trades} />
        ) : (
          <p className="text-sm text-text-muted">{t("account.noTrades")}</p>
        )}
      </section>
    </>
  );
}
