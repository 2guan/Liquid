"use client";

import { useId, type CSSProperties } from "react";
import type { GlassType, IceType, LiquidState } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { liquidRamp } from "@/lib/tokens";
import { geomFor, halfWidthAt } from "@/lib/data/glasses";
import type { GarnishSpec } from "@/lib/data/garnish";
import { IceGroup } from "./Ice";
import { GarnishLayer } from "./Garnish";

export interface GlassProps {
  glassType: GlassType;
  /** 0 (empty) … 1 (full to the brim of the cup region) */
  fillLevel?: number;
  family?: SpiritFamily;
  ice?: IceType;
  state?: LiquidState;
  /** amber halo behind the glass for hero placements */
  glow?: boolean;
  size?: number;
  /** frame the viewBox to the glass's actual content (for compact thumbnails) */
  fit?: boolean;
  /** size from the parent container (CSS) instead of a fixed px — scales with the page */
  fill?: boolean;
  /** carbonated drink → rising bubbles in the liquid (champagne, soda, tonic…) */
  fizzy?: boolean;
  /** physical garnishes shown in/around the glass (mint, citrus, cinnamon…) */
  garnishes?: GarnishSpec[];
  className?: string;
  title?: string;
}

/** Deterministic bubble field (no Math.random → no SSR hydration drift).
 *  dx: x offset as a fraction of the surface half-width; f: height up the liquid
 *  column (0 = base, 1 = surface); r: radius; d/dur: animation delay/duration. */
const BUBBLES: { dx: number; f: number; r: number; d: number; dur: number }[] = [
  { dx: -0.42, f: 0.16, r: 1.7, d: 0, dur: 3.6 },
  { dx: 0.34, f: 0.4, r: 1.1, d: 1.3, dur: 4.3 },
  { dx: -0.12, f: 0.6, r: 1.9, d: 0.6, dur: 3.1 },
  { dx: 0.46, f: 0.74, r: 1.0, d: 2.2, dur: 4.6 },
  { dx: 0.06, f: 0.28, r: 1.4, d: 1.8, dur: 3.9 },
  { dx: -0.5, f: 0.66, r: 1.2, d: 0.3, dur: 4.0 },
  { dx: 0.22, f: 0.88, r: 0.9, d: 2.7, dur: 3.4 },
  { dx: -0.3, f: 0.5, r: 1.5, d: 1.0, dur: 4.4 },
  { dx: 0.5, f: 0.22, r: 1.0, d: 1.6, dur: 3.7 },
  { dx: -0.04, f: 0.78, r: 1.2, d: 0.9, dur: 3.3 },
];

/**
 * The Glass — a parametric SVG render styled as a refined vintage hand-drawn
 * illustration: loose ink linework over watercolour-flat fills, refractive
 * liquid, and gentle perpetual micro-motion on the surface & highlights.
 * Heavy effects (the hand-drawn ink wobble + animation) only switch on for
 * large instances so the 30+ tiny selector thumbnails stay cheap.
 */
export default function Glass({
  glassType,
  fillLevel = 0,
  family = "whisky",
  ice = "none",
  state = "still",
  glow = false,
  size = 240,
  fit = false,
  fill = false,
  fizzy = false,
  garnishes,
  className,
  title,
}: GlassProps) {
  const uid = useId().replace(/:/g, "");
  const geom = geomFor(glassType);
  const [hi, body, shadow] = liquidRamp[family] ?? liquidRamp.default;

  // hand-drawn ink + animation only on the larger displays (hero/stage/ratio)
  const detailed = fill || size >= 130;

  const vbTop = fit ? geom.content.top : 0;
  const vbH = fit ? geom.content.bottom - geom.content.top : 280;
  const svgH = size * (vbH / 200);

  const level = Math.max(0, Math.min(1, fillLevel));
  const liquidTop = geom.cup.bottom - level * (geom.cup.bottom - geom.cup.top);
  const surfaceHW = Math.max(2, halfWidthAt(geom, liquidTop) - 2);
  const hasLiquid = level > 0.005;
  const surfaceRy = surfaceHW * 0.14 + 1.5;

  // ── ice sizing & buoyancy, matched to the cup and the liquid level ──
  // interior half-width (leave a little gap to the glass wall)
  const cupH = geom.cup.bottom - geom.cup.top;
  const interiorHW = Math.max(
    halfWidthAt(geom, geom.cup.bottom - 5),
    halfWidthAt(geom, geom.cup.top + cupH * 0.62),
  ) - 4;
  let iceR: number;
  let iceY: number;
  if (ice === "sphere") {
    // a proper "big rock" — nearly fills the tumbler
    iceR = Math.max(10, Math.min(interiorHW * 0.9, cupH * 0.52));
    // floats ~90% submerged, but rests on the base when the pour is shallow
    iceY = Math.min(liquidTop + iceR * 0.8, geom.cup.bottom - iceR - 1);
  } else if (ice === "cube") {
    iceR = Math.max(9, Math.min(interiorHW * 0.74, cupH * 0.44));
    iceY = Math.min(liquidTop + iceR * 0.8, geom.cup.bottom - iceR - 2);
  } else {
    // crushed — a mound packing the lower cup
    iceR = Math.max(16, interiorHW * 0.96);
    iceY = geom.cup.bottom - Math.min(iceR * 0.5, cupH * 0.42);
  }

  const rim = geom.rim;
  const inkFilter = detailed ? `url(#ink-${uid})` : undefined;

  return (
    <svg
      width={fill ? undefined : size}
      height={fill ? undefined : svgH}
      viewBox={`0 ${vbTop} 200 ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={title ?? `${glassType} glass`}
    >
      <defs>
        {/* refractive liquid: bright meniscus → body → deep shadow */}
        <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="16%" stopColor={hi} stopOpacity="0.9" />
          <stop offset="42%" stopColor={body} />
          <stop offset="78%" stopColor={body} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        {/* a soft light shaft passing through the liquid */}
        <linearGradient id={`liqlight-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="28%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* cool-glass body tint, warming toward the thick base */}
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0.12">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="20%" stopColor="#dfe7ea" stopOpacity="0.035" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.016" />
          <stop offset="86%" stopColor="#e9d6ad" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0B14B" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#D89C3A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D89C3A" stopOpacity="0" />
        </radialGradient>
        {/* soft window reflection on the glass body */}
        <radialGradient id={`sheen-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cup-${uid}`}>
          <path d={geom.outline} />
        </clipPath>
        {detailed && (
          <filter id={`ink-${uid}`} x="-6%" y="-4%" width="112%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="1" seed="6" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
      </defs>

      {/* amber halo */}
      {glow && (
        <ellipse
          cx="100"
          cy={geom.cup.top + 40}
          rx="110"
          ry="110"
          fill={`url(#glow-${uid})`}
          className={detailed ? "animate-breathe" : undefined}
        />
      )}

      {/* layered contact shadow on the bar (soft + tight) */}
      <ellipse cx={geom.shadow.cx} cy={geom.shadow.cy + 1} rx={geom.shadow.rx + 7} ry={geom.shadow.ry + 2} fill="#000000" opacity="0.22" />
      <ellipse cx={geom.shadow.cx} cy={geom.shadow.cy} rx={geom.shadow.rx} ry={geom.shadow.ry} fill="#000000" opacity="0.45" />

      {/* stem + foot behind the bowl */}
      {geom.stem && (
        <path d={geom.stem} fill={`url(#glass-${uid})`} stroke="#E7D6B1" strokeOpacity="0.32" strokeWidth="1" filter={inkFilter} />
      )}

      {/* glass body fill (back) */}
      <path d={geom.outline} fill={`url(#glass-${uid})`} />

      {/* liquid, clipped to the bowl interior */}
      {hasLiquid && (
        <g clipPath={`url(#cup-${uid})`}>
          <rect x="0" y={liquidTop} width="200" height={geom.cup.bottom + 30 - liquidTop} fill={`url(#liquid-${uid})`} />
          {/* light shaft through the liquid */}
          <rect x="0" y={liquidTop} width="200" height={geom.cup.bottom + 30 - liquidTop} fill={`url(#liqlight-${uid})`} opacity="0.6" />
          {/* warm caustic pool gathered at the base */}
          <ellipse cx="100" cy={geom.cup.bottom - 5} rx={surfaceHW * 0.74} ry="7" fill={hi} opacity="0.3" />
          <ellipse cx="100" cy={geom.cup.bottom - 4} rx={surfaceHW * 0.4} ry="3.5" fill="#ffffff" opacity="0.16" />
          {/* surface-tension shadow just beneath the meniscus */}
          <ellipse cx="100" cy={liquidTop + surfaceRy + 2} rx={surfaceHW} ry={surfaceRy} fill={shadow} opacity="0.28" />
          {/* meniscus disc */}
          <ellipse cx="100" cy={liquidTop} rx={surfaceHW} ry={surfaceRy} fill={hi} opacity="0.6" />
          {/* bright skin line on the surface */}
          <ellipse
            cx="100"
            cy={liquidTop}
            rx={surfaceHW}
            ry={surfaceRy}
            fill="none"
            stroke="#fff6e2"
            strokeOpacity="0.5"
            strokeWidth="0.9"
            className={detailed ? "surface-shimmer" : undefined}
            style={detailed ? { transformOrigin: `100px ${liquidTop}px` } : undefined}
          />
          {/* dancing glint on the surface */}
          {detailed && (
            <ellipse
              cx={100 - surfaceHW * 0.28}
              cy={liquidTop - 0.5}
              rx={surfaceHW * 0.34}
              ry={Math.max(1, surfaceRy * 0.5)}
              fill="#ffffff"
              className="glint-drift"
              style={{ transformOrigin: `100px ${liquidTop}px` }}
            />
          )}
          {/* swirl when chilled / stirred */}
          {state === "swirling" && (
            <ellipse cx="100" cy={liquidTop + 4} rx={surfaceHW * 0.6} ry="3" fill="#ffffff" opacity="0.12" className="animate-swirl-slow" style={{ transformOrigin: `100px ${liquidTop + 4}px` }} />
          )}
          {/* carbonation — bubbles rising through the drink */}
          {fizzy &&
            BUBBLES.map((b, i) => {
              const by = geom.cup.bottom - 3 - b.f * (geom.cup.bottom - 3 - liquidTop);
              const bx = 100 + b.dx * surfaceHW * 0.78;
              const rise = -(by - liquidTop - 1.5);
              return (
                <circle
                  key={i}
                  cx={bx}
                  cy={by}
                  r={b.r}
                  fill="#ffffff"
                  opacity="0.5"
                  className={detailed ? "bubble-rise" : undefined}
                  style={
                    detailed
                      ? ({ transformBox: "fill-box", transformOrigin: "center", "--rise": `${rise}px`, animationDelay: `${b.d}s`, animationDuration: `${b.dur}s` } as CSSProperties)
                      : undefined
                  }
                />
              );
            })}
        </g>
      )}

      {/* ice, clipped so it never spills past the rim */}
      {ice !== "none" && hasLiquid && (
        <g clipPath={`url(#cup-${uid})`}>
          <IceGroup type={ice} cx={100} cy={iceY} r={iceR} waterY={liquidTop} liquidColor={body} />
        </g>
      )}

      {/* in-drink garnishes (clipped inside the glass, behind the front wall) */}
      {detailed && hasLiquid && garnishes && garnishes.length > 0 && (
        <GarnishLayer layer="back" clipId={`cup-${uid}`} specs={garnishes} rim={rim} cupTop={geom.cup.top} liquidTop={liquidTop} surfaceHW={surfaceHW} />
      )}

      {/* ── glass optics: smooth window sheen + specular streaks (clipped) ── */}
      <g clipPath={`url(#cup-${uid})`}>
        {/* broad soft window reflection, upper-left */}
        <ellipse
          cx={100 - interiorHW * 0.34}
          cy={geom.cup.top + cupH * 0.3}
          rx={Math.max(12, interiorHW * 0.52)}
          ry={cupH * 0.44}
          fill={`url(#sheen-${uid})`}
        />
        {/* crisp vertical specular — soft halo + bright core */}
        <path
          d={`M${rim.cx - rim.rx * 0.72},${rim.cy + 6} C${rim.cx - rim.rx * 0.92},${(rim.cy + geom.cup.bottom) / 2} ${rim.cx - rim.rx * 0.82},${geom.cup.bottom - 18} ${rim.cx - rim.rx * 0.5},${geom.cup.bottom - 9}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.2"
          strokeWidth="3.6"
          strokeLinecap="round"
          className={detailed ? "specular-breathe" : undefined}
        />
        <path
          d={`M${rim.cx - rim.rx * 0.68},${rim.cy + 9} C${rim.cx - rim.rx * 0.86},${(rim.cy + geom.cup.bottom) / 2} ${rim.cx - rim.rx * 0.78},${geom.cup.bottom - 20} ${rim.cx - rim.rx * 0.5},${geom.cup.bottom - 12}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* thin right-edge highlight */}
        <path
          d={`M${rim.cx + rim.rx * 0.84},${rim.cy + 10} C${rim.cx + rim.rx * 0.92},${(rim.cy + geom.cup.bottom) / 2} ${rim.cx + rim.rx * 0.86},${geom.cup.bottom - 24} ${rim.cx + rim.rx * 0.6},${geom.cup.bottom - 12}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.14"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>

      {/* ── front linework (hand-drawn ink) ── */}
      <g filter={inkFilter}>
        {/* base refraction sheen (thick glass catches warm light) */}
        <ellipse cx="100" cy={geom.cup.bottom - 2} rx={Math.max(4, halfWidthAt(geom, geom.cup.bottom) - 5)} ry="4.5" fill="#fff2d6" opacity="0.14" />

        {/* etched double outline */}
        <path d={geom.outline} fill="none" stroke="#6e5a38" strokeOpacity="0.35" strokeWidth="2.4" strokeLinejoin="round" />
        <path d={geom.outline} fill="none" stroke="#EFE2BE" strokeOpacity="0.5" strokeWidth="1.2" strokeLinejoin="round" />

        {/* mouth: one clean bright ellipse (front lip + far rim seen through the glass) */}
        <ellipse cx={rim.cx} cy={rim.cy} rx={rim.rx} ry={rim.ry} fill="none" stroke="#FBEFC9" strokeOpacity="0.7" strokeWidth="1.2" />
        {/* lit front lip (lower arc, brighter) */}
        <path
          d={`M${rim.cx - rim.rx * 0.82},${rim.cy + rim.ry * 0.42} A${rim.rx} ${rim.ry} 0 0 0 ${rim.cx + rim.rx * 0.82},${rim.cy + rim.ry * 0.42}`}
          fill="none"
          stroke="#fff7e0"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* a roving glint on the rim */}
        <path
          d={`M${rim.cx - rim.rx * 0.55},${rim.cy - rim.ry * 0.5} A${rim.rx} ${rim.ry} 0 0 1 ${rim.cx + rim.rx * 0.1},${rim.cy - rim.ry}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="1.3"
          strokeLinecap="round"
          className={detailed ? "rim-glint" : undefined}
        />
      </g>

      {/* on-rim garnishes: salt/sugar crust + sprigs & sticks resting on the lip */}
      {detailed && garnishes && garnishes.length > 0 && (
        <GarnishLayer layer="front" specs={garnishes} rim={rim} cupTop={geom.cup.top} liquidTop={liquidTop} surfaceHW={surfaceHW} />
      )}
    </svg>
  );
}
