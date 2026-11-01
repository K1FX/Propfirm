import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { fundedRules } from "@/config/rules";
import { formatMoney } from "@/lib/format";

import { HeroCards } from "./hero-cards";

export function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();

  // Chiffres clés : uniquement des faits issus de la configuration (aucune statistique inventée).
  const stats = [
    { value: t("stats.splitValue", { pct: 100 }), label: t("stats.split") },
    { value: formatMoney(fundedRules.activationFee, { locale }), label: t("stats.activation") },
    { value: "1", label: t("stats.steps") },
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-deep/30 blur-[140px]"
      />

      <Container className="relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div className="flex flex-col items-start gap-7">
          <Badge variant="cyan" className="tracking-[0.15em] uppercase">
            {t("badge")}
          </Badge>
          <h1 className="text-chrome font-display text-[2.6rem] leading-[1.05] font-bold text-balance sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base text-pretty text-text-muted sm:text-lg">
            {t("subtitle", { passName: brand.passName })}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/challenges" size="lg">
              {t("ctaPrimary")}
              <ArrowRight strokeWidth={2} />
            </ButtonLink>
            <ButtonLink href="/pass" variant="secondary" size="lg">
              {t("ctaSecondary", { passName: brand.passName })}
            </ButtonLink>
          </div>
          <dl className="mt-4 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-border pt-7">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dt className="order-2 text-xs text-text-muted sm:text-sm">{s.label}</dt>
                <dd className="order-1 tabular text-xl font-semibold text-cyan-light sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroCards
          evalLabel={t("cardEval")}
          fundedLabel={t("cardFunded")}
          subtitle={t("cardFooter")}
        />
      </Container>
    </section>
  );
}
