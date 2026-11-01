import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { getOffer, globalRules, programs } from "@/config/plans";
import { formatMoney } from "@/lib/format";

const KEYS = [
  "evaluation",
  "drawdown",
  "payouts",
  "split",
  "real",
  "platforms",
  "refund",
  "countries",
] as const;

/** FAQ en accordéon natif (<details>) : accessible au clavier, fonctionne sans JS. */
export function FaqSection() {
  const t = useTranslations("Faq");
  const locale = useLocale();
  const money = (c: number) => formatMoney(c, { locale });
  const values = {
    rushDays: programs.rush.evalMinDays,
    flexDays: programs.flex.evalMinDays,
    flexConsistency: programs.flex.evalConsistencyPct ?? 0,
    lock: money(globalRules.drawdownLockBuffer),
    winning: globalRules.payoutEveryWinningDays,
    winningMin: money(globalRules.winningDayMin),
    minPayout: money(globalRules.payoutMin),
    capMin: money(getOffer("rush", "25k").funded.payoutCap),
    capMax: money(getOffer("rush", "150k").funded.payoutCap),
    split: globalRules.profitSplitPct,
    maxInstant: globalRules.maxActiveInstantAccounts,
    deadline: globalRules.activationDeadlineDays,
  };

  return (
    <Section id="faq" elevated>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
        {KEYS.map((k) => (
          <details
            key={k}
            className="group rounded-[16px] border border-border bg-surface transition-colors open:border-cyan/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
              {t(`items.${k}.q`)}
              <ChevronDown
                className="size-5 shrink-0 text-text-muted transition-transform group-open:rotate-180 group-open:text-cyan"
                aria-hidden
              />
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">
              {t(`items.${k}.a`, values)}
            </p>
          </details>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/rules" variant="ghost">
          {t("more")}
        </ButtonLink>
      </div>
    </Section>
  );
}
