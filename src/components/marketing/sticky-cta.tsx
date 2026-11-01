"use client";

import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { promo } from "@/config/promo";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Bouton fixe en bas de l'écran (mobile) : visible une fois le hero dépassé,
 * masqué quand la section des plans est à l'écran.
 */
export function StickyCta() {
  const t = useTranslations("StickyCta");
  const [pastHero, setPastHero] = useState(false);
  const [plansVisible, setPlansVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const plans = document.getElementById("plans");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) =>
        setPastHero(!e!.isIntersecting && e!.boundingClientRect.top < 0),
      );
      o.observe(hero);
      observers.push(o);
    }
    if (plans) {
      const o = new IntersectionObserver(([e]) => setPlansVisible(e!.isIntersecting), {
        threshold: 0.05,
      });
      o.observe(plans);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const show = pastHero && !plansVisible;

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-out lg:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0",
      )}
    >
      <ButtonLink
        href="/#plans"
        size="lg"
        tabIndex={show ? undefined : -1}
        onClick={() => track("sticky_cta")}
        className="w-full shadow-[inset_0_1px_0_#fff,0_0_0_1px_#3a3f47,0_0_40px_rgba(34,211,238,.45)]"
      >
        <Zap className="text-cyan-deep" aria-hidden />
        {promo.enabled ? t("label", { discount: promo.discountPct }) : t("labelNoPromo")}
      </ButtonLink>
    </div>
  );
}
