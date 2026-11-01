import { Gift, Trophy, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountSummaryCard } from "@/components/dashboard/account-summary-card";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { formatDay } from "@/components/dashboard/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { getRankProgress } from "@/config/pass";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { formatMoney } from "@/lib/format";
import { listAccounts } from "@/server/accounts/service";
import { DEMO_TODAY, demoUser } from "@/server/demo/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.nav");
  return { title: t("overview") };
}

export default async function DashboardHome({ params }: PageProps<"/[locale]/dashboard">) {
  const { locale: raw } = await params;
  setRequestLocale(toLocale(raw));
  const locale = await getLocale();
  const t = await getTranslations("Dashboard");
  const tPass = await getTranslations("Pass");

  const accounts = await listAccounts();
  const active = accounts.filter((a) => a.status !== "breached" && a.status !== "failed");
  const funded = accounts.filter((a) => a.status === "funded");
  const fundedProfit = funded.reduce((s, a) => s + a.evaluation.profit, 0);
  const payoutAvailable = funded.reduce(
    (s, a) => s + (a.payout?.eligible ? a.payout.traderShare : 0),
    0,
  );
  const rank = getRankProgress(demoUser.totalXp);

  return (
    <>
      <PageHeader
        title={t("overview.greeting", { name: demoUser.displayName })}
        subtitle={t("overview.subtitle", { date: formatDay(DEMO_TODAY, locale, "long") })}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t("overview.activeAccounts")} value={active.length} icon={Wallet} />
        <StatTile
          label={t("overview.fundedProfit")}
          value={formatMoney(fundedProfit, { locale, signed: true, showCents: false })}
          tone={fundedProfit >= 0 ? "cyan" : "danger"}
        />
        <StatTile
          label={t("overview.payoutAvailable")}
          value={formatMoney(payoutAvailable, { locale, showCents: false })}
          icon={Gift}
          tone="cyan"
        />
        <StatTile
          label={t("overview.rank")}
          value={tPass(`ranks.${rank.current.id}.name`)}
          hint={`${new Intl.NumberFormat(locale).format(demoUser.totalXp)} XP`}
          icon={Trophy}
          mono={false}
        />
      </div>

      <section aria-labelledby="alerts-title" className="flex flex-col gap-3">
        <h2 id="alerts-title" className="font-display text-lg font-semibold">
          {t("overview.alerts")}
        </h2>
        <AlertsList accounts={accounts} />
      </section>

      <section aria-labelledby="accounts-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="accounts-title" className="font-display text-lg font-semibold">
            {t("overview.myAccounts")}
          </h2>
          <Link href="/dashboard/accounts" className="text-sm text-cyan-light hover:underline">
            {t("overview.viewAll")}
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {active.map((a) => (
            <AccountSummaryCard key={a.id} account={a} />
          ))}
        </div>
      </section>
    </>
  );
}
