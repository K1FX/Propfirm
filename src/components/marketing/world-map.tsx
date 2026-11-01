/**
 * Carte du monde en points (projection équirectangulaire grossière, 64 × 28 cases de 5,625° × 5°).
 * Chaque ligne liste les plages de colonnes « terre ». Les points lumineux = fuseaux du support.
 */
const LAND: [number, number][][] = [
  [
    [13, 19],
    [22, 27],
    [44, 50],
  ],
  [
    [11, 19],
    [21, 28],
    [40, 58],
  ],
  [
    [2, 6],
    [7, 19],
    [21, 27],
    [35, 37],
    [38, 62],
  ],
  [
    [1, 7],
    [7, 20],
    [22, 26],
    [28, 29],
    [34, 37],
    [37, 63],
  ],
  [
    [3, 8],
    [8, 20],
    [24, 25],
    [33, 36],
    [36, 61],
  ],
  [
    [9, 14],
    [17, 19],
    [31, 32],
    [33, 38],
    [38, 57],
    [59, 60],
  ],
  [
    [9, 19],
    [21, 21],
    [31, 31],
    [32, 40],
    [40, 56],
  ],
  [
    [9, 19],
    [32, 36],
    [39, 39],
    [40, 56],
    [57, 57],
  ],
  [
    [10, 19],
    [30, 32],
    [34, 35],
    [36, 39],
    [40, 55],
    [56, 57],
  ],
  [
    [10, 18],
    [30, 36],
    [37, 42],
    [43, 55],
    [56, 56],
  ],
  [
    [11, 17],
    [29, 37],
    [38, 42],
    [43, 54],
  ],
  [
    [12, 16],
    [29, 38],
    [38, 43],
    [44, 47],
    [48, 53],
  ],
  [
    [13, 16],
    [18, 19],
    [29, 38],
    [39, 42],
    [45, 47],
    [49, 51],
  ],
  [
    [15, 17],
    [29, 39],
    [45, 46],
    [49, 51],
    [53, 53],
  ],
  [
    [17, 20],
    [30, 40],
    [50, 51],
    [53, 53],
  ],
  [
    [18, 22],
    [32, 39],
    [50, 51],
    [52, 53],
  ],
  [
    [18, 23],
    [33, 39],
    [49, 50],
    [52, 53],
    [56, 57],
  ],
  [
    [18, 24],
    [34, 39],
    [52, 55],
    [56, 58],
  ],
  [
    [18, 25],
    [34, 39],
    [56, 57],
  ],
  [
    [19, 25],
    [34, 38],
    [40, 40],
    [54, 57],
  ],
  [
    [19, 24],
    [34, 38],
    [40, 40],
    [52, 58],
  ],
  [
    [19, 23],
    [34, 37],
    [52, 58],
  ],
  [
    [19, 22],
    [35, 37],
    [52, 58],
  ],
  [
    [19, 21],
    [53, 57],
  ],
  [
    [19, 20],
    [62, 62],
  ],
  [
    [19, 20],
    [61, 61],
  ],
  [[19, 20]],
  [[20, 20]],
];

/** Coordonnées approximatives des fuseaux (lon, lat). */
const ZONES: Record<string, [number, number]> = {
  "America/Chicago": [-87.6, 41.9],
  "America/New_York": [-74, 40.7],
  "America/Los_Angeles": [-118.2, 34],
  "Europe/Paris": [2.35, 48.85],
  "Europe/London": [-0.1, 51.5],
  "Europe/Madrid": [-3.7, 40.4],
  "America/Sao_Paulo": [-46.6, -23.5],
  "Asia/Kolkata": [77.2, 28.6],
  "Asia/Dubai": [55.3, 25.2],
  "Asia/Singapore": [103.8, 1.35],
};

const COLS = 64;
const ROWS = 28;
const CELL = 10;

export function WorldMap({ zones, label }: { zones: readonly string[]; label: string }) {
  // Une bande par plage de terre, remplie d'un motif de points (léger : ~90 rectangles).
  const strips = LAND.flatMap((ranges, r) =>
    ranges.map(([a, b]) => ({ x: a * CELL, y: r * CELL, w: (b - a + 1) * CELL })),
  );

  const points = zones
    .map((z) => ZONES[z])
    .filter((p): p is [number, number] => Boolean(p))
    .map(([lon, lat]) => ({
      x: ((lon + 180) / 360) * COLS * CELL,
      y: ((80 - lat) / 140) * ROWS * CELL,
    }));

  return (
    <div className="relative w-full" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="h-auto w-full" aria-hidden>
        <defs>
          <pattern id="map-dots" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <circle cx={CELL / 2} cy={CELL / 2} r={1.8} fill="#3A424D" />
          </pattern>
        </defs>
        {strips.map((s) => (
          <rect
            key={`${s.x}-${s.y}`}
            x={s.x}
            y={s.y}
            width={s.w}
            height={CELL}
            fill="url(#map-dots)"
          />
        ))}
      </svg>
      {points.map((p, i) => (
        <span
          key={i}
          className="absolute size-2.5 -translate-1/2"
          style={{
            left: `${(p.x / (COLS * CELL)) * 100}%`,
            top: `${(p.y / (ROWS * CELL)) * 100}%`,
          }}
        >
          <span
            className="absolute inset-0 animate-ping-soft rounded-full bg-cyan"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
          <span className="absolute inset-0 rounded-full bg-cyan-light shadow-[0_0_12px_rgba(103,232,249,.9)]" />
        </span>
      ))}
    </div>
  );
}
