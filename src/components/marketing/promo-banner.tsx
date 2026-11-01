"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { promoBanner } from "@/config/promo";

export function PromoBanner() {
  const t = useTranslations("Promo");
  const [copied, setCopied] = useState(false);

  if (!promoBanner.enabled) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(promoBanner.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : le code reste lisible à l'écran.
    }
  }

  return (
    <div className="border-b border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center text-xs sm:text-sm">
        <span className="text-text-muted">{t("text", { discount: promoBanner.discountPct })}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`${t("copy")} ${promoBanner.code}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 bg-cyan/10 px-2 py-0.5 tabular font-semibold text-cyan-light transition-colors hover:bg-cyan/20"
        >
          {promoBanner.code}
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" strokeWidth={1.5} />
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? t("copied") : ""}
          </span>
        </button>
      </div>
    </div>
  );
}
