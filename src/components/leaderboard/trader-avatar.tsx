import type { RankId } from "@/config/pass";
import { cn } from "@/lib/utils";

const ring: Record<RankId | "gold" | "silver" | "bronze", string> = {
  bronze: "from-[#E3B48C] via-[#C98A5A] to-[#6B4126]",
  silver: "from-[#FFFFFF] via-[#B8C0CC] to-[#5E656E]",
  gold: "from-[#FFE6A8] via-[#E8B04A] to-[#7A5413]",
  platinum: "from-[#D9FFF7] via-[#7FE3D0] to-[#2E7A6C]",
  elite: "from-[#CFFAFE] via-[#22D3EE] to-[#0A5F74]",
};

/** Avatar à initiales avec anneau métallique (couleur du rang ou de la médaille). */
export function TraderAvatar({
  handle,
  tone,
  size = "md",
  className,
}: {
  handle: string;
  tone: RankId;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initials = handle
    .replace(/[^A-Za-zÀ-ÿ0-9 _]/g, "")
    .split(/[ _]|(?=[A-Z])/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 rounded-full bg-gradient-to-br p-[2px]",
        ring[tone],
        size === "sm" && "size-8",
        size === "md" && "size-10",
        size === "lg" && "size-14 sm:size-16",
        size === "xl" && "size-16 sm:size-20",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#22272E,#0B0D10_75%)] font-display font-bold text-text",
          size === "sm" && "text-[11px]",
          size === "md" && "text-xs",
          size === "lg" && "text-base sm:text-lg",
          size === "xl" && "text-lg sm:text-2xl",
        )}
      >
        {initials}
      </span>
    </span>
  );
}
