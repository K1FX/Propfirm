/**
 * Suivi des événements de conversion. Pousse dans `window.dataLayer` (compatible GTM/GA4)
 * et émet un CustomEvent « af:track » : il suffira de brancher l'outil d'analytics choisi.
 */
export type TrackEvent =
  | "hero_start"
  | "hero_discord"
  | "sticky_cta"
  | "final_start"
  | "final_discord"
  | "header_cta"
  | `plan_click_${string}`;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: TrackEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
  window.dispatchEvent(new CustomEvent("af:track", { detail: { event, ...props } }));
}
