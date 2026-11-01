import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  // Année figée au build : suffisant pour une mention de copyright.
  const year = 2026;

  const columns = [
    {
      title: t("Footer.product"),
      links: [
        { href: "/challenges", label: t("Nav.challenges") },
        { href: "/rules", label: t("Nav.rules") },
        { href: "/pass", label: t("Nav.pass", { passName: brand.passName }) },
        { href: "/payouts", label: t("Nav.payouts") },
      ],
    },
    {
      title: t("Footer.company"),
      links: [
        { href: "/faq", label: t("Nav.faq") },
        { href: "/affiliate", label: t("Footer.affiliate") },
        { href: "/blog", label: t("Footer.blog") },
      ],
    },
    {
      title: t("Footer.legal"),
      links: [
        { href: "/terms", label: t("Footer.terms") },
        { href: "/privacy", label: t("Footer.privacy") },
        { href: "/legal-notice", label: t("Footer.notice") },
        { href: "/risk-disclosure", label: t("Footer.risk") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-text-muted">{t("Footer.tagline")}</p>
            <a
              href={`mailto:${brand.supportEmail}`}
              className="text-sm text-cyan-light underline-offset-4 hover:underline"
            >
              {brand.supportEmail}
            </a>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] text-text uppercase">
                {col.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-text-muted hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-text-muted">
            {t("Legal.disclaimer", { brand: brand.name })}
          </p>
          <p className="mt-4 text-xs text-text-muted">
            {t("Footer.rights", { year, brand: brand.name })}
          </p>
        </div>
      </Container>
    </footer>
  );
}
