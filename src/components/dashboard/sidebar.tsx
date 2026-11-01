"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { dashboardNav } from "./nav-items";

function useIsActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Barre latérale (desktop). */
export function Sidebar() {
  const t = useTranslations("Dashboard.nav");
  const isActive = useIsActive();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-bg-elevated lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label={brand.name}>
          <Logo />
        </Link>
      </div>
      <nav aria-label={t("label")} className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {dashboardNav.map(({ href, key, icon: Icon, ...rest }) => {
            const active = isActive(href, "exact" in rest);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-surface text-text ring-1 ring-border"
                      : "text-text-muted hover:bg-surface/60 hover:text-text",
                  )}
                >
                  <Icon
                    className={cn("size-4", active ? "text-cyan" : "")}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  {t(key, { passName: brand.passName })}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 border-t border-border p-4">
        <ButtonLink href="/challenges" size="sm" className="w-full">
          <Plus />
          {t("newChallenge")}
        </ButtonLink>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t("backToSite")}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>
    </aside>
  );
}

/** Barre de navigation du bas (mobile). */
export function MobileNav() {
  const t = useTranslations("Dashboard.nav");
  const isActive = useIsActive();
  const items = dashboardNav.slice(0, 4);

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ href, key, icon: Icon, ...rest }) => {
          const active = isActive(href, "exact" in rest);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  active ? "text-cyan-light" : "text-text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                <span className="max-w-full truncate px-1">
                  {t(key, { passName: brand.passName })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** En-tête mobile. */
export function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-xl lg:hidden">
      <Link href="/" aria-label={brand.name}>
        <Logo />
      </Link>
      <LocaleSwitcher />
    </div>
  );
}
