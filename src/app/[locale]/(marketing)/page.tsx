import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { toLocale } from "@/i18n/routing";

import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";

// Page d'accueil provisoire (Phase 0). La vraie page d'accueil (§3.5) arrive en Phase 1.
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));
  const t = useTranslations();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <Image src="/logo.svg" alt="" width={120} height={120} priority />
      <span className="rounded-full border border-border px-4 py-1 text-xs font-semibold tracking-widest text-cyan-light uppercase">
        {t("Home.badge")}
      </span>
      <h1 className="text-chrome text-4xl font-bold sm:text-6xl">{t("Home.title")}</h1>
      <p className="text-text-muted">{t("Home.subtitle")}</p>
      <nav className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl border border-border px-5 py-2.5 transition-colors hover:border-cyan"
        >
          {t("Home.dashboard")}
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-border px-5 py-2.5 transition-colors hover:border-cyan"
        >
          {t("Home.admin")}
        </Link>
        <Link
          href="/"
          locale={locale === "fr" ? "en" : "fr"}
          aria-label={t("LocaleSwitcher.label")}
          className="rounded-xl border border-border px-5 py-2.5 tabular uppercase transition-colors hover:border-cyan"
        >
          {locale === "fr" ? "en" : "fr"}
        </Link>
      </nav>
      <p className="max-w-xl text-xs text-text-muted">
        {t("Legal.disclaimer", { brand: brand.name })}
      </p>
    </main>
  );
}
