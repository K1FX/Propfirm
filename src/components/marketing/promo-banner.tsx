"use client";

import { Check, Copy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { promo } from "@/config/promo";

const DISMISS_KEY = `af-promo-dismissed-${promo.code}`;

function remaining(endsAt: number, now: number) {
  const s = Math.max(0, Math.floor((endsAt - now) / 1000));
  return {
    d: Math.floor(s / 86_400),
    h: Math.floor((s % 86_400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

/** Bandeau promo : code copiable, compte à rebours, masquable. */
export function PromoBanner() {
  const t = useTranslations("Promo");
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const endsAt = new Date(promo.endsAt).getTime();

  useEffect(() => {
    const read = setTimeout(() => {
      try {
        if (localStorage.getItem(DISMISS_KEY)) setHidden(true);
      } catch {
        // stockage indisponible : bandeau affiché
      }
      setNow(Date.now());
    }, 0);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(read);
      clearInterval(tick);
    };
  }, []);

  if (!promo.enabled || hidden || (now !== null && now >= endsAt)) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papiers indisponible : le code reste lisible
    }
  }

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignoré
    }
  }

  const r = now !== null ? remaining(endsAt, now) : null;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative border-b border-border bg-[linear-gradient(90deg,rgba(10,95,116,.25),rgba(7,8,10,1)_30%,rgba(7,8,10,1)_70%,rgba(10,95,116,.25))]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2 text-center text-xs sm:text-sm">
        <span className="font-semibold text-text">
          {t("text", { discount: promo.discountPct })}
        </span>
        <span className="text-text-muted">— {t("use")}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`${t("copy")} ${promo.code}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 bg-cyan/10 px-2 py-0.5 tabular font-semibold text-cyan-light transition-colors hover:bg-cyan/20"
        >
          {promo.code}
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" strokeWidth={1.5} />
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? t("copied") : ""}
          </span>
        </button>
        {r && (
          <span className="hidden items-center gap-1.5 tabular text-text-muted sm:inline-flex">
            {t("endsIn")}
            <span className="text-text">
              {r.d > 0 && `${r.d}${t("units.d")} `}
              {pad(r.h)}
              {t("units.h")} {pad(r.m)}
              {t("units.m")} {pad(r.s)}
              {t("units.s")}
            </span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("close")}
        className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-surface hover:text-text"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
