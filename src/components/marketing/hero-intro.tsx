"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { CAR_VIEWBOX, GtCar, REAR_WHEEL } from "./gt-car";

export type IntroPhase = "pending" | "enter" | "burnout" | "launch" | "done";

const STORAGE_KEY = "af-intro-played";

/**
 * Pilote l'intro du hero. Jouée une seule fois par session, jamais si l'utilisateur
 * réduit les animations. `cardsVisible` passe à true à la fin (ou tout de suite si pas d'intro).
 */
export function useIntroPhase(force = false) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("pending");
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    let play = !reduce;
    if (play && !force) {
      try {
        if (sessionStorage.getItem(STORAGE_KEY)) play = false;
        else sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // sessionStorage indisponible : on joue l'intro.
      }
    }

    const timers = play
      ? [
          setTimeout(() => setPhase("enter"), 100),
          setTimeout(() => setPhase("burnout"), 600),
          setTimeout(() => setPhase("launch"), 2300),
          setTimeout(() => setCardsVisible(true), 3200),
          setTimeout(() => setPhase("done"), 6500),
        ]
      : [
          setTimeout(() => {
            setPhase("done");
            setCardsVisible(true);
          }, 0),
        ];
    return () => timers.forEach(clearTimeout);
  }, [reduce, force]);

  return { phase, cardsVisible };
}

/** Particules de fumée : valeurs fixes (pas de Math.random → rendu stable). */
const SMOKE = Array.from({ length: 40 }, (_, i) => {
  const t = (i * 37) % 40; // ordre pseudo-aléatoire
  return {
    id: i,
    delay: (i / 40) * 1.8,
    // Nuages qui s'élèvent et s'étalent derrière la roue arrière.
    dx: 10 + ((t * 13) % 130),
    dy: -(30 + ((t * 7) % 130)),
    size: 45 + ((t * 11) % 80),
    duration: 2 + ((t * 5) % 12) / 10,
    // Point de départ étalé le long du sol, autour de la roue arrière.
    ox: -50 + ((t * 17) % 110),
    oy: -((t * 3) % 14),
  };
});

/** La voiture, sa fumée et la traînée lumineuse. Purement décoratif. */
export function IntroCar({ phase }: { phase: IntroPhase }) {
  if (phase === "pending" || phase === "done") return null;

  const burning = phase === "burnout" || phase === "launch";
  // Position de la roue arrière en % du dessin (pour ancrer la fumée).
  const smokeLeft = `${(REAR_WHEEL.x / CAR_VIEWBOX.width) * 100}%`;
  const smokeTop = `${((REAR_WHEEL.y + REAR_WHEEL.r) / CAR_VIEWBOX.height) * 100}%`;

  return (
    <div aria-hidden data-intro-car className="pointer-events-none absolute inset-0">
      <div className="absolute top-1/2 left-[40%] w-[118%] max-w-[600px] -translate-1/2">
        {/* Fumée : reste sur place quand la voiture part */}
        <div className="absolute" style={{ left: smokeLeft, top: smokeTop }}>
          {burning &&
            SMOKE.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-[radial-gradient(circle,rgba(210,216,224,.55)_0%,rgba(150,157,168,.25)_45%,transparent_70%)] blur-[2px]"
                style={{
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                }}
                initial={{ opacity: 0, scale: 0.3, x: p.ox, y: p.oy }}
                animate={{
                  opacity: [0, 0.65, 0],
                  scale: [0.3, 1.3, 2.4],
                  x: [p.ox, p.ox + p.dx * 0.4, p.ox + p.dx],
                  y: [p.oy, p.oy + p.dy * 0.5, p.oy + p.dy],
                }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              />
            ))}
        </div>

        {/* Traînée lumineuse au sol, laissée au départ */}
        {phase === "launch" && (
          <motion.div
            className="absolute right-[20%] bottom-[3%] h-[2px] w-[160vw] origin-right bg-gradient-to-l from-cyan via-cyan/60 to-transparent shadow-[0_0_12px_rgba(34,211,238,.8)]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: [1, 1, 0] }}
            transition={{
              scaleX: { duration: 1, ease: [0.6, 0, 0.9, 0.4] },
              opacity: { duration: 3.5, times: [0, 0.4, 1] },
            }}
          />
        )}

        {/* Voiture */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={phase === "launch" ? { opacity: 1, x: "-180vw" } : { opacity: 1, x: 0 }}
          transition={
            phase === "launch"
              ? { x: { duration: 0.9, ease: [0.55, 0, 0.9, 0.35] } }
              : { opacity: { duration: 0.5 } }
          }
        >
          <motion.div
            animate={
              phase === "burnout"
                ? {
                    x: [0, -1.5, 1.5, -1, 1, 0],
                    y: [0, 0.8, -0.6, 0.6, 0],
                    rotate: [0, -0.6, -0.4, -0.7, -0.5],
                  }
                : phase === "launch"
                  ? { skewX: 8, scaleX: 1.06, filter: "blur(1.5px)" }
                  : {}
            }
            transition={
              phase === "burnout"
                ? { duration: 0.14, repeat: Infinity, ease: "linear" }
                : { duration: 0.4 }
            }
            style={{ transformOrigin: "80% 90%" }}
          >
            <GtCar
              className="w-full"
              rearSpin={
                burning
                  ? "animate-spin [animation-direction:reverse] [animation-duration:120ms]"
                  : undefined
              }
              frontSpin={
                phase === "launch"
                  ? "animate-spin [animation-direction:reverse] [animation-duration:150ms]"
                  : undefined
              }
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
