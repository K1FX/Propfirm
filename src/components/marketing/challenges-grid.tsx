import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { plans } from "@/config/plans";
import { evaluationRules } from "@/config/rules";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ChallengesGrid() {
  const t = useTranslations("Challenges");
  const locale = useLocale();
  const money = (c: number) => formatMoney(c, { locale });

  return (
    <Section id="challenges">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => {
          const size = formatAccountSize(plan.accountSize);
          const rows = [
            { label: t("target"), value: money(plan.profitTarget) },
            { label: t("drawdown"), value: money(plan.maxDrawdown) },
            {
              label: t("contracts"),
              value: t("contractsValue", plan.maxContracts),
            },
            { label: t("minDays"), value: String(evaluationRules.minTradingDays) },
            {
              label: t("dailyLoss"),
              value: plan.dailyLossLimit ? money(plan.dailyLossLimit) : t("none"),
            },
            { label: t("timeLimit"), value: t("unlimited") },
          ];

          return (
            <Reveal key={plan.id} delay={i * 0.08} className="h-full">
              <Card
                highlighted={plan.recommended}
                className={cn(
                  "relative flex h-full flex-col gap-6 transition-transform duration-300 hover:-translate-y-1",
                  plan.recommended &&
                    "bg-[linear-gradient(180deg,rgba(34,211,238,.08),transparent_40%)]",
                )}
              >
                {plan.recommended && (
                  <Badge variant="cyan" className="absolute -top-3 left-6 bg-bg">
                    {t("recommended")}
                  </Badge>
                )}
                <div>
                  <p className="text-sm text-text-muted">{t("account")}</p>
                  <p className="text-chrome font-display text-5xl font-bold">{size}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="tabular text-3xl font-semibold text-text">
                    {money(plan.price)}
                  </span>
                  <span className="text-sm text-text-muted">{t("oneTime")}</span>
                </div>
                <dl className="flex flex-col gap-3 border-t border-border pt-5 text-sm">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-2 text-text-muted">
                        <Check className="size-3.5 text-cyan" strokeWidth={2} aria-hidden />
                        {r.label}
                      </dt>
                      <dd className="text-right tabular text-text">{r.value}</dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink
                  href={`/challenges?plan=${plan.id}`}
                  variant={plan.recommended ? "chrome" : "secondary"}
                  className="mt-auto w-full"
                >
                  {t("cta", { size })}
                </ButtonLink>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-10 text-center">
        <ButtonLink href="/rules" variant="ghost">
          {t("compare")}
        </ButtonLink>
      </p>
    </Section>
  );
}
