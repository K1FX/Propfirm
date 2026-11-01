import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * Logo : symbole + nom de marque en police « wordmark » (Michroma, chargée dans le layout).
 * Le 1er mot est en chrome, la suite plus petite et espacée (ex. AURUM FUNDED).
 */
export function Logo({
  className,
  showName = true,
  size = "md",
}: {
  className?: string;
  showName?: boolean;
  size?: "md" | "lg";
}) {
  const [first, ...rest] = brand.name.split(" ");
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique, pas d'optimisation utile */}
      <img
        src="/logo.svg"
        alt=""
        width={32}
        height={32}
        className={size === "lg" ? "size-10" : "size-8"}
      />
      {showName && (
        <span
          className={cn(
            "flex items-baseline gap-2 [font-family:var(--font-wordmark),var(--font-sora),sans-serif] whitespace-nowrap uppercase",
            size === "lg" ? "text-xl" : "text-[17px]",
          )}
        >
          <span className="text-chrome tracking-[0.12em]">{first}</span>
          {rest.length > 0 && (
            <span className="text-[0.62em] tracking-[0.34em] text-text-muted">
              {rest.join(" ")}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
