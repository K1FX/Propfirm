"use client";

import type { ComponentProps } from "react";

import { ButtonLink } from "@/components/ui/button";
import { track, type TrackEvent } from "@/lib/analytics";

/** Bouton-lien qui envoie un événement d'analytics au clic. */
export function TrackedButtonLink({
  event,
  onClick,
  ...props
}: ComponentProps<typeof ButtonLink> & { event: TrackEvent }) {
  return (
    <ButtonLink
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}

/** Lien externe (ex. Discord) suivi. */
export function TrackedExternalLink({
  event,
  onClick,
  ...props
}: ComponentProps<"a"> & { event: TrackEvent }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}
