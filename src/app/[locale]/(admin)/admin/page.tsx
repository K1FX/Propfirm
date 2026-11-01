import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { toLocale } from "@/i18n/routing";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));
  const t = useTranslations("Placeholder");

  return <PlaceholderPage title={t("admin")} />;
}
