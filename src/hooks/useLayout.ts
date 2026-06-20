"use client";

import { useEffect, useState } from "react";

export type LayoutMode = "landscape" | "portrait";

/**
 * Resolve the active layout. We treat "wide enough AND landscape" as the tablet
 * 12-column experience; everything else falls back to the portrait 4-column
 * mobile experience. SSR + first client render use `landscape` so hydration is
 * stable; the real value lands in an effect.
 */
export function useLayout(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>("landscape");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 880px) and (orientation: landscape)");
    const update = () => setMode(mq.matches ? "landscape" : "portrait");
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return mode;
}

/** True only after the component has mounted on the client. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/**
 * Tracks document visibility. When the tab is hidden the browser throttles
 * requestAnimationFrame, which would otherwise freeze in-flight view
 * transitions; callers use this to swap views instantly while hidden.
 */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return hidden;
}
