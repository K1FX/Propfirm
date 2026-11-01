import { Check, CreditCard, Lock, Bitcoin, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { paymentMethods, planTypes } from "@/config/payments";
import { plans } from "@/config/plans";
import { promo, promoPrice } from "@/config/promo";
import { evaluationRules } from "@/config/rules";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

import { TrackedButtonLink } from "./tracked-link";

/** Section des plans (#plans) : cible de tous les CTA principaux. */
export function ChallengesGrid() {
  const t = useTranslations("Challenges");
  const tp = useTranslations("Plans");
  const locale = useLocale();
  const money = (c: number) => formatMoney(c, { locale });
  const types = (Object.keys(planTypes) as (keyof typeof planTypes)[]).filter((k) => planTypes[k]);

  return (
    <Section id="plans">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {/* Onglets : seuls les types d'offre activés dans la config */}
      <div className="mt-10 flex justify-center">
        <div
          role="tablist"
          aria-label={tp("tabs.label")}
          className="inline-flex rounded-[12px] border border-border bg-surface p-1"
        >
          {types.map((type, i) => (
            <span
              key={type}
              role="tab"
              aria-selected={i === 0}
              className={cn(
                "rounded-[9px] px-4 py-1.5 text-sm font-semibold",
                i === 0 ? "bg-chrome" : "text-text-muted",
              )}
            >
              {tp(`tabs.${type}`)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => {
          const size = formatAccountSize(plan.accountSize);
          const finalPrice = promoPrice(plan.price);
          const rows = [
            { label: t("target"), value: money(plan.profitTarget) },
            { label: t("drawdown"), value: money(plan.maxDrawdown) },
            { label: t("contracts"), value: t("contractsValue", plan.maxContracts) },
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
                <div className="flex flex-col gap-1">
                  {promo.enabled && (
                    <div className="flex items-center gap-2">
                      <s className="tabular text-sm text-text-muted">{money(plan.price)}</s>
                      <Badge variant="cyan" className="px-2 py-0.5 text-[10px]">
                        {tp("save", { pct: promo.discountPct })}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="tabular text-3xl font-semibold text-text">
                      {money(finalPrice)}
                    </span>
                    <span className="text-sm text-text-muted">{t("oneTime")}</span>
                  </div>
                  {promo.enabled && (
                    <span className="text-xs text-cyan-light">
                      {tp("promoApplied", { code: promo.code })}
                    </span>
                  )}
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
                {/* Paiement (Phase 4) : en attendant, page du plan. */}
                <TrackedButtonLink
                  href={`/challenges?plan=${plan.id}`}
                  event={`plan_click_${plan.id}`}
                  variant={plan.recommended ? "chrome" : "secondary"}
                  className="mt-auto w-full"
                >
                  {tp("cta")}
                </TrackedButtonLink>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
        <li className="flex items-center gap-2">
          <Lock className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          {tp("secure")}
        </li>
        <li className="flex items-center gap-2">
          <CreditCard className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          {[paymentMethods.card && tp("card"), paymentMethods.crypto && tp("crypto")]
            .filter(Boolean)
            .join(" & ")}{" "}
          {tp("accepted")}
          {paymentMethods.crypto && <Bitcoin className="size-4" strokeWidth={1.5} aria-hidden />}
        </li>
        <li className="flex items-center gap-2">
          <Zap className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          {tp("instant")}
        </li>
      </ul>
    </Section>
  );
}
