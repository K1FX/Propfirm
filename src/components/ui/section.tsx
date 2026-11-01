import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}

export function Section({
  className,
  elevated = false,
  children,
  ...props
}: ComponentProps<"section"> & { elevated?: boolean }) {
  return (
    <section
      className={cn(
        "relative scroll-mt-20 py-20 sm:py-28",
        elevated && "border-y border-border bg-bg-elevated",
        className,
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  );
}

type HeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
};

/** Titre de section : petit label cyan + titre chrome + sous-titre. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
  className,
}: HeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold tracking-[0.2em] text-cyan-light uppercase">
          {eyebrow}
        </span>
      )}
      <Tag
        className={cn(
          "text-chrome font-display font-bold text-balance",
          Tag === "h1" ? "text-4xl sm:text-6xl lg:text-7xl" : "text-3xl sm:text-5xl",
        )}
      >
        {title}
      </Tag>
      {subtitle && <p className="text-base text-pretty text-text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}
