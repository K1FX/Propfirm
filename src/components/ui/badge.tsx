import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-border bg-bg-elevated text-text-muted",
        cyan: "border-cyan/40 bg-cyan/10 text-cyan-light",
        danger: "border-danger/40 bg-danger/10 text-danger",
        chrome: "border-transparent bg-chrome",
        bronze: "border-rank-bronze/40 bg-rank-bronze/10 text-rank-bronze",
        silver: "border-rank-silver/40 bg-rank-silver/10 text-rank-silver",
        gold: "border-rank-gold/40 bg-rank-gold/10 text-rank-gold",
        platinum: "border-rank-platinum/40 bg-rank-platinum/10 text-rank-platinum",
        elite: "border-rank-elite/60 bg-rank-elite/10 text-rank-elite glow-cyan",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
