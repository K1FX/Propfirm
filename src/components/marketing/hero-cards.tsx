"use client";

import { motion, useReducedMotion } from "framer-motion";

import { AccountPass } from "@/components/ui/account-pass";

import { IntroCar, useIntroPhase } from "./hero-intro";

type Props = { evalLabel: string; fundedLabel: string; subtitle: string };

/**
 * Visuel du hero : intro (voiture qui patine puis part), puis les deux billets
 * « Aurum Pass » (150K évaluation + 50K financé) qui apparaissent.
 */
export function HeroCards({ evalLabel, fundedLabel, subtitle }: Props) {
  const reduce = useReducedMotion();
  const { phase, cardsVisible } = useIntroPhase();

  const float = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -10, 0] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative mx-auto h-[400px] w-full max-w-[480px] sm:h-[480px]" aria-hidden>
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-1/2 rounded-full bg-cyan/15 blur-[100px]" />
      <IntroCar phase={phase} />
      <motion.div
        className="absolute top-0 left-[4%] w-[46%] -rotate-[8deg]"
        initial={reduce ? false : { opacity: 0, y: 30 }}
        animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div {...float(0)}>
          <AccountPass
            variant="evaluation"
            size="150K"
            status={evalLabel}
            subtitle={subtitle}
            serial="AF-150K-0001"
          />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute right-[4%] bottom-0 w-[46%] rotate-[7deg]"
        initial={reduce ? false : { opacity: 0, y: 30 }}
        animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div {...float(1.5)}>
          <AccountPass
            variant="funded"
            size="50K"
            status={fundedLabel}
            subtitle={subtitle}
            serial="AF-50K-0002"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
