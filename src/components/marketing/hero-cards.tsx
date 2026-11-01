"use client";

import { motion, useReducedMotion } from "framer-motion";

import { AccountCard } from "@/components/ui/account-card";

type Props = { evalLabel: string; fundedLabel: string; footer: string };

/** Les deux cartes inclinées du hero (métal 150K + financée 50K). */
export function HeroCards({ evalLabel, fundedLabel, footer }: Props) {
  const reduce = useReducedMotion();

  const float = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -10, 0] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[540px] sm:h-[420px]" aria-hidden>
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-1/2 rounded-full bg-cyan/15 blur-[100px]" />
      <motion.div
        className="absolute top-0 right-0 w-[74%] rotate-[7deg]"
        initial={reduce ? false : { opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div {...float(0)}>
          <AccountCard variant="metal" size="150K" status={evalLabel} footer={footer} />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 w-[74%] -rotate-[6deg]"
        initial={reduce ? false : { opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div {...float(1.5)}>
          <AccountCard variant="funded" size="50K" status={fundedLabel} footer={footer} />
        </motion.div>
      </motion.div>
    </div>
  );
}
