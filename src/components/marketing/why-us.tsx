import { BadgeDollarSign, CalendarClock, Trophy, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { evaluationRules, fundedRules } from "@/config/rules";
import { formatMoney } from "@/lib/format";

export function WhyUs() {
  const t = useTranslations("WhyUs");
  const locale = useLocale();
  const money = (c: number) => formatMoney(c, { locale });

  const items = [
    { key: "activation", icon: BadgeDollarSign, values: { fee: money(fundedRules.activationFee) } },
    { key: "eod", icon: TrendingUp, values: { lock: money(evaluationRules.drawdownLockBuffer) } },
    {
      key: "payouts",
      icon: CalendarClock,
      values: { days: fundedRules.payoutFrequencyDays, winning: fundedRules.payoutMinWinningDays },
    },
    { key: "pass", icon: Trophy, values: {} },
  ] as const;

  return (
    <Section elevated>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ key, icon: Icon, values }, i) => (
          <Reveal key={key} delay={i * 0.08} className="h-full">
            <Card className="group flex h-full flex-col gap-4 p-6 transition-colors hover:border-cyan/40">
              <span className="flex size-11 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 transition-shadow group-hover:shadow-[0_0_24px_rgba(34,211,238,.35)]">
                <Icon className="size-5 text-cyan" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                {t(`items.${key}.desc`, values)}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
