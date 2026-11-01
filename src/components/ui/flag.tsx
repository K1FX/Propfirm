/**
 * Drapeaux en SVG simplifiés (les emojis drapeaux ne s'affichent pas sous Windows).
 * Format 3:2. Ajouter un pays : un cas dans le switch + son code dans COUNTRY_CODES.
 */
export const COUNTRY_CODES = [
  "us",
  "ca",
  "mx",
  "br",
  "gb",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "nl",
  "be",
  "ch",
  "pl",
  "ae",
  "in",
  "sg",
  "au",
] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

type Props = { code: CountryCode; className?: string; title?: string };

const tri = (a: string, b: string, c: string, vertical: boolean) =>
  vertical ? (
    <>
      <rect width="10" height="20" fill={a} />
      <rect x="10" width="10" height="20" fill={b} />
      <rect x="20" width="10" height="20" fill={c} />
    </>
  ) : (
    <>
      <rect width="30" height="6.67" fill={a} />
      <rect y="6.67" width="30" height="6.67" fill={b} />
      <rect y="13.33" width="30" height="6.67" fill={c} />
    </>
  );

function Shapes({ code }: { code: CountryCode }) {
  switch (code) {
    case "fr":
      return tri("#002654", "#fff", "#CE1126", true);
    case "it":
      return tri("#009246", "#fff", "#CE2B37", true);
    case "be":
      return tri("#000", "#FDDA24", "#EF3340", true);
    case "de":
      return tri("#000", "#DD0000", "#FFCE00", false);
    case "nl":
      return tri("#AE1C28", "#fff", "#21468B", false);
    case "mx":
      return (
        <>
          {tri("#006847", "#fff", "#CE1126", true)}
          <circle cx="15" cy="10" r="2.4" fill="#8C6A2C" />
        </>
      );
    case "es":
      return (
        <>
          <rect width="30" height="20" fill="#AA151B" />
          <rect y="5" width="30" height="10" fill="#F1BF00" />
        </>
      );
    case "pt":
      return (
        <>
          <rect width="30" height="20" fill="#FF0000" />
          <rect width="12" height="20" fill="#006600" />
          <circle cx="12" cy="10" r="4" fill="#FFCC00" />
        </>
      );
    case "pl":
      return (
        <>
          <rect width="30" height="10" fill="#fff" />
          <rect y="10" width="30" height="10" fill="#DC143C" />
        </>
      );
    case "ch":
      return (
        <>
          <rect width="30" height="20" fill="#DA291C" />
          <rect x="13" y="4" width="4" height="12" fill="#fff" />
          <rect x="9" y="8" width="12" height="4" fill="#fff" />
        </>
      );
    case "ca":
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="7.5" height="20" fill="#D52B1E" />
          <rect x="22.5" width="7.5" height="20" fill="#D52B1E" />
          <path
            d="M15 4 L16.6 8 L19.5 7 L18.2 11 L20 12 L15 15.5 L10 12 L11.8 11 L10.5 7 L13.4 8 Z"
            fill="#D52B1E"
          />
        </>
      );
    case "br":
      return (
        <>
          <rect width="30" height="20" fill="#009C3B" />
          <path d="M15 2.5 L27 10 L15 17.5 L3 10 Z" fill="#FFDF00" />
          <circle cx="15" cy="10" r="4.2" fill="#002776" />
        </>
      );
    case "gb":
      return (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0 L30 20 M30 0 L0 20" stroke="#C8102E" strokeWidth="1.6" />
          <path d="M15 0 V20 M0 10 H30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0 V20 M0 10 H30" stroke="#C8102E" strokeWidth="3.4" />
        </>
      );
    case "au":
      return (
        <>
          <rect width="30" height="20" fill="#00008B" />
          <path d="M0 0 L15 10 M15 0 L0 10" stroke="#fff" strokeWidth="2" />
          <path d="M7.5 0 V10 M0 5 H15" stroke="#fff" strokeWidth="3" />
          <path d="M7.5 0 V10 M0 5 H15" stroke="#C8102E" strokeWidth="1.6" />
          {[
            [7.5, 15],
            [22, 5],
            [25, 10],
            [21, 14],
            [23.5, 17],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#fff" />
          ))}
        </>
      );
    case "ae":
      return (
        <>
          <rect width="30" height="6.67" fill="#00732F" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <rect y="13.33" width="30" height="6.67" fill="#000" />
          <rect width="8" height="20" fill="#FF0000" />
        </>
      );
    case "sg":
      return (
        <>
          <rect width="30" height="10" fill="#EF3340" />
          <rect y="10" width="30" height="10" fill="#fff" />
          <circle cx="6.5" cy="5" r="3" fill="#fff" />
          <circle cx="7.6" cy="5" r="2.7" fill="#EF3340" />
        </>
      );
    case "in":
      return (
        <>
          {tri("#FF9933", "#fff", "#138808", false)}
          <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth=".8" />
        </>
      );
    case "us":
    default:
      return (
        <>
          <rect width="30" height="20" fill="#B22234" />
          {[1, 3, 5, 7, 9, 11].map((i) => (
            <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#fff" />
          ))}
          <rect width="13" height={(7 * 20) / 13} fill="#3C3B6E" />
        </>
      );
  }
}

export function Flag({ code, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="none"
    >
      {title && <title>{title}</title>}
      <Shapes code={code} />
    </svg>
  );
}
