import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

/** Bandeau obligatoire tant que le classement affiche des données fictives. */
export function LeaderboardDemoNote() {
  const t = useTranslations("Leaderboard");
  return (
    <p
      role="note"
      className="flex items-start gap-2.5 rounded-xl border border-cyan/30 bg-cyan/5 px-4 py-3 text-sm text-cyan-light"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      {t("demo")}
    </p>
  );
}
