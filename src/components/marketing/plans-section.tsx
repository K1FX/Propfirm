import { useTranslations } from "next-intl";

import { Section, SectionHeading } from "@/components/ui/section";
import { paymentMethods } from "@/config/payments";
import { globalRules, offers, POPULAR_SIZE } from "@/config/plans";
import { promo } from "@/config/promo";

import { PlansExplorer, type PlansData } from "./plans-explorer";

/**
 * Section des plans (#plans), cible de tous les CTA principaux.
 * Les données sont préparées côté serveur : la config (et Zod) n'est pas envoyée au navigateur.
 */
export function PlansSection() {
  const t = useTranslations("Challenges");

  const data: PlansData = {
    offers: offers.map((o) => ({ ...o })),
    popularSize: POPULAR_SIZE,
    payLaterEnabled: globalRules.payLaterEnabled,
    rules: {
      winningDayMin: globalRules.winningDayMin,
      payoutEveryWinningDays: globalRules.payoutEveryWinningDays,
      payoutMin: globalRules.payoutMin,
      profitSplitPct: globalRules.profitSplitPct,
      maxActiveInstantAccounts: globalRules.maxActiveInstantAccounts,
      activationDeadlineDays: globalRules.activationDeadlineDays,
    },
    promo: {
      enabled: promo.enabled,
      code: promo.code,
      discountPct: promo.discountPct,
      types: promo.types,
    },
    payment: { ...paymentMethods },
  };

  return (
    <Section id="plans">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <div className="mt-10">
        <PlansExplorer data={data} />
      </div>
    </Section>
  );
}
