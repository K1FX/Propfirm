import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ChallengesGrid } from "@/components/marketing/challenges-grid";
import { ContractsTicker } from "@/components/marketing/contracts-ticker";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PassSection } from "@/components/marketing/pass-section";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { SupportSection } from "@/components/marketing/support-section";
import { WhyUs } from "@/components/marketing/why-us";
import { toLocale } from "@/i18n/routing";

/**
 * Landing orientée conversion. Ordre : hero + confiance → contrats → how it works → plans →
 * pourquoi nous → Pass → support → avis (si données réelles) → FAQ → CTA final.
 */
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));

  return (
    <>
      <Hero />
      <ContractsTicker />
      <HowItWorks />
      <ChallengesGrid />
      <WhyUs />
      <PassSection />
      <SupportSection />
      <ReviewsSection />
      <FaqSection />
      <FinalCta />
      <StickyCta />
    </>
  );
}
