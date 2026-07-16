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
  liquidColor,
  selector = false,
  iceSeed = 0,
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
  selector?: boolean;
  iceSeed?: number;
}) {
  const uid = useId().replace(/:/g, "");
  if (type === "none") return null;

  const wl = waterY != null ? waterY - cy : null;
  const inWater = wl != null;

  /* ── Big clear sphere (hand-cut ice ball) ── */
  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;

    const renderSphere = (sub: boolean) => (
      <g>
        {/* Base Sphere */}
        <circle r={r} fill={`url(#isph-${sub ? "sub" : "dry"}-${uid})`} opacity={sub ? 0.78 : 0.78} filter={`url(#sphereSoft-${uid})`} />

        {/* Refractive Inner Highlights */}
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={-r * 0.2} cy={r * 0.36} rx={r * 0.72} ry={r * 0.52} fill="#ffffff" opacity={sub ? 0.06 : 0.08} filter={`url(#glowSoft-${uid})`} />
          <ellipse cx={r * 0.28} cy={r * 0.28} rx={r * 0.34} ry={r * 0.16} fill="#ffffff" opacity={sub ? 0.16 : 0.22} filter={`url(#glowSoft-${uid})`} transform={`rotate(-24 ${r * 0.28} ${r * 0.28})`} />
          <ellipse cx={-r * 0.12} cy={-r * 0.04} rx={r * 0.36} ry={r * 0.5} fill="#ffffff" opacity={sub ? 0.04 : 0.06} filter={`url(#iceGlow-${uid})`} />
        </g>

        {/* Main Specular Highlight */}
        <ellipse
          cx={-r * 0.32}
          cy={-r * 0.4}
          rx={r * 0.34}
          ry={r * 0.2}
          fill={`url(#sphHi-${sub ? "sub" : "dry"}-${uid})`}
          transform={`rotate(-30 ${-r * 0.32} ${-r * 0.4})`}
          filter={`url(#glowSoft-${uid})`}
        />

        {/* Outer/Inner Small Sparkle details */}
        <g filter={`url(#iceGlow-${uid})`}>
          <circle cx={r * 0.3} cy={-r * 0.12} r={Math.max(0.6, r * 0.034)} fill="#ffffff" opacity={sub ? 0.38 : 0.5} />
          <circle cx={r * 0.44} cy={r * 0.34} r={Math.max(0.5, r * 0.026)} fill="#ffffff" opacity={sub ? 0.26 : 0.36} />
        </g>
      </g>
    );

    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <clipPath id={clip}>
            <circle r={r} />
          </clipPath>
          {wl != null && (
            <>
              <clipPath id={`dryClip-${uid}`}>
                <rect x={-r - 5} y={-r - 5} width={r * 2 + 10} height={wl + r + 5} />
              </clipPath>
              <clipPath id={`subClip-${uid}`}>
                <rect x={-r - 5} y={wl} width={r * 2 + 10} height={500} />
              </clipPath>
            </>
          )}
          <filter id={`cubeSoft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
          <filter id={`iceSoft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id={`iceGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id={`glowSoft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
          <filter id={`sphereSoft-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={selector ? 0 : 0.8} />
          </filter>
          <radialGradient id={`isph-dry-${uid}`} cx="36%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
            <stop offset="20%" stopColor="#f6fbff" stopOpacity="0.48" />
            <stop offset="54%" stopColor={tint} stopOpacity="0.34" />
            <stop offset="80%" stopColor="#b8d1dc" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.52" />
          </radialGradient>
          <radialGradient id={`isph-sub-${uid}`} cx="36%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.48" />
            <stop offset="20%" stopColor="#f6fbff" stopOpacity="0.32" />
            <stop offset="54%" stopColor={tint} stopOpacity="0.22" />
            <stop offset="80%" stopColor="#b8d1dc" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.38" />
          </radialGradient>
          <radialGradient id={`sphHi-dry-${uid}`} cx="36%" cy="34%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.86" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`sphHi-sub-${uid}`} cx="36%" cy="34%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {wl == null ? (
          renderSphere(false)
        ) : (
          <>
            <g clipPath={`url(#dryClip-${uid})`}>{renderSphere(false)}</g>
            <g clipPath={`url(#subClip-${uid})`}>{renderSphere(true)}</g>
            {/* Waterline Caustics */}
            {Math.abs(wl) < r * 0.98 && (
              <g clipPath={`url(#${clip})`}>
                <ellipse cx="0" cy={wl} rx={chord} ry={Math.max(1.2, r * 0.09)} fill="#ffffff" opacity="0.25" filter={`url(#iceSoft-${uid})`} />
                <ellipse cx={-chord * 0.18} cy={wl - r * 0.02} rx={chord * 0.62} ry={Math.max(0.8, r * 0.035)} fill="#ffffff" opacity="0.38" />
              </g>
            )}
          </>
        )}
      </g>
    );
  }

  /* ── Big clear cube (old fashioned rock) ── */
  if (type === "cube") {
    const s = r;
    const d = r * 0.36;
    const rad = r * 0.22;
    const clip = `cclip-${uid}`;

    const renderCube = (sub: boolean) => (
      <g>
        {/* Top/Side/Front face render */}
        <g filter={`url(#cubeSoft-${uid})`}>
          <path d={`M${-s + rad * 0.7},${-s} L${-s + d},${-s - d} L${s + d},${-s - d} L${s - rad * 0.45},${-s} Z`} fill={`url(#ictop-${sub ? "sub" : "dry"}-${uid})`} opacity={sub ? 0.48 : 0.78} />
          <path d={`M${s},${-s + rad * 0.55} L${s + d},${-s - d} L${s + d},${s - d} L${s},${s - rad * 0.55} Z`} fill={`url(#icside-${sub ? "sub" : "dry"}-${uid})`} opacity={sub ? 0.42 : 0.72} />
          <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} fill={`url(#icf-${sub ? "sub" : "dry"}-${uid})`} opacity={sub ? 0.44 : 0.72} />
        </g>

        {/* Refractive inner glow highlights */}
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={-s * 0.26} cy={-s * 0.15} rx={s * 0.52} ry={s * 0.7} fill={`url(#ichi-${sub ? "sub" : "dry"}-${uid})`} transform={`rotate(-18 ${-s * 0.26} ${-s * 0.15})`} filter={`url(#glowSoft-${uid})`} />
          <ellipse cx={s * 0.36} cy={s * 0.44} rx={s * 0.42} ry={s * 0.16} fill="#ffffff" opacity={sub ? 0.09 : 0.14} filter={`url(#iceGlow-${uid})`} transform={`rotate(-12 ${s * 0.36} ${s * 0.44})`} />
        </g>

        {/* Prism/edge shine effects */}
        <path d={`M${-s + rad * 0.5},${-s + 0.5} C${-s * 0.5},${-s * 0.95} ${s * 0.45},${-s * 0.82} ${s - rad * 0.4},${-s + 1.4} L${s - rad * 0.4},${-s + rad * 0.23} C${s * 0.34},${-s * 0.7} ${-s * 0.4},${-s * 0.78} ${-s + rad * 0.72},${-s + rad * 0.22} Z`} fill="#ffffff" opacity={sub ? 0.12 : 0.2} filter={`url(#iceGlow-${uid})`} />
        <ellipse cx={-s * 0.6} cy={s * 0.84} rx={s * 0.14} ry={s * 0.06} fill="#ffffff" opacity={sub ? 0.11 : 0.2} filter={`url(#iceGlow-${uid})`} />
      </g>
    );

    return (
      <g transform={`translate(${cx} ${cy})`}>
        <defs>
          <clipPath id={clip}>
            <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={rad} />
          </clipPath>
          {wl != null && (
            <>
              {/* Note: the cube top extends up to -s - d. We extend the dry clip box to accommodate this projection */}
              <clipPath id={`dryClip-${uid}`}>
                <rect x={-s - 10} y={-s - d - 10} width={s * 2 + d + 20} height={wl + s + d + 10} />
              </clipPath>
              <clipPath id={`subClip-${uid}`}>
                <rect x={-s - 10} y={wl} width={s * 2 + d + 20} height={500} />
              </clipPath>
            </>
          )}
          <filter id={`cubeSoft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
          <filter id={`iceSoft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id={`iceGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id={`glowSoft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
          <linearGradient id={`icf-dry-${uid}`} x1="0.12" y1="0" x2="0.82" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f7fcff" stopOpacity="0.72" />
            <stop offset="72%" stopColor={tint} stopOpacity="0.56" />
            <stop offset="100%" stopColor="#d7ecf4" stopOpacity="0.48" />
          </linearGradient>
          <linearGradient id={`icf-sub-${uid}`} x1="0.12" y1="0" x2="0.82" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.52" />
            <stop offset="35%" stopColor="#f7fcff" stopOpacity="0.38" />
            <stop offset="72%" stopColor={tint} stopOpacity="0.26" />
            <stop offset="100%" stopColor="#d7ecf4" stopOpacity="0.20" />
          </linearGradient>
          <linearGradient id={`ictop-dry-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e8f7fc" stopOpacity="0.54" />
          </linearGradient>
          <linearGradient id={`ictop-sub-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#e8f7fc" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={`icside-dry-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5fbff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#cde4ee" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={`icside-sub-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5fbff" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#cde4ee" stopOpacity="0.20" />
          </linearGradient>
          <radialGradient id={`ichi-dry-${uid}`} cx="36%" cy="28%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`ichi-sub-${uid}`} cx="36%" cy="28%" r="64%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.48" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {wl == null ? (
          renderCube(false)
        ) : (
          <>
            <g clipPath={`url(#dryClip-${uid})`}>{renderCube(false)}</g>
            <g clipPath={`url(#subClip-${uid})`}>{renderCube(true)}</g>
            {/* Waterline caustics */}
            {Math.abs(wl) < s && (
              <>
                <ellipse cx="0" cy={wl} rx={s * 0.94} ry={Math.max(1.2, r * 0.07)} fill="#ffffff" opacity="0.25" filter={`url(#iceSoft-${uid})`} />
                <rect x={-s} y={wl} width={s * 2} height={Math.max(1.5, r * 0.1)} fill="#ffffff" opacity="0.08" />
              </>
            )}
          </>
        )}
      </g>
    );
  }

  /* ── Cubes / bullets — many small pieces packing the drink volume ── */
  if (type === "cubes" || type === "bullets") {
    const top = fillTop ?? cy - r;
    const bot = fillBottom ?? cy + r;
    const hw = fillHW ?? r;
    const isBullet = type === "bullets";
    const piece = isBullet ? 26 : 42;
    const stepX = piece * (isBullet ? 0.84 : 0.62);
    const stepY = piece * (isBullet ? 0.65 : 0.5);
    const startOffset = piece * (isBullet ? 0.55 : 0.44);
    const endOffset = piece * (isBullet ? 0.45 : 0.34);
    const pieces: ReactNode[] = [];
    const clipDefs: ReactNode[] = [];
    let idx = 0;
    const topInset = isBullet ? piece * 0.68 : piece * 0.62;
    const liquid = liquidColor || "#e2f1f7";
    const cool1 = selector ? "#d7dbdc" : "#bae6fd";
    const cool2 = selector ? "#eef0ef" : "#e0f2fe";
    const cool3 = selector ? "#c4c9ca" : "#7dd3fc";
    const softWhite = selector ? "#f1f2f1" : "#f0f9ff";
    const cavity1 = selector ? "#9da5a7" : "#9fc1d0";
    const cavity2 = selector ? "#c4cbcc" : "#c5dfea";
    const cubeTopPath = "M -12.5,-8.2 L -1.6,-14.5 Q 0,-15.4 1.6,-14.5 L 12.5,-8.2 L 1.6,-1.9 Q 0,-1 -1.6,-1.9 Z";
    const cubeLeftPath = "M 0,-1 L -10.9,-7.3 Q -12.5,-8.2 -12.5,-6.4 L -12.5,4.4 Q -12.5,6.2 -10.9,7.1 L -1.6,12.5 Q 0,13.4 0,11.6 Z";
    const cubeRightPath = "M 0,-1 L 10.9,-7.3 Q 12.5,-8.2 12.5,-6.4 L 12.5,4.4 Q 12.5,6.2 10.9,7.1 L 1.6,12.5 Q 0,13.4 0,11.6 Z";
    const cubeCoreTopPath = "M -4.5,-3.9 L -0.7,-6.1 Q 0,-6.5 0.7,-6.1 L 4.5,-3.9 L 0.7,-1.7 Q 0,-1.3 -0.7,-1.7 Z";
    const cubeCoreLeftPath = "M 0,-1.3 L -3.9,-3.6 Q -4.5,-3.9 -4.5,-3.2 L -4.5,1.3 Q -4.5,2 -3.9,2.4 L -0.7,4.2 Q 0,4.6 0,3.9 Z";
    const cubeCoreRightPath = "M 0,-1.3 L 3.9,-3.6 Q 4.5,-3.9 4.5,-3.2 L 4.5,1.3 Q 4.5,2 3.9,2.4 L 0.7,4.2 Q 0,4.6 0,3.9 Z";
    const seed = Math.abs(Math.floor(iceSeed || 0));
    const seeded = seed > 0;
    const rnd = (salt: number) => {
      const x = Math.sin((seed + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    const bottomInset = isBullet ? piece * 0.5 : piece * 0.36;
    for (let y = bot - bottomInset; y >= top + topInset; y -= stepY) {
      const rowI = Math.round((bot - y) / stepY);
      const rowDrift = seeded ? (rnd(rowI + 0.17) - 0.5) * stepX * (isBullet ? 0.16 : 0.12) : 0;
      const stagger = (rowI % 2 ? stepX * 0.5 : 0) + rowDrift;
      for (let x = cx - hw + startOffset + stagger; x <= cx + hw - endOffset; x += stepX) {
        const baseJx = (((idx * 13) % 7) - 3) * piece * 0.05;
        const baseJy = (((idx * 7) % 5) - 2) * piece * 0.05;
        const baseRot = (((idx * 11) % 9) - 4) * (isBullet ? 8 : 5);
        const jx = baseJx + (seeded ? (rnd(idx * 5 + 1.3) - 0.5) * piece * (isBullet ? 0.1 : 0.08) : 0);
        const jy = baseJy + (seeded ? (rnd(idx * 5 + 2.7) - 0.5) * piece * (isBullet ? 0.1 : 0.07) : 0);
        const rot = baseRot + (seeded ? (rnd(idx * 5 + 4.1) - 0.5) * (isBullet ? 8 : 5) : 0);
        const px = x + jx;
        const rawPy = y + jy;
        const py = isBullet ? rawPy : Math.max(rawPy, top + piece * 0.62);

        const localWaterY = waterY != null ? waterY - py : null;
        const scale = isBullet ? piece / 26 : piece / 34;
        const pieceH = (isBullet ? 15 : 17) * scale; // half-height of piece bounding box
        const isSubmerged = localWaterY != null && localWaterY < -pieceH;
        const isDry = localWaterY == null || localWaterY > pieceH;
        const isIntersecting = !isDry && !isSubmerged && localWaterY != null;

        // Dynamic clip paths for intersecting pieces
        if (isIntersecting && localWaterY != null) {
          clipDefs.push(
            <clipPath id={`dryClip-${uid}-${idx}`} key={`dry-${idx}`}>
              <rect x={-50} y={-100} width={100} height={100 + localWaterY} />
            </clipPath>,
            <clipPath id={`subClip-${uid}-${idx}`} key={`sub-${idx}`}>
              <rect x={-50} y={localWaterY} width={100} height={100 - localWaterY} />
            </clipPath>
          );
        }

        // Render function for 3D shapes
        const renderPiece = (sub: boolean) => {
          if (isBullet) {
            return (
              <g transform={`rotate(${rot}) scale(${scale})`}>
                {/* 1. Outer Shell (slightly softened to look wet/immersed) */}
                <path
                  d="M -13,-4 A 13,11 0 0 1 13,-4 L 13,11 A 13,3.5 0 0 1 -13,11 Z"
                  fill={`url(#bulletOuter-${sub ? "sub" : "dry"}-${uid})`}
                  filter={`url(#cubeSoft-${uid})`}
                />
                
                {/* 2. Inner Hollow Cavity (softer edges) */}
                <path
                  d="M -6,11 L -6,-3 A 6,6 0 0 1 6,-3 L 6,11 A 6,1.6 0 0 1 -6,11 Z"
                  fill={`url(#bulletCavity-${sub ? "sub" : "dry"}-${uid})`}
                  filter={`url(#cubeSoft-${uid})`}
                />
                
                {/* 3. Cylindrical Specular Highlight (blurry reflection) */}
                <path
                  d="M -9,-2 L -9,8"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity={sub ? 0.15 : 0.45}
                  filter={`url(#iceSoft-${uid})`}
                  fill="none"
                />
                
                {/* 4. Dome Highlight Arc (blurry highlight) */}
                <path
                  d="M -10,-6 A 10,8 0 0 1 -2,-13"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity={sub ? 0.18 : 0.55}
                  filter={`url(#iceSoft-${uid})`}
                  fill="none"
                />

                {/* 5. Concentric bottom rims (blurry thickness highlights) */}
                <path
                  d="M -13,11 A 13,3.5 0 0 0 13,11"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  opacity={sub ? 0.12 : 0.35}
                  filter={`url(#iceSoft-${uid})`}
                  fill="none"
                />
                <path
                  d="M -6,11 A 6,1.6 0 0 0 6,11"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  opacity={sub ? 0.1 : 0.25}
                  filter={`url(#iceSoft-${uid})`}
                  fill="none"
                />
              </g>
            );
          } else {
            // Softened 3D Cube
            return (
              <g transform={`rotate(${rot}) scale(${scale})`}>
                {/* 1. Faces Group (with a subtle blur to soften edges between faces and perimeter) */}
                <g filter={`url(#cubeSoft-${uid})`}>
                  {/* Right Face */}
                  <path
                    d={cubeRightPath}
                    fill={`url(#cubeRight-${sub ? "sub" : "dry"}-${uid})`}
                  />
                  {/* Left Face */}
                  <path
                    d={cubeLeftPath}
                    fill={`url(#cubeLeft-${sub ? "sub" : "dry"}-${uid})`}
                  />
                  {/* Top Face */}
                  <path
                    d={cubeTopPath}
                    fill={`url(#cubeTop-${sub ? "sub" : "dry"}-${uid})`}
                  />
                </g>
                <ellipse cx={0} cy={-1.2} rx={2.4} ry={1.2} fill="#ffffff" opacity={sub ? 0.08 : 0.22} filter={`url(#iceSoft-${uid})`} />

                {/* 2. Crisp Edge Highlights — slightly tighter strokes for sharper facet lines */}
                <path d="M 0,-1 L 0,13.4" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity={sub ? 0.18 : 0.42} filter={`url(#iceSoft-${uid})`} fill="none" />
                <path d="M -0.8,-1.4 Q -5.2,-4.1 -10.4,-7.1" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity={sub ? 0.1 : 0.22} filter={`url(#iceSoft-${uid})`} fill="none" />
                <path d="M 0.8,-1.4 Q 5.2,-4.1 10.4,-7.1" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity={sub ? 0.1 : 0.22} filter={`url(#iceSoft-${uid})`} fill="none" />
                <path d="M -12.2,-5.7 Q -12.5,-0.4 -12.1,4.6 M 12.2,-5.7 Q 12.5,-0.4 12.1,4.6" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" opacity={sub ? 0.07 : 0.14} filter={`url(#iceSoft-${uid})`} fill="none" />

                {/* Outer Rim Highlights */}
                <path d="M -10.2,-7.3 Q -5.2,-10.4 -1.8,-13.1 M 1.8,-13.1 Q 5.2,-10.4 10.2,-7.3" stroke="#ffffff" strokeWidth="0.95" strokeLinecap="round" opacity={sub ? 0.1 : 0.26} filter={`url(#iceSoft-${uid})`} fill="none" />

                {/* 3. Rounded Frosted Core (placed inside iceGlow for heavy blurring) */}
                <g filter={`url(#iceGlow-${uid})`} opacity={sub ? 0.08 : 0.16}>
                  <path d={cubeCoreTopPath} fill="#ffffff" />
                  <path d={cubeCoreLeftPath} fill="#ffffff" />
                  <path d={cubeCoreRightPath} fill="#ffffff" />
                </g>
              </g>
            );
          }
        };

        pieces.push(
          <g key={idx} transform={`translate(${px} ${py})`}>
            {isDry && renderPiece(false)}
            {isSubmerged && renderPiece(true)}
            {isIntersecting && (
              <>
                <g clipPath={`url(#subClip-${uid}-${idx})`}>
                  {renderPiece(true)}
                </g>
                <g clipPath={`url(#dryClip-${uid}-${idx})`}>
                  {renderPiece(false)}
                </g>
                <ellipse
                  cx={0}
                  cy={localWaterY!}
                  rx={(isBullet ? 12 : 16) * scale}
                  ry={(isBullet ? 1.5 : 2) * scale}
                  fill="#ffffff"
                  opacity="0.25"
                  filter={`url(#iceSoft-${uid})`}
                />
                <ellipse
                  cx={0}
                  cy={localWaterY!}
                  rx={(isBullet ? 8 : 10) * scale}
                  ry={(isBullet ? 0.6 : 0.8) * scale}
                  fill="#ffffff"
                  opacity="0.4"
                />
              </>
            )}
          </g>
        );
        idx++;
      }
    }

    if (pieces.length === 0) {
      const px = cx;
      const py = cy;
      const localWaterY = waterY != null ? waterY - py : null;
      const scale = isBullet ? piece / 26 : piece / 34;
      const pieceH = (isBullet ? 15 : 17) * scale; // half-height of piece bounding box
      const isSubmerged = localWaterY != null && localWaterY < -pieceH;
      const isDry = localWaterY == null || localWaterY > pieceH;
      const isIntersecting = !isDry && !isSubmerged && localWaterY != null;

      if (isIntersecting && localWaterY != null) {
        clipDefs.push(
          <clipPath id={`dryClip-${uid}-fallback`} key="dry-fallback">
            <rect x={-50} y={-100} width={100} height={100 + localWaterY} />
          </clipPath>,
          <clipPath id={`subClip-${uid}-fallback`} key="sub-fallback">
            <rect x={-50} y={localWaterY} width={100} height={100 - localWaterY} />
          </clipPath>
        );
      }

      // Render function for 3D shapes
      const renderPiece = (sub: boolean) => {
        if (isBullet) {
          return (
            <g transform={`rotate(0) scale(${scale})`}>
              {/* 1. Outer Shell (slightly softened to look wet/immersed) */}
              <path
                d="M -13,-4 A 13,11 0 0 1 13,-4 L 13,11 A 13,3.5 0 0 1 -13,11 Z"
                fill={`url(#bulletOuter-${sub ? "sub" : "dry"}-${uid})`}
                filter={`url(#cubeSoft-${uid})`}
              />
              
              {/* 2. Inner Hollow Cavity (softer edges) */}
              <path
                d="M -6,11 L -6,-3 A 6,6 0 0 1 6,-3 L 6,11 A 6,1.6 0 0 1 -6,11 Z"
                fill={`url(#bulletCavity-${sub ? "sub" : "dry"}-${uid})`}
                filter={`url(#cubeSoft-${uid})`}
              />
              
              {/* 3. Cylindrical Specular Highlight (blurry reflection) */}
              <path
                d="M -9,-2 L -9,8"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity={sub ? 0.15 : 0.45}
                filter={`url(#iceSoft-${uid})`}
                fill="none"
              />
              
              {/* 4. Dome Highlight Arc (blurry highlight) */}
              <path
                d="M -10,-6 A 10,8 0 0 1 -2,-13"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity={sub ? 0.18 : 0.55}
                filter={`url(#iceSoft-${uid})`}
                fill="none"
              />

              {/* 5. Concentric bottom rims (blurry thickness highlights) */}
              <path
                d="M -13,11 A 13,3.5 0 0 0 13,11"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity={sub ? 0.12 : 0.35}
                filter={`url(#iceSoft-${uid})`}
                fill="none"
              />
              <path
                d="M -6,11 A 6,1.6 0 0 0 6,11"
                stroke="#ffffff"
                strokeWidth="0.8"
                opacity={sub ? 0.1 : 0.25}
                filter={`url(#iceSoft-${uid})`}
                fill="none"
              />
            </g>
          );
        } else {
          // Rounded 3D Cube
          return (
            <g transform={`rotate(-5) scale(${scale})`}>
              {/* 1. Faces Group (with a subtle blur to soften edges between faces and perimeter) */}
              <g filter={`url(#cubeSoft-${uid})`}>
                {/* Right Face */}
                <path
                  d={cubeRightPath}
                  fill={`url(#cubeRight-${sub ? "sub" : "dry"}-${uid})`}
                />
                {/* 2. Left Face */}
                <path
                  d={cubeLeftPath}
                  fill={`url(#cubeLeft-${sub ? "sub" : "dry"}-${uid})`}
                />
                {/* 3. Top Face */}
                <path
                  d={cubeTopPath}
                  fill={`url(#cubeTop-${sub ? "sub" : "dry"}-${uid})`}
                />
              </g>
              <ellipse cx={0} cy={-1.2} rx={2.4} ry={1.2} fill="#ffffff" opacity={sub ? 0.08 : 0.22} filter={`url(#iceSoft-${uid})`} />

              {/* 2. Soft Edge Highlights (blurred to represent light refractions instead of hard lines) */}
              <path d="M 0,-1 L 0,13.4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity={sub ? 0.16 : 0.35} filter={`url(#iceSoft-${uid})`} fill="none" />
              <path d="M -0.8,-1.4 Q -5.2,-4.1 -10.4,-7.1" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity={sub ? 0.08 : 0.18} filter={`url(#iceSoft-${uid})`} fill="none" />
              <path d="M 0.8,-1.4 Q 5.2,-4.1 10.4,-7.1" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity={sub ? 0.08 : 0.18} filter={`url(#iceSoft-${uid})`} fill="none" />
              <path d="M -12.2,-5.7 Q -12.5,-0.4 -12.1,4.6 M 12.2,-5.7 Q 12.5,-0.4 12.1,4.6" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" opacity={sub ? 0.06 : 0.12} filter={`url(#iceSoft-${uid})`} fill="none" />
              
              {/* Outer Rim Highlights (soft glow) */}
              <path d="M -10.2,-7.3 Q -5.2,-10.4 -1.8,-13.1 M 1.8,-13.1 Q 5.2,-10.4 10.2,-7.3" stroke="#ffffff" strokeWidth="1.0" strokeLinecap="round" opacity={sub ? 0.09 : 0.22} filter={`url(#iceSoft-${uid})`} fill="none" />

              {/* 3. Rounded Frosted Core (placed inside iceGlow for heavy blurring) */}
              <g filter={`url(#iceGlow-${uid})`} opacity={sub ? 0.08 : 0.16}>
                <path d={cubeCoreTopPath} fill="#ffffff" />
                <path d={cubeCoreLeftPath} fill="#ffffff" />
                <path d={cubeCoreRightPath} fill="#ffffff" />
              </g>
            </g>
          );
        }
      };

      pieces.push(
        <g key="fallback" transform={`translate(${px} ${py})`}>
          {isDry && renderPiece(false)}
          {isSubmerged && renderPiece(true)}
          {isIntersecting && (
            <>
              <g clipPath={`url(#subClip-${uid}-fallback)`}>
                {renderPiece(true)}
              </g>
              <g clipPath={`url(#dryClip-${uid}-fallback)`}>
                {renderPiece(false)}
              </g>
              <ellipse
                cx={0}
                cy={localWaterY!}
                rx={(isBullet ? 12 : 16) * scale}
                ry={(isBullet ? 1.5 : 2) * scale}
                fill="#ffffff"
                opacity="0.25"
                filter={`url(#iceSoft-${uid})`}
              />
              <ellipse
                cx={0}
                cy={localWaterY!}
                rx={(isBullet ? 8 : 10) * scale}
                ry={(isBullet ? 0.6 : 0.8) * scale}
                fill="#ffffff"
                opacity="0.4"
              />
            </>
          )}
        </g>
      );
    }

    return (
      <g>
        <defs>
          {clipDefs}
          <filter id={`cubeSoft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
          <filter id={`iceSoft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id={`iceGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          {/* Bullet Ice Gradients */}
          <linearGradient id={`bulletOuter-dry-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cool1} stopOpacity="0.78" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="55%" stopColor={cool2} stopOpacity="0.65" />
            <stop offset="85%" stopColor={cool3} stopOpacity="0.58" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.76" />
          </linearGradient>
          <linearGradient id={`bulletOuter-sub-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cool1} stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="55%" stopColor={cool2} stopOpacity="0.08" />
            <stop offset="85%" stopColor={cool3} stopOpacity="0.06" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={`bulletCavity-dry-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cavity1} stopOpacity="0.7" />
            <stop offset="100%" stopColor={cavity2} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`bulletCavity-sub-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cool1} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>

          {/* Sharp Cube Gradients */}
          <linearGradient id={`cubeTop-dry-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="60%" stopColor={cool2} stopOpacity="0.78" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id={`cubeTop-sub-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="60%" stopColor={cool2} stopOpacity="0.12" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id={`cubeLeft-dry-${uid}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.86" />
            <stop offset="50%" stopColor={softWhite} stopOpacity="0.68" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id={`cubeLeft-sub-${uid}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="50%" stopColor={softWhite} stopOpacity="0.1" />
            <stop offset="100%" stopColor={cool1} stopOpacity="0.06" />
          </linearGradient>

          <linearGradient id={`cubeRight-dry-${uid}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={softWhite} stopOpacity="0.78" />
            <stop offset="50%" stopColor={cool1} stopOpacity="0.58" />
            <stop offset="100%" stopColor={cool3} stopOpacity="0.44" />
          </linearGradient>
          <linearGradient id={`cubeRight-sub-${uid}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={softWhite} stopOpacity="0.18" />
            <stop offset="50%" stopColor={cool1} stopOpacity="0.08" />
            <stop offset="100%" stopColor={cool3} stopOpacity="0.05" />
          </linearGradient>
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
        <filter id={`crushedSoft-${uid}`} x="-18%" y="-18%" width="136%" height="136%">
          <feGaussianBlur stdDeviation="0.72" />
        </filter>
        <filter id={`crushedGlow-${uid}`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <linearGradient id={`icr-${uid}`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.64" />
          <stop offset="58%" stopColor="#f4fbfc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e1eef1" stopOpacity="0.24" />
        </linearGradient>
        <radialGradient id={`crHi-${uid}`} cx="35%" cy="32%" r="58%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="56%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="16" rx="39" ry="26" fill="#effbff" opacity="0.07" filter={`url(#crushedGlow-${uid})`} />
      {shards.map(([d, op], i) => (
        <g key={i} filter={`url(#crushedSoft-${uid})`}>
          <path d={d} fill={`url(#icr-${uid})`} opacity={0.52 + op * 0.1} />
          <ellipse cx={i % 2 ? 8 : -8} cy={i < 3 ? -2 : 18} rx="11" ry="5" fill={`url(#crHi-${uid})`} transform={`rotate(${i % 2 ? -20 : 16})`} filter={`url(#crushedGlow-${uid})`} />
        </g>
      ))}
      <ellipse cx="-4" cy="18" rx="28" ry="14" fill="#ffffff" opacity="0.055" filter={`url(#crushedGlow-${uid})`} />
      <ellipse cx="-10" cy="30" rx="16" ry="4.2" fill="#ffffff" opacity="0.06" filter={`url(#crushedGlow-${uid})`} />
      <ellipse cx="17" cy="26" rx="13" ry="3.6" fill="#ffffff" opacity="0.055" filter={`url(#crushedGlow-${uid})`} />
    </g>
  );
}

/** Standalone ice swatch for selectors. */
export function Ice({ type, size = 72, selector = false }: { type: IceType; size?: number; selector?: boolean }) {
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
      <IceGroup type={type} cx={36} cy={type === "cube" ? 40 : 38} r={r} fillTop={16} fillBottom={60} fillHW={24} selector={selector} />
    </svg>
  );
}
