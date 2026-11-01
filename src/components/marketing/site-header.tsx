"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { Link, usePathname } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

import { LocaleSwitcher } from "./locale-switcher";
import { mainNav } from "./nav-items";

// TODO Phase 3 : remettre "/login" quand l'authentification sera en place.
// En attendant, « Connexion » ouvre l'espace trader de démonstration.
const LOGIN_HREF = "/dashboard";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);

  function toggleMenu() {
    // Le menu commence exactement sous le header (le bandeau promo peut être visible au-dessus).
    if (!open && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
    setOpen((o) => !o);
  }

  // Ferme le menu mobile à chaque navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-xl"
      >
        <Container className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label={brand.name} className="rounded-md">
            <Logo />
          </Link>

          <nav aria-label={t("main")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={cn(
                      "rounded-[10px] px-3.5 py-2 text-sm transition-colors hover:text-text",
                      pathname === item.href ? "text-cyan-light" : "text-text-muted",
                    )}
                  >
                    {t(item.key, { passName: brand.passName })}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LocaleSwitcher />
            <ButtonLink href={LOGIN_HREF} variant="ghost" size="sm">
              {t("login")}
            </ButtonLink>
            <ButtonLink
              href="/#plans"
              size="sm"
              onClick={() => track("header_cta")}
              className="animate-cta-pulse"
            >
              {t("getFunded")}
            </ButtonLink>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[10px] border border-border lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={toggleMenu}
          >
            {open ? (
              <X className="size-5" strokeWidth={1.5} />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} />
            )}
          </button>
        </Container>
      </header>

      {/* Hors du <header> : son backdrop-filter piégerait le positionnement fixed. */}
      {open && (
        <div
          id="mobile-menu"
          style={{ top: menuTop }}
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-border bg-bg lg:hidden"
        >
          <Container className="flex flex-col gap-2 py-6">
            <nav aria-label={t("main")}>
              <ul className="flex flex-col">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block border-b border-border py-4 font-display text-lg"
                    >
                      {t(item.key, { passName: brand.passName })}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href="/#plans" size="lg" onClick={() => track("header_cta")}>
                {t("getFunded")}
              </ButtonLink>
              <ButtonLink href={LOGIN_HREF} variant="secondary" size="lg">
                {t("login")}
              </ButtonLink>
              <LocaleSwitcher className="mt-2 self-start" />
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
