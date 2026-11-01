import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="tabular text-6xl text-cyan">404</p>
      <h1 className="text-chrome text-3xl font-bold">{t("title")}</h1>
      <Link href="/" className="text-cyan-light underline-offset-4 hover:underline">
        {t("back")}
      </Link>
    </main>
  );
}
