import { cn } from "@/lib/utils";

/**
 * Coupé GT stylisé (dessin original, aucun logo ni silhouette de constructeur), vu de profil,
 * face à gauche. Les roues sont des groupes séparés pour pouvoir les faire tourner.
 */

export const CAR_VIEWBOX = { width: 600, height: 170 };
/** Centres des roues dans le repère du viewBox (utilisés pour placer la fumée). */
export const REAR_WHEEL = { x: 470, y: 128, r: 34 };
export const FRONT_WHEEL = { x: 140, y: 128, r: 34 };

function Wheel({
  cx,
  cy,
  r,
  spinClass,
}: {
  cx: number;
  cy: number;
  r: number;
  spinClass?: string;
}) {
  const spokes = [0, 72, 144, 216, 288];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#07080A" stroke="#262A31" strokeWidth="2" />
      <g
        className={spinClass}
        style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.7}
          fill="url(#gt-rim)"
          stroke="url(#gt-chrome)"
          strokeWidth="1.5"
        />
        {spokes.map((a) => (
          <rect
            key={a}
            x={cx - 2.5}
            y={cy - r * 0.66}
            width="5"
            height={r * 0.58}
            rx="2"
            fill="#2B2F36"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.16} fill="url(#gt-chrome)" />
      </g>
      {/* Étrier de frein cyan (fixe) */}
      <path
        d={`M ${cx - r * 0.5} ${cy - r * 0.42} A ${r * 0.66} ${r * 0.66} 0 0 1 ${cx + r * 0.1} ${cy - r * 0.64}`}
        stroke="#22D3EE"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </g>
  );
}

export function GtCar({
  className,
  rearSpin,
  frontSpin,
}: {
  className?: string;
  rearSpin?: string;
  frontSpin?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${CAR_VIEWBOX.width} ${CAR_VIEWBOX.height}`}
      className={cn("overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="gt-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor="#A9B0B9" />
          <stop offset="0.6" stopColor="#F4F6F8" />
          <stop offset="1" stopColor="#666D76" />
        </linearGradient>
        <linearGradient id="gt-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2F37" />
          <stop offset="0.35" stopColor="#15181D" />
          <stop offset="1" stopColor="#08090B" />
        </linearGradient>
        <linearGradient id="gt-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A5F74" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#0C0E12" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="gt-rim" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#F6F8FA" />
          <stop offset="0.5" stopColor="#9DA4AE" />
          <stop offset="1" stopColor="#3A3F47" />
        </radialGradient>
        <linearGradient id="gt-beam" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#67E8F9" stopOpacity="0.45" />
          <stop offset="1" stopColor="#67E8F9" stopOpacity="0" />
        </linearGradient>
        <filter id="gt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Lueur au sol */}
      <ellipse
        cx="305"
        cy="160"
        rx="270"
        ry="10"
        fill="#22D3EE"
        opacity="0.28"
        filter="url(#gt-glow)"
      />

      {/* Faisceau des phares */}
      <path d="M 34 98 L -220 70 L -220 140 Z" fill="url(#gt-beam)" />

      {/* Carrosserie */}
      <path
        d="M 30 122 L 22 108 Q 20 96 34 92 L 120 82 Q 170 76 215 62 Q 260 40 320 36 Q 390 36 450 62 Q 500 78 545 84 L 568 86 Q 580 90 577 104 L 572 122 L 520 122 A 50 50 0 0 0 420 122 L 190 122 A 50 50 0 0 0 90 122 Z"
        fill="url(#gt-body)"
        stroke="url(#gt-chrome)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Vitrage */}
      <path
        d="M 228 68 Q 266 47 318 43 Q 372 43 412 62 L 402 73 L 236 75 Z"
        fill="url(#gt-glass)"
      />
      <path d="M 318 43 L 320 75" stroke="#262A31" strokeWidth="4" />

      {/* Ligne de caisse + reflet du toit */}
      <path
        d="M 50 104 Q 300 94 566 100"
        stroke="url(#gt-chrome)"
        strokeWidth="1.2"
        opacity="0.45"
        fill="none"
      />
      <path
        d="M 240 58 Q 300 38 380 42"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        opacity="0.35"
        fill="none"
      />
      <path d="M 250 78 L 252 112" stroke="#262A31" strokeWidth="1.5" />

      {/* Rétroviseur */}
      <path
        d="M 222 70 L 210 70 Q 204 72 208 77 L 224 76 Z"
        fill="#15181D"
        stroke="url(#gt-chrome)"
        strokeWidth="1"
      />

      {/* Phare avant (cyan) et feu arrière */}
      <path d="M 30 95 L 62 90 L 60 97 L 32 101 Z" fill="#67E8F9" />
      <path d="M 30 95 L 62 90 L 60 97 L 32 101 Z" fill="#22D3EE" filter="url(#gt-glow)" />
      <rect x="552" y="88" width="24" height="5" rx="2.5" fill="#FF4D6A" />
      <rect x="552" y="88" width="24" height="5" rx="2.5" fill="#FF4D6A" filter="url(#gt-glow)" />

      {/* Diffuseur / bas de caisse */}
      <path d="M 195 122 L 415 122" stroke="#3A3F47" strokeWidth="3" />

      <Wheel cx={FRONT_WHEEL.x} cy={FRONT_WHEEL.y} r={FRONT_WHEEL.r} spinClass={frontSpin} />
      <Wheel cx={REAR_WHEEL.x} cy={REAR_WHEEL.y} r={REAR_WHEEL.r} spinClass={rearSpin} />
    </svg>
  );
}
