import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Container } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

import { TrackedButtonLink, TrackedExternalLink } from "./tracked-link";

export function FinalCta() {
  const t = useTranslations("FinalCta");

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden border-t border-border py-24">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)] opacity-50"
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[480px] w-[900px] -translate-1/2 rounded-full bg-cyan-deep/30 blur-[150px]"
      />
      <Container className="relative flex flex-col items-center gap-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG décoratif */}
        <img src="/logo.svg" alt="" width={72} height={72} className="size-16 sm:size-20" />
        <h2 className="text-chrome font-display text-4xl font-bold text-balance sm:text-6xl lg:text-7xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-text-muted sm:text-lg">{t("subtitle")}</p>
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <TrackedButtonLink
            href="/#plans"
            event="final_start"
            size="lg"
            className="w-full animate-cta-pulse sm:w-auto"
          >
            {t("start")}
            <ArrowRight strokeWidth={2} />
          </TrackedButtonLink>
          {brand.discordUrl && (
            <TrackedExternalLink
              href={brand.discordUrl}
              event="final_discord"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              <DiscordIcon className="size-5" />
              {t("discord")}
            </TrackedExternalLink>
          )}
        </div>
      </Container>
    </section>
  );
}
