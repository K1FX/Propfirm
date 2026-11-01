import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  highlighted = false,
  ...props
}: ComponentProps<"div"> & { highlighted?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[20px] border bg-surface p-6",
        highlighted ? "border-cyan/60 glow-cyan" : "border-border",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-text-muted", className)} {...props} />;
}
