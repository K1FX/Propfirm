import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-chrome font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-text-muted sm:text-base">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
