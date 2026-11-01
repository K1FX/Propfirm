import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { LeaderboardDemoNote } from "@/components/leaderboard/demo-note";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { Section, SectionHeading } from "@/components/ui/section";
import { pickClientMessages } from "@/i18n/client-messages";
import { toLocale } from "@/i18n/routing";
import { getLeaderboard } from "@/server/leaderboard/service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Leaderboard");
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function LeaderboardPage({ params }: PageProps<"/[locale]/leaderboard">) {
  const { locale: raw } = await params;
  setRequestLocale(toLocale(raw));
  const locale = await getLocale();
  const t = await getTranslations("Leaderboard");
  // Page publique : on n'expose pas l'utilisateur de démo.
  const entries = getLeaderboard().filter((e) => !e.me);
  const messages = await pickClientMessages("leaderboard");

  return (
    <Section className="overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-[360px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-deep/25 blur-[140px]"
      />
      <div className="relative flex flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <LeaderboardDemoNote />
        <NextIntlClientProvider messages={messages}>
          <LeaderboardView entries={entries} locale={locale} />
        </NextIntlClientProvider>
      </div>
    </Section>
  );
}
