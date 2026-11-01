import { LifeBuoy } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Section } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { support } from "@/config/support";
import { cn } from "@/lib/utils";

import { Flag } from "./flags";
import { WorldMap } from "./world-map";

export function SupportSection() {
  const t = useTranslations("Support");

  return (
    <Section className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <span className="text-xs font-semibold tracking-[0.2em] text-cyan-light uppercase">
            {t("eyebrow")}
          </span>
          <ul className="flex flex-wrap gap-2">
            {support.languages.map((l) => (
              <li
                key={l.code}
                lang={l.code}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
              >
                <Flag code={l.flag} className="h-3 w-[18px] rounded-[2px]" />
                {l.greeting}
              </li>
            ))}
          </ul>
          <h2 className="font-display text-3xl font-bold text-balance sm:text-5xl">
            <span className="block text-cyan drop-shadow-[0_0_18px_rgba(34,211,238,.45)]">
              {t("title1")}
            </span>
            <span className="block text-chrome">{t("title2")}</span>
          </h2>
          <p className="max-w-md text-text-muted">{t("desc")}</p>
          {support.hours && (
            <p className="text-sm text-text-muted">{t("hours", { hours: support.hours })}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/faq" variant="secondary">
              <LifeBuoy aria-hidden />
              {t("getHelp")}
            </ButtonLink>
            {brand.discordUrl && (
              <a
                href={brand.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "chrome" }))}
              >
                <DiscordIcon className="size-4" />
                {t("discord")}
              </a>
            )}
          </div>
        </div>
        <div className="relative">
          <div aria-hidden className="absolute inset-0 rounded-full bg-cyan-deep/20 blur-[100px]" />
          <WorldMap zones={support.timeZones} label={t("mapLabel")} />
        </div>
      </div>
    </Section>
  );
}
