"use client";

import { useEffect, useRef, useState } from "react";

/** Vrai dès que l'élément entre dans l'écran (une seule fois). Léger : IntersectionObserver natif. */
export function useInViewOnce<T extends Element>(rootMargin = "-60px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          o.disconnect();
        }
      },
      { rootMargin },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
