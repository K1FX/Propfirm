import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type Props = { title: string };

/** Page provisoire pour les espaces pas encore construits. */
export function PlaceholderPage({ title }: Props) {
  const t = useTranslations("Placeholder");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-chrome text-3xl font-bold sm:text-4xl">{title}</h1>
      <Link href="/" className="text-cyan-light underline-offset-4 hover:underline">
        {t("back")}
      </Link>
    </main>
  );
}
