"use client";

import type { CSSProperties, ReactNode } from "react";

import { useInViewOnce } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** Apparition douce au scroll, en CSS (désactivée si l'utilisateur réduit les animations). */
export function Reveal({ children, delay = 0, className }: Props) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
