"use client";

import { useId, type ReactNode } from "react";
import type { IceType } from "@/types";

/**
 * Ice rendered as clear, cold volume rather than drink-coloured blocks.
 *
 * The ice sits above the liquid layer, so it keeps its own frosty white/blue
 * body colour. Immersion is shown with a waterline glint, subtle wet veil,
 * softened corners, and refractive caustics instead of tinting the ice with
 * the drink colour.
 */
export function IceGroup({
  type,
  cx,
  cy,
  r = 26,
  tint = "#e3edf2",
  waterY,
  fillTop,
  fillBottom,
  fillHW,
}: {
  type: IceType;
  cx: number;
  cy: number;
  r?: number;
  tint?: string;
  /** absolute y of the liquid surface — enables the waterline / wet film */
  waterY?: number;
  /** kept for the caller contract; ice no longer uses drink colour as tint */
  liquidColor?: string;
  /** fill region (absolute svg coords) for the multi-piece "cubes"/"bullets" ice */
  fillTop?: number;
  fillBottom?: number;
  fillHW?: number;
}) {
  const uid = useId().replace(/:/g, "");
  if (type === "none") return null;

  const wl = waterY != null ? waterY - cy : null;
  const inWater = wl != null;

  /* ── Big clear sphere (hand-cut ice ball) ── */
  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <radialGradient id={`isph-${uid}`} cx="36%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="20%" stopColor="#f6fbff" stopOpacity="0.48" />
            <stop offset="54%" stopColor={tint} stopOpacity="0.34" />
            <stop offset="80%" stopColor="#b8d1dc" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.52" />
          </radialGradient>
          <radialGradient id={`sphHi-${uid}`} cx="36%" cy="34%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.86" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`wet-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#dff5ff" stopOpacity="0.05" />
          </linearGradient>
          <clipPath id={clip}>
            <circle r={r} />
          </clipPath>
          <filter id={`iceSoft-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>
        </defs>

        <circle r={r} fill={`url(#isph-${uid})`} opacity="0.78" />

        <g clipPath={`url(#${clip})`}>
          {inWater && <rect x={-r} y={wl!} width={r * 2} height={r * 2} fill={`url(#wet-${uid})`} />}
          <ellipse cx={-r * 0.2} cy={r * 0.36} rx={r * 0.72} ry={r * 0.52} fill="#ffffff" opacity="0.08" filter={`url(#iceSoft-${uid})`} />
          <ellipse cx={r * 0.28} cy={r * 0.28} rx={r * 0.34} ry={r * 0.16} fill="#ffffff" opacity="0.22" filter={`url(#iceSoft-${uid})`} transform={`rotate(-24 ${r * 0.28} ${r * 0.28})`} />
          <ellipse cx={-r * 0.12} cy={-r * 0.04} rx={r * 0.36} ry={r * 0.5} fill="#ffffff" opacity="0.06" />
        </g>

        <ellipse
          cx={-r * 0.32}
          cy={-r * 0.4}
          rx={r * 0.34}
          ry={r * 0.2}
          fill={`url(#sphHi-${uid})`}
          transform={`rotate(-30 ${-r * 0.32} ${-r * 0.4})`}
        />

        {wl != null && Math.abs(wl) < r * 0.98 && (
          <g clipPath={`url(#${clip})`}>
            <ellipse cx="0" cy={wl} rx={chord} ry={Math.max(1.2, r * 0.09)} fill="#ffffff" opacity="0.22" filter={`url(#iceSoft-${uid})`} />
            <ellipse cx={-chord * 0.18} cy={wl - r * 0.02} rx={chord * 0.62} ry={Math.max(0.8, r * 0.035)} fill="#ffffff" opacity="0.34" />
          </g>
        )}

        <circle cx={r * 0.3} cy={-r * 0.12} r={Math.max(0.6, r * 0.034)} fill="#ffffff" opacity="0.5" />
        <circle cx={r * 0.44} cy={r * 0.34} r={Math.max(0.5, r * 0.026)} fill="#ffffff" opacity="0.36" />
      </g>
    );
  }

  /* ── Big clear cube (old fashioned rock) ── */
  if (type === "cube") {
    const s = r;
    const d = r * 0.36;
    const rad = r * 0.22;
    const clip = `cclip-${uid}`;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <linearGradient id={`icf-${uid}`} x1="0.12" y1="0" x2="0.82" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f7fcff" stopOpacity="0.72" />
            <stop offset="72%" stopColor={tint} stopOpacity="0.56" />
            <stop offset="100%" stopColor="#d7ecf4" stopOpacity="0.48" />
          </linearGradient>
          <linearGradient id={`ictop-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e8f7fc" stopOpacity="0.54" />
          </linearGradient>
          <linearGradient id={`icside-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5fbff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#cde4ee" stopOpacity="0.42" />
          </linearGradient>
          <radialGradient id={`ichi-${uid}`} cx="36%" cy="28%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={clip}>
            <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} />
          </clipPath>
          <filter id={`iceSoft-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="0.85" />
          </filter>
        </defs>

        <path d={`M${-s + rad * 0.7},${-s} L${-s + d},${-s - d} L${s + d},${-s - d} L${s - rad * 0.45},${-s} Z`} fill={`url(#ictop-${uid})`} opacity="0.78" />
        <path d={`M${s},${-s + rad * 0.55} L${s + d},${-s - d} L${s + d},${s - d} L${s},${s - rad * 0.55} Z`} fill={`url(#icside-${uid})`} opacity="0.72" />
        <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} fill={`url(#icf-${uid})`} opacity="0.72" />

        <g clipPath={`url(#${clip})`}>
          {inWater && <rect x={-s} y={wl!} width={s * 2} height={s * 2} fill="#effbff" opacity="0.08" />}
          <ellipse cx={-s * 0.26} cy={-s * 0.22} rx={s * 0.52} ry={s * 0.9} fill={`url(#ichi-${uid})`} transform={`rotate(-18 ${-s * 0.26} ${-s * 0.22})`} />
          <ellipse cx={s * 0.36} cy={s * 0.44} rx={s * 0.42} ry={s * 0.16} fill="#ffffff" opacity="0.14" filter={`url(#iceSoft-${uid})`} transform={`rotate(-12 ${s * 0.36} ${s * 0.44})`} />
          {wl != null && Math.abs(wl) < s && (
            <>
              <ellipse cx="0" cy={wl} rx={s * 0.94} ry={Math.max(1.2, r * 0.07)} fill="#ffffff" opacity="0.24" filter={`url(#iceSoft-${uid})`} />
              <rect x={-s} y={wl} width={s * 2} height={Math.max(1.5, r * 0.1)} fill="#ffffff" opacity="0.06" />
            </>
          )}
        </g>

        <path d={`M${-s + rad * 0.5},${-s + 0.5} C${-s * 0.5},${-s * 0.95} ${s * 0.45},${-s * 0.82} ${s - rad * 0.4},${-s + 1.4} L${s - rad * 0.4},${-s + rad * 0.23} C${s * 0.34},${-s * 0.7} ${-s * 0.4},${-s * 0.78} ${-s + rad * 0.72},${-s + rad * 0.22} Z`} fill="#ffffff" opacity="0.2" />
        <ellipse cx={-s * 0.6} cy={s * 0.84} rx={s * 0.14} ry={s * 0.06} fill="#ffffff" opacity="0.2" />
      </g>
    );
  }

  /* ── Cubes / bullets — many small pieces packing the drink volume ── */
  if (type === "cubes" || type === "bullets") {
    const top = fillTop ?? cy - r;
    const bot = fillBottom ?? cy + r;
    const hw = fillHW ?? r;
    const isBullet = type === "bullets";
    const piece = isBullet ? 26 : 34;
    const stepX = piece * 0.92;
    const stepY = piece * (isBullet ? 0.7 : 0.82);
    const pieces: ReactNode[] = [];
    let idx = 0;
    const topInset = isBullet ? piece * 0.68 : piece * 0.88;
    for (let y = bot - piece * 0.5; y >= top + topInset; y -= stepY) {
      const rowI = Math.round((bot - y) / stepY);
      const stagger = rowI % 2 ? stepX * 0.5 : 0;
      for (let x = cx - hw + piece * 0.5 + stagger; x <= cx + hw - piece * 0.4; x += stepX) {
        const jx = (((idx * 13) % 7) - 3) * piece * 0.05;
        const jy = (((idx * 7) % 5) - 2) * piece * 0.05;
        const rot = (((idx * 11) % 9) - 4) * (isBullet ? 11 : 7);
        const px = x + jx;
        const py = y + jy;
        const half = piece * 0.5;
        const sub = waterY != null && py > waterY + piece * 0.12;
        pieces.push(
          <g key={idx} transform={`translate(${px} ${py}) rotate(${rot})`} opacity={sub ? 0.58 : 0.68}>
            {isBullet ? (
              <>
                <rect x={-half} y={-half * 0.6} width={piece} height={piece * 0.6} rx={piece * 0.3} fill={`url(#piece-${uid})`} />
                <ellipse cx={-half * 0.28} cy={-half * 0.34} rx={piece * 0.26} ry={piece * 0.08} fill={`url(#pieceHi-${uid})`} />
                <ellipse cx={half * 0.2} cy={half * 0.16} rx={piece * 0.32} ry={piece * 0.07} fill="#ffffff" opacity="0.1" />
              </>
            ) : (
              <>
                <rect x={-half} y={-half} width={piece} height={piece} rx={piece * 0.26} fill={`url(#piece-${uid})`} />
                <ellipse cx={-half * 0.24} cy={-half * 0.28} rx={piece * 0.32} ry={piece * 0.16} fill={`url(#pieceHi-${uid})`} transform={`rotate(-18 ${-half * 0.24} ${-half * 0.28})`} />
                <ellipse cx={half * 0.22} cy={half * 0.24} rx={piece * 0.32} ry={piece * 0.1} fill="#ffffff" opacity="0.1" />
              </>
            )}
            {waterY != null && Math.abs(py - waterY) < piece * 0.55 && <ellipse cx="0" cy={waterY - py} rx={piece * 0.46} ry={piece * 0.05} fill="#ffffff" opacity="0.2" />}
          </g>,
        );
        idx++;
      }
    }
    return (
      <g>
        <defs>
          <linearGradient id={`piece-${uid}`} x1="0.18" y1="0" x2="0.92" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="45%" stopColor="#f1fbff" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#d1e8f1" stopOpacity="0.36" />
          </linearGradient>
          <radialGradient id={`pieceHi-${uid}`} cx="38%" cy="35%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.74" />
            <stop offset="72%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {pieces}
      </g>
    );
  }

  /* ── Crushed — a frosty mound of angular melt-softened shards ── */
  const shards: [string, number][] = [
    ["M-30,12 Q-20,-4 0,6 Q-8,22 -16,24 Z", 0.5],
    ["M-6,-8 Q10,-22 26,-4 Q17,7 8,8 Z", 0.62],
    ["M2,2 Q20,-8 30,10 Q19,20 12,18 Z", 0.46],
    ["M-18,18 Q0,8 12,24 Q2,34 -6,32 Z", 0.55],
    ["M-34,22 Q-18,14 -10,30 Q-22,38 -26,36 Z", 0.42],
    ["M14,12 Q30,6 34,24 Q24,30 18,28 Z", 0.5],
    ["M-12,28 Q6,20 16,36 Q4,44 -2,42 Z", 0.4],
    ["M-2,-16 Q12,-26 22,-12 Q13,-2 8,-4 Z", 0.7],
    ["M20,20 Q34,16 32,34 Q22,36 18,34 Z", 0.36],
    ["M-26,4 Q-14,-4 -6,10 Q-16,18 -20,16 Z", 0.58],
  ];
  const k = r / 34;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <defs>
        <linearGradient id={`icr-${uid}`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="54%" stopColor="#f0fbff" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#d1e8f1" stopOpacity="0.48" />
        </linearGradient>
        <radialGradient id={`crHi-${uid}`} cx="35%" cy="32%" r="58%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="16" rx="38" ry="25" fill="#effbff" opacity="0.11" />
      {shards.map(([d, op], i) => (
        <g key={i}>
          <path d={d} fill={`url(#icr-${uid})`} opacity={0.76 + op * 0.2} />
          <ellipse cx={i % 2 ? 8 : -8} cy={i < 3 ? -2 : 18} rx="8" ry="3.2" fill={`url(#crHi-${uid})`} transform={`rotate(${i % 2 ? -20 : 16})`} />
        </g>
      ))}
      <ellipse cx="-10" cy="30" rx="15" ry="3.5" fill="#ffffff" opacity="0.14" />
      <ellipse cx="17" cy="26" rx="12" ry="3" fill="#ffffff" opacity="0.12" />
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
