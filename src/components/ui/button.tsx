import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        chrome: "bg-chrome hover:brightness-110 active:brightness-95",
        secondary:
          "border border-border bg-transparent text-text hover:border-cyan hover:text-cyan-light",
        cyan: "bg-cyan text-[#0B0D10] hover:bg-cyan-light glow-cyan",
        ghost: "text-text-muted hover:bg-surface hover:text-text",
      },
      size: {
        sm: "h-9 rounded-[10px] px-3.5 text-sm",
        md: "h-11 rounded-[12px] px-5 text-sm",
        lg: "h-13 rounded-[12px] px-7 text-base",
        icon: "size-10 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "chrome", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariantProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

/** Lien interne (localisé) avec l'apparence d'un bouton. */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
