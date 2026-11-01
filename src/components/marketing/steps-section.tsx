import { CreditCard, LineChart, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { fundedRules } from "@/config/rules";
import { formatMoney } from "@/lib/format";

const steps = [
  { key: "one", icon: CreditCard },
  { key: "two", icon: LineChart },
  { key: "three", icon: Wallet },
] as const;

export function StepsSection() {
  const t = useTranslations("Steps");
  const locale = useLocale();

  return (
    <Section id="how-it-works">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <ol className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map(({ key, icon: Icon }, i) => (
          <li key={key}>
            <Reveal delay={i * 0.1} className="h-full">
              <Card className="relative h-full overflow-hidden p-7">
                <span
                  aria-hidden
                  className="absolute -top-4 right-4 tabular text-[7rem] leading-none font-semibold text-white/[0.04]"
                >
                  {i + 1}
                </span>
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10">
                  <Icon className="size-6 text-cyan" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="mb-2 tabular text-xs text-cyan-light">0{i + 1}</p>
                <h3 className="font-display text-xl font-semibold">{t(`items.${key}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {t(`items.${key}.desc`, {
                    threshold: formatMoney(fundedRules.fullSplitThreshold, { locale }),
                    split: fundedRules.profitSplitPct,
                  })}
                </p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex justify-center">
        <ButtonLink href="/challenges" size="lg">
          {t("cta")}
        </ButtonLink>
      </div>
    </Section>
  );
}
