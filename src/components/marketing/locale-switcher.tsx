"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn("inline-flex rounded-[10px] border border-border p-0.5", className)}
    >
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          aria-label={t(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-[8px] px-2.5 py-1 tabular text-xs uppercase transition-colors",
            l === locale ? "bg-surface text-cyan-light" : "text-text-muted hover:text-text",
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
