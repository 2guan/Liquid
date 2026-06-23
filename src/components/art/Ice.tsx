"use client";

import { useId, type ReactNode } from "react";
import type { IceType } from "@/types";

/**
 * Ice rendered as translucent refractive glass with a real waterline.
 *
 * `IceGroup` draws inside a glass: it is sized by `r` (a real svg radius, so the
 * caller can match it to the cup width) and, when given `waterY`, splits into a
 * brighter "dry" cap above the surface and a liquid-tinted submerged body below,
 * with a meniscus ring where the drink wraps the ice — the way a cube or rock
 * actually sits in a pour. `Ice` is the standalone swatch for the ice selector.
 */
export function IceGroup({
  type,
  cx,
  cy,
  r = 26,
  tint = "#e3edf2",
  /** absolute y of the liquid surface — enables the waterline + submerged tint */
  waterY,
  /** colour of the surrounding drink, used to tint the submerged portion */
  liquidColor,
  /** fill region (absolute svg coords) for the multi-piece "cubes"/"bullets" ice */
  fillTop,
  fillBottom,
  fillHW,
}: {
  type: IceType;
  cx: number;
  cy: number;
  r?: number;
  tint?: string;
  waterY?: number;
  liquidColor?: string;
  fillTop?: number;
  fillBottom?: number;
  fillHW?: number;
}) {
  const uid = useId().replace(/:/g, "");
  if (type === "none") return null;

  // waterline in the group's local coordinates (null → no surface to honour)
  const wl = waterY != null ? waterY - cy : null;
  const submerged = wl != null && liquidColor;

  /* ── Big clear sphere (the whisky "rock") ── */
  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <radialGradient id={`isph-${uid}`} cx="37%" cy="30%" r="74%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="20%" stopColor="#eef7fb" stopOpacity="0.26" />
            <stop offset="58%" stopColor={tint} stopOpacity="0.1" />
            <stop offset="86%" stopColor={tint} stopOpacity="0.16" />
            <stop offset="100%" stopColor={tint} stopOpacity="0.36" />
          </radialGradient>
          <clipPath id={clip}>
            <circle r={r} />
          </clipPath>
        </defs>

        {/* glassy body */}
        <circle r={r} fill={`url(#isph-${uid})`} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.8" />

        <g clipPath={`url(#${clip})`}>
          {/* submerged portion picks up the drink's colour */}
          {submerged && <rect x={-r} y={wl!} width={r * 2} height={r * 2} fill={liquidColor} opacity="0.4" />}
          {/* refraction: a soft lens low-left, an asymmetric caustic glint lower-right */}
          <ellipse cx={-r * 0.22} cy={r * 0.4} rx={r * 0.78} ry={r * 0.58} fill={tint} opacity="0.14" />
          <path
            d={`M${r * 0.34},${r * 0.58} A ${r * 0.62} ${r * 0.62} 0 0 0 ${r * 0.66},${r * 0.12}`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.38"
            strokeWidth={Math.max(0.8, r * 0.05)}
            strokeLinecap="round"
          />
          {/* faint internal reflection of the rim opposite the light */}
          <ellipse cx={-r * 0.18} cy={-r * 0.04} rx={r * 0.4} ry={r * 0.5} fill="#ffffff" opacity="0.05" />
        </g>

        {/* primary specular hot-spot + its tiny echo */}
        <ellipse
          cx={-r * 0.34}
          cy={-r * 0.4}
          rx={r * 0.3}
          ry={r * 0.18}
          fill="#ffffff"
          opacity="0.9"
          transform={`rotate(-30 ${-r * 0.34} ${-r * 0.4})`}
        />
        <circle cx={-r * 0.1} cy={-r * 0.18} r={Math.max(0.8, r * 0.06)} fill="#ffffff" opacity="0.7" />

        {/* meniscus ring where the drink meets the ice */}
        {wl != null && Math.abs(wl) < r * 0.98 && (
          <g clipPath={`url(#${clip})`}>
            <ellipse cx="0" cy={wl} rx={chord} ry={Math.max(1, r * 0.08)} fill="#ffffff" opacity="0.1" />
            <ellipse cx="0" cy={wl} rx={chord} ry={Math.max(1, r * 0.08)} fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.9" />
          </g>
        )}

        {/* a couple of tiny internal bubbles (clear ice has few), kept off-axis */}
        <circle cx={r * 0.3} cy={-r * 0.12} r={Math.max(0.6, r * 0.035)} fill="#ffffff" opacity="0.5" />
        <circle cx={r * 0.44} cy={r * 0.34} r={Math.max(0.5, r * 0.026)} fill="#ffffff" opacity="0.38" />
      </g>
    );
  }

  /* ── Big clear cube (rounded by the melt) ── */
  if (type === "cube") {
    const s = r; // half-edge of the front face
    const d = r * 0.36; // isometric depth
    const rad = r * 0.16; // melt-rounded corners
    const clip = `cclip-${uid}`;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <linearGradient id={`icf-${uid}`} x1="0.15" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="46%" stopColor={tint} stopOpacity="0.16" />
            <stop offset="100%" stopColor={tint} stopOpacity="0.22" />
          </linearGradient>
          <clipPath id={clip}>
            <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} />
          </clipPath>
        </defs>

        {/* top face */}
        <path
          d={`M${-s + rad * 0.5},${-s} L${-s + d},${-s - d} L${s + d},${-s - d} L${s - rad * 0.5},${-s} Z`}
          fill={tint}
          fillOpacity="0.4"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        {/* right face */}
        <path
          d={`M${s},${-s + rad * 0.5} L${s + d},${-s - d} L${s + d},${s - d} L${s},${s - rad * 0.5} Z`}
          fill={tint}
          fillOpacity="0.18"
          stroke="#ffffff"
          strokeOpacity="0.16"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        {/* front face */}
        <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} fill={`url(#icf-${uid})`} stroke="#ffffff" strokeOpacity="0.32" strokeWidth="0.8" />

        <g clipPath={`url(#${clip})`}>
          {/* submerged tint */}
          {submerged && <rect x={-s} y={wl!} width={s * 2} height={s * 2} fill={liquidColor} opacity="0.38" />}
          {/* a single soft internal sheen (no crossing fracture lines) */}
          <ellipse
            cx={-s * 0.26}
            cy={-s * 0.18}
            rx={s * 0.46}
            ry={s * 0.82}
            fill="#ffffff"
            opacity="0.06"
            transform={`rotate(-18 ${-s * 0.26} ${-s * 0.18})`}
          />
          {/* meniscus across the front face */}
          {wl != null && Math.abs(wl) < s && (
            <>
              <line x1={-s} y1={wl} x2={s} y2={wl} stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.9" />
              <rect x={-s} y={wl} width={s * 2} height={Math.max(1.2, r * 0.08)} fill="#ffffff" opacity="0.08" />
            </>
          )}
        </g>

        {/* bright melt-rounded edges (top-left catches the light) */}
        <path
          d={`M${-s + rad},${-s} A${rad} ${rad} 0 0 0 ${-s},${-s + rad} L${-s},${s - rad}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path d={`M${-s + rad},${-s + 1} L${s - rad},${-s + 1.5}`} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
      </g>
    );
  }

  /* ── Cubes / bullets — many small pieces packing the drink volume ── */
  if (type === "cubes" || type === "bullets") {
    const top = fillTop ?? cy - r;
    const bot = fillBottom ?? cy + r;
    const hw = fillHW ?? r;
    const isBullet = type === "bullets";
    // fixed piece size (svg units) — a wider/taller cup simply fits more pieces
    const piece = isBullet ? 26 : 34;
    const stepX = piece * 0.92;
    const stepY = piece * (isBullet ? 0.7 : 0.82);
    const pieces: ReactNode[] = [];
    let idx = 0;
    for (let y = bot - piece * 0.5; y > top - piece * 0.1; y -= stepY) {
      const rowI = Math.round((bot - y) / stepY);
      const stagger = rowI % 2 ? stepX * 0.5 : 0;
      for (let x = cx - hw + piece * 0.5 + stagger; x <= cx + hw - piece * 0.4; x += stepX) {
        const jx = (((idx * 13) % 7) - 3) * piece * 0.05;
        const jy = (((idx * 7) % 5) - 2) * piece * 0.05;
        const rot = (((idx * 11) % 9) - 4) * (isBullet ? 11 : 7);
        const px = x + jx;
        const py = y + jy;
        const sub = waterY != null && py > waterY + piece * 0.12;
        const half = piece * 0.5;
        pieces.push(
          <g key={idx} transform={`translate(${px} ${py}) rotate(${rot})`}>
            {isBullet ? (
              <>
                <rect x={-half} y={-half * 0.6} width={piece} height={piece * 0.6} rx={piece * 0.3} fill={tint} fillOpacity="0.5" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.6" />
                {sub && liquidColor && <rect x={-half} y={-half * 0.6} width={piece} height={piece * 0.6} rx={piece * 0.3} fill={liquidColor} opacity="0.28" />}
              </>
            ) : (
              <>
                <rect x={-half} y={-half} width={piece} height={piece} rx={piece * 0.22} fill={tint} fillOpacity="0.46" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.6" />
                {sub && liquidColor && <rect x={-half} y={-half} width={piece} height={piece} rx={piece * 0.22} fill={liquidColor} opacity="0.28" />}
              </>
            )}
            {/* top-left edge catch-light */}
            <line x1={-half * 0.66} y1={-half * (isBullet ? 0.4 : 0.66)} x2={half * 0.5} y2={-half * (isBullet ? 0.4 : 0.66)} stroke="#ffffff" strokeOpacity="0.42" strokeWidth="0.7" strokeLinecap="round" />
          </g>,
        );
        idx++;
      }
    }
    return (
      <g>
        {/* faint frosty bed so the gaps read as packed ice */}
        <rect x={cx - hw} y={top - piece * 0.2} width={hw * 2} height={bot - top + piece * 0.4} fill={tint} opacity="0.06" />
        {pieces}
      </g>
    );
  }

  /* ── Crushed — a frosty mound of angular shards ── */
  const shards: [string, number][] = [
    ["M-30,12 L-12,-6 L0,6 L-16,24 Z", 0.5],
    ["M-6,-8 L12,-18 L26,-4 L8,8 Z", 0.62],
    ["M2,2 L20,-6 L30,10 L12,18 Z", 0.46],
    ["M-18,18 L0,10 L12,24 L-6,32 Z", 0.55],
    ["M-34,22 L-18,16 L-10,30 L-26,36 Z", 0.42],
    ["M14,12 L30,8 L34,24 L18,28 Z", 0.5],
    ["M-12,28 L6,22 L16,36 L-2,42 Z", 0.4],
    ["M-2,-16 L12,-24 L22,-12 L8,-4 Z", 0.7],
    ["M20,20 L34,18 L32,34 L18,34 Z", 0.36],
    ["M-26,4 L-14,-2 L-6,10 L-20,16 Z", 0.58],
  ];
  const k = r / 34; // the shard field is authored on a ~±34 canvas
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <defs>
        <linearGradient id={`icr-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {/* frosty bed so the gaps read as packed ice, not empty glass */}
      <ellipse cx="0" cy="14" rx="36" ry="26" fill={tint} opacity="0.12" />
      {shards.map(([d, op], i) => (
        <g key={i}>
          <path d={d} fill={`url(#icr-${uid})`} stroke="#ffffff" strokeOpacity="0.32" strokeWidth="0.7" />
          <path d={d.split(" ").slice(0, 2).join(" ")} stroke="#ffffff" strokeOpacity={op * 0.5} strokeWidth="0.8" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/** Standalone ice swatch for selectors. */
export function Ice({ type, size = 72 }: { type: IceType; size?: number }) {
  if (type === "none") {
    return (
      <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden role="img">
        <circle cx="36" cy="36" r="22" fill="none" stroke="#C8A45D" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="3 5" />
        <path d="M24,48 L48,24" stroke="#C8A45D" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  const r = type === "sphere" ? 24 : type === "cube" ? 21 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden role="img">
      <IceGroup type={type} cx={36} cy={type === "cube" ? 40 : 38} r={r} fillTop={16} fillBottom={60} fillHW={24} />
    </svg>
  );
}
