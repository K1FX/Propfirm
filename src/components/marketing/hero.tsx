import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { activeHeroTitle } from "@/config/hero";
import { plans } from "@/config/plans";
import { evaluationRules, fundedRules } from "@/config/rules";
import { buildTrustItems } from "@/config/trust";
import { formatAccountSize } from "@/lib/format";
import { cn } from "@/lib/utils";

import { HeroCards } from "./hero-cards";
import { TrackedButtonLink, TrackedExternalLink } from "./tracked-link";
import { TrustBar } from "./trust-bar";

export function Hero() {
  const t = useTranslations("Hero");
  const tTrust = useTranslations("Trust");
  const locale = useLocale();

  const maxSize = formatAccountSize(Math.max(...plans.map((p) => p.accountSize)));
  const values = {
    size: locale === "fr" ? `${maxSize} $` : `$${maxSize}`,
    split: fundedRules.profitSplitPct,
    days: evaluationRules.minTradingDays,
  };
  const hl = (chunks: ReactNode) => (
    <span className="text-cyan drop-shadow-[0_0_18px_rgba(34,211,238,.55)] [-webkit-text-fill-color:currentColor]">
      {chunks}
    </span>
  );

  // Chiffres de confiance : uniquement config (promesses) ou vraies stats au-delà des seuils.
  const trustItems = buildTrustItems().map((i) => ({ ...i, label: tTrust(i.labelKey) }));

  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)] opacity-60"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-deep/25 blur-[150px]"
      />

      <Container className="relative grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <div className="flex flex-col items-start gap-7">
          <Badge variant="cyan" className="tracking-[0.15em] uppercase">
            {t("badge")}
          </Badge>
          <h1 className="font-display text-[2.4rem] leading-[1.05] font-bold text-balance sm:text-6xl lg:text-[3.75rem]">
            <span className="block text-chrome">
              {t.rich(`titles.${activeHeroTitle}.line1`, { ...values, hl })}
            </span>
            <span className="block text-chrome">
              {t.rich(`titles.${activeHeroTitle}.line2`, { ...values, hl })}
            </span>
          </h1>
          <p className="max-w-xl text-base text-pretty text-text-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <TrackedButtonLink
                href="/#plans"
                event="hero_start"
                size="lg"
                className="w-full shadow-[inset_0_1px_0_#fff,0_0_0_1px_#3a3f47,0_0_40px_rgba(34,211,238,.35)] sm:w-auto"
              >
                {t("ctaPrimary")}
                <ArrowRight strokeWidth={2} />
              </TrackedButtonLink>
              <span className="text-xs text-text-muted">{t("ctaHint")}</span>
            </div>
            {brand.discordUrl && (
              <TrackedExternalLink
                href={brand.discordUrl}
                event="hero_discord"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                <DiscordIcon className="size-5" />
                {t("ctaDiscord")}
              </TrackedExternalLink>
            )}
          </div>

          <TrustBar items={trustItems} locale={locale} label={tTrust("label")} />
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
