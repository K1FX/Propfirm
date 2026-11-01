import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Symbole + nom de marque. */
export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique, pas d'optimisation utile */}
      <img src="/logo.svg" alt="" width={32} height={32} className="size-8" />
      {showName && (
        <span className="font-display text-lg font-bold tracking-tight text-text">
          {brand.name}
        </span>
      )}
    </span>
  );
}
