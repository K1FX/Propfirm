import { CheckCircle2, Clock, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { fundedRules } from "@/config/rules";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { listAccounts } from "@/server/accounts/service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.payouts");
  return { title: t("title") };
}

export default async function PayoutsPage({ params }: PageProps<"/[locale]/dashboard/payouts">) {
  const { locale: raw } = await params;
  setRequestLocale(toLocale(raw));
  const locale = await getLocale();
  const t = await getTranslations("Dashboard.payouts");
  const money = (c: number) => formatMoney(c, { locale });
  const funded = (await listAccounts()).filter((a) => a.status === "funded" && a.payout);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">
          <Clock className="size-3.5" aria-hidden />
          {t("frequency")}
        </Badge>
        <Badge variant="neutral">{t("min", { amount: money(fundedRules.payoutMin) })}</Badge>
        <Badge variant="neutral">
          {t("split", {
            threshold: money(fundedRules.fullSplitThreshold),
            pct: fundedRules.profitSplitPct,
          })}
        </Badge>
      </div>

      {funded.length === 0 && (
        <Card>
          <p className="text-sm text-text-muted">{t("noFunded")}</p>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {funded.map((a) => {
          const p = a.payout!;
          return (
            <Card key={a.id} highlighted={p.eligible} className="flex flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/dashboard/accounts/${a.id}`}
                    className="text-chrome font-display text-3xl font-bold hover:underline"
                  >
                    {formatAccountSize(a.plan.accountSize)}
                  </Link>
                  <p className="mt-1 tabular text-xs text-text-muted">{a.id}</p>
                </div>
                <Badge variant={p.eligible ? "cyan" : "neutral"}>
                  {p.eligible && <CheckCircle2 className="size-3.5" aria-hidden />}
                  {p.eligible ? t("eligible") : t("notEligible")}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-text-muted">{t("available")}</dt>
                  <dd className="mt-1 tabular text-3xl font-semibold text-cyan-light">
                    {money(p.traderShare)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">{t("gross")}</dt>
                  <dd className="mt-1 tabular text-xl font-semibold">{money(p.grossProfit)}</dd>
                </div>
              </dl>
              <ProgressBar
                value={(p.winningDays / p.requiredWinningDays) * 100}
                label={t("winningDays")}
                valueLabel={`${Math.min(p.winningDays, p.requiredWinningDays)} / ${p.requiredWinningDays}`}
              />
              <div className="flex flex-col gap-2">
                <Button disabled className="w-full sm:w-auto sm:self-start">
                  <Wallet aria-hidden />
                  {t("request")}
                </Button>
                <p className="text-xs text-text-muted">{t("requestSoon")}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="flex flex-col gap-3">
        <CardTitle>{t("history")}</CardTitle>
        <p className="text-sm text-text-muted">{t("noHistory")}</p>
      </Card>
    </>
  );
}
