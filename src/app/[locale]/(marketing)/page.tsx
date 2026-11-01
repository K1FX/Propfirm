import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ChallengesGrid } from "@/components/marketing/challenges-grid";
import { ContractsTicker } from "@/components/marketing/contracts-ticker";
import { Hero } from "@/components/marketing/hero";
import { PassSection } from "@/components/marketing/pass-section";
import { StepsSection } from "@/components/marketing/steps-section";
import { toLocale } from "@/i18n/routing";

// Structure validée : CLAUDE.md §3.5.
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));

  return (
    <>
      <Hero />
      <ContractsTicker />
      <ChallengesGrid />
      <PassSection />
      <StepsSection />
    </>
  );
}
