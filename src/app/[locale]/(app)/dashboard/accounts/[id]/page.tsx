import { ArrowLeft, CheckCircle2, Info, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { AlertsList } from "@/components/dashboard/alerts-list";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { formatDay } from "@/components/dashboard/format";
import { RulesList } from "@/components/dashboard/rules-list";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TradesTable } from "@/components/dashboard/trades-table";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { formatAccountSize, formatMoney } from "@/lib/format";
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
  const money = (c: number, signed = false) => formatMoney(c, { locale, signed });
  const isEval = account.phase === "evaluation";
  const fatal = e.violations.find((v) => v.fatal);

  const chartData = [
    {
      label: formatDay(account.purchasedAt, locale),
      balance: account.startBalance / 100,
      threshold: (account.startBalance - account.plan.maxDrawdown) / 100,
    },
    ...e.drawdownHistory.map((h) => ({
      label: formatDay(h.day, locale),
      balance: h.closingBalance / 100,
      threshold: h.threshold / 100,
    })),
  ];

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
            {formatAccountSize(account.plan.accountSize)}
          </h1>
          <StatusBadge status={account.status} />
          <span className="tabular text-sm text-text-muted">{account.id}</span>
        </div>
      </div>

      {fatal && (
        <p className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          {t("account.breached", {
            date: formatDay(fatal.day, locale, "long"),
            reason: t(`violations.${fatal.type}`),
          })}
        </p>
      )}
      {account.status === "passed" && (
        <p className="flex items-start gap-2.5 rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          {t("account.passed")}
        </p>
      )}
      {!isEval && (
        <p className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          {t("account.fundedNote")}
        </p>
      )}
      {account.status !== "breached" && e.alerts.length > 0 && <AlertsList accounts={[account]} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t("account.balance")} value={money(e.balance)} />
        <StatTile
          label={t("account.profit")}
          value={money(e.profit, true)}
          tone={e.profit >= 0 ? "cyan" : "danger"}
        />
        <StatTile
          label={t("account.drawdown")}
          value={money(e.drawdownRemaining)}
          hint={
            e.drawdownLocked
              ? t("account.locked", { amount: money(e.drawdownThreshold) })
              : `${t("account.threshold")} ${money(e.drawdownThreshold)}`
          }
          tone={e.drawdownUsedPct >= 80 ? "danger" : "default"}
        />
        <StatTile label={t("account.tradingDays")} value={e.tradingDays} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="flex flex-col gap-5 p-5">
          <CardTitle>{t("account.equity")}</CardTitle>
          <EquityChart
            data={chartData}
            target={isEval ? (account.startBalance + account.plan.profitTarget) / 100 : null}
            locale={locale}
            title={t("account.equity")}
            labels={{
              balance: t("account.chartBalance"),
              threshold: t("account.chartThreshold"),
              target: t("account.chartTarget"),
            }}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {isEval ? (
              <ProgressBar
                value={e.targetProgressPct}
                label={t("account.target")}
                valueLabel={`${money(Math.max(0, e.profit))} / ${money(account.plan.profitTarget)}`}
              />
            ) : (
              <ProgressBar
                value={0}
                label={t("account.target")}
                valueLabel={t("account.noTarget")}
              />
            )}
            <ProgressBar
              value={e.drawdownUsedPct}
              tone="danger"
              label={t("account.drawdown")}
              valueLabel={`${money(e.drawdownRemaining)} / ${money(account.plan.maxDrawdown)}`}
            />
          </div>
        </Card>
        <RulesList account={account} />
      </div>

      <section aria-labelledby="trades-title" className="flex flex-col gap-4">
        <h2 id="trades-title" className="font-display text-lg font-semibold">
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
