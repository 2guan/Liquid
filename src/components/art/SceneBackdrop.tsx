"use client";

import { useId } from "react";
import type { SpiritFamily } from "@/lib/tokens";

/**
 * A themed, layered landscape rendered entirely in SVG — sky wash, an orb
 * (sun/moon), silhouetted ridgelines and a low mist band. The palette shifts
 * with the spirit family so each drink gets its own world behind the glass.
 *
 * (For a fully photoreal hand-painted backdrop, swap this for an <Image>; the
 * required art is specified in ASSETS.md.)
 */
type Palette = { sky: [string, string]; ridge: string[]; orb: string; mist: string };

const PALETTES: Record<string, Palette> = {
  coast: { sky: ["#2a3340", "#0f1418"], ridge: ["#1c2630", "#141b22", "#0c1116"], orb: "#cfd9d6", mist: "#3a4750" },
  highland: { sky: ["#3a2a1c", "#120c07"], ridge: ["#2a1d12", "#1d140c", "#120b06"], orb: "#E3B66A", mist: "#4a3320" },
  garden: { sky: ["#26301f", "#0c1109"], ridge: ["#1b2616", "#141d10", "#0c130a"], orb: "#cfe0a8", mist: "#33401f" },
  desert: { sky: ["#43321c", "#150d06"], ridge: ["#3a2814", "#2a1c0e", "#1a1108"], orb: "#F0C46B", mist: "#5a3f1f" },
  snow: { sky: ["#2c3540", "#0e1318"], ridge: ["#3a4650", "#2a343c", "#1a2228"], orb: "#eaf1f5", mist: "#46545f" },
  night: { sky: ["#2a1820", "#100509"], ridge: ["#241018", "#1a0c12", "#10070b"], orb: "#E06A7A", mist: "#3a1a26" },
  amber: { sky: ["#34250f", "#120c05"], ridge: ["#281a0c", "#1c1208", "#120b05"], orb: "#F0B14B", mist: "#4a3318" },
};

const SCENE_BY_FAMILY: Record<SpiritFamily, keyof typeof PALETTES> = {
  whiskyPeat: "coast",
  whisky: "highland",
  brandy: "highland",
  gin: "garden",
  absinthe: "garden",
  vodka: "snow",
  tequila: "desert",
  rum: "desert",
  campari: "night",
  vermouth: "coast",
  wine: "night",
  cream: "amber",
  default: "amber",
};

export default function SceneBackdrop({
  family = "default",
  className,
}: {
  family?: SpiritFamily;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const p = PALETTES[SCENE_BY_FAMILY[family] ?? "amber"];

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`orb-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.orb} stopOpacity="0.95" />
          <stop offset="40%" stopColor={p.orb} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.orb} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`mist-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.mist} stopOpacity="0" />
          <stop offset="100%" stopColor={p.mist} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill={`url(#sky-${uid})`} />
      {/* orb */}
      <circle cx="560" cy="170" r="130" fill={`url(#orb-${uid})`} />
      <circle cx="560" cy="170" r="34" fill={p.orb} opacity="0.55" />

      {/* far ridge */}
      <path d="M0,320 C140,280 260,300 360,290 C480,278 600,300 800,272 L800,500 L0,500 Z" fill={p.ridge[0]} opacity="0.9" />
      {/* mid ridge */}
      <path d="M0,370 C120,340 240,360 380,345 C520,330 660,360 800,338 L800,500 L0,500 Z" fill={p.ridge[1]} />
      {/* near ridge */}
      <path d="M0,420 C160,398 300,418 440,406 C580,394 700,416 800,404 L800,500 L0,500 Z" fill={p.ridge[2]} />

      {/* mist band */}
      <rect x="0" y="300" width="800" height="200" fill={`url(#mist-${uid})`} />
      {/* faint reflection sheen on a 'water' lower band */}
      <rect x="0" y="430" width="800" height="70" fill={p.orb} opacity="0.05" />
    </svg>
  );
}
