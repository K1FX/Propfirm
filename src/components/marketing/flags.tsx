import type { SupportLanguage } from "@/config/support";

/** Petits drapeaux SVG (les emojis drapeaux ne s'affichent pas sous Windows). */
export function Flag({ code, className }: { code: SupportLanguage["flag"]; className?: string }) {
  const common = { viewBox: "0 0 30 20", className, "aria-hidden": true } as const;
  switch (code) {
    case "fr":
      return (
        <svg {...common}>
          <rect width="10" height="20" fill="#002654" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#CE1126" />
        </svg>
      );
    case "es":
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#AA151B" />
          <rect y="5" width="30" height="10" fill="#F1BF00" />
        </svg>
      );
    case "pt":
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#FF0000" />
          <rect width="12" height="20" fill="#006600" />
          <circle cx="12" cy="10" r="4" fill="#FFCC00" />
        </svg>
      );
    case "in":
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="6.67" fill="#FF9933" />
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth=".8" />
        </svg>
      );
    case "us":
    default:
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#B22234" />
          {[1, 3, 5, 7, 9, 11].map((i) => (
            <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#fff" />
          ))}
          <rect width="13" height={(7 * 20) / 13} fill="#3C3B6E" />
        </svg>
      );
  }
}
