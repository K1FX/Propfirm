import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DemoMission } from "@/server/demo/data";

export function MissionsList({ missions }: { missions: readonly DemoMission[] }) {
  const t = useTranslations("Dashboard.pass");

  const group = (kind: DemoMission["kind"]) => missions.filter((m) => m.kind === kind);

  return (
    <Card className="flex flex-col gap-6 p-5">
      <CardTitle>{t("missions")}</CardTitle>
      {(["daily", "weekly"] as const).map((kind) => (
        <section key={kind} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase">
            {t(kind)}
          </h3>
          <ul className="flex flex-col gap-3">
            {group(kind).map((m) => {
              const done = m.progress >= m.goal;
              return (
                <li key={m.id} className="rounded-xl border border-border bg-bg/60 p-3.5">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <p className="text-sm text-text">{t(`missionsList.${m.key}`)}</p>
                    <span className="shrink-0 tabular text-xs font-semibold text-cyan-light">
                      +{m.xp} XP
                    </span>
                  </div>
                  {done ? (
                    <p className="flex items-center gap-1.5 text-xs text-cyan">
                      <CheckCircle2 className="size-3.5" aria-hidden /> {t("completed")}
                    </p>
                  ) : (
                    <ProgressBar
                      value={(m.progress / m.goal) * 100}
                      label={t(`missionsList.${m.key}`)}
                      showLabel={false}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Card>
  );
}
