"use client";

import { useId } from "react";
import type { SpiritFamily } from "@/lib/tokens";
import { liquidRamp } from "@/lib/tokens";

export type BottleShape = "standard" | "tall" | "squat" | "flask";

const SHAPE_BY_FAMILY: Record<SpiritFamily, BottleShape> = {
  whisky: "squat",
  whiskyPeat: "squat",
  brandy: "flask",
  gin: "tall",
  vodka: "tall",
  rum: "standard",
  tequila: "standard",
  absinthe: "tall",
  campari: "standard",
  vermouth: "standard",
  wine: "tall",
  cream: "standard",
  default: "standard",
};

/** Geometry per silhouette: body rect + shoulder control + neck width. */
const SHAPES: Record<
  BottleShape,
  { bodyTop: number; bodyW: number; neckW: number; shoulderH: number; rx: number }
> = {
  standard: { bodyTop: 108, bodyW: 66, neckW: 20, shoulderH: 34, rx: 12 },
  tall: { bodyTop: 124, bodyW: 54, neckW: 17, shoulderH: 30, rx: 10 },
  squat: { bodyTop: 134, bodyW: 78, neckW: 22, shoulderH: 24, rx: 16 },
  flask: { bodyTop: 120, bodyW: 84, neckW: 19, shoulderH: 40, rx: 30 },
};

export interface BottleProps {
  family?: SpiritFamily;
  shape?: BottleShape;
  /** initial / monogram shown on the label */
  label?: string;
  fillLevel?: number; // 0..1 of body
  size?: number;
  tilt?: number; // degrees, for pouring
  /** transform-origin for the tilt — defaults to the base; use the mouth ("50% 9%") to pour */
  pivot?: string;
  glow?: boolean;
  className?: string;
  title?: string;
}

export default function Bottle({
  family = "whisky",
  shape,
  label,
  fillLevel = 0.78,
  size = 110,
  tilt = 0,
  pivot = "50% 90%",
  glow = false,
  className,
  title,
}: BottleProps) {
  const uid = useId().replace(/:/g, "");
  const s = SHAPES[shape ?? SHAPE_BY_FAMILY[family]];
  const [hi, body, shadow] = liquidRamp[family] ?? liquidRamp.default;

  const cx = 60;
  const bodyBottom = 280;
  const bodyLeft = cx - s.bodyW / 2;
  const bodyRight = cx + s.bodyW / 2;
  const neckLeft = cx - s.neckW / 2;
  const neckRight = cx + s.neckW / 2;
  const neckTop = 44;
  const shoulderTop = s.bodyTop;
  const shoulderBottom = s.bodyTop + s.shoulderH;

  // body outline (with sloped shoulders into the neck)
  const outline = `
    M${bodyLeft},${bodyBottom - s.rx}
    L${bodyLeft},${shoulderBottom}
    C${bodyLeft},${shoulderTop} ${neckLeft - 4},${shoulderTop} ${neckLeft},${neckTop}
    L${neckLeft},36
    L${neckRight},36
    L${neckRight},${neckTop}
    C${neckRight + 4},${shoulderTop} ${bodyRight},${shoulderTop} ${bodyRight},${shoulderBottom}
    L${bodyRight},${bodyBottom - s.rx}
    Q${bodyRight},${bodyBottom} ${bodyRight - s.rx},${bodyBottom}
    L${bodyLeft + s.rx},${bodyBottom}
    Q${bodyLeft},${bodyBottom} ${bodyLeft},${bodyBottom - s.rx}
    Z`;

  const liquidTopY = shoulderBottom + (1 - Math.max(0, Math.min(1, fillLevel))) * (bodyBottom - shoulderBottom - 8);

  return (
    <svg
      width={size}
      height={size * (300 / 120)}
      viewBox="0 0 120 300"
      className={className}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, transformOrigin: pivot }}
      role="img"
      aria-label={title ?? `${family} bottle`}
    >
      <defs>
        <linearGradient id={`bglass-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0c0a07" />
          <stop offset="18%" stopColor={shadow} stopOpacity="0.55" />
          <stop offset="50%" stopColor={body} stopOpacity="0.30" />
          <stop offset="82%" stopColor={shadow} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0c0a07" />
        </linearGradient>
        <linearGradient id={`bliquid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} stopOpacity="0.95" />
          <stop offset="60%" stopColor={body} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <radialGradient id={`bglow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0B14B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D89C3A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`bbody-${uid}`}>
          <path d={outline} />
        </clipPath>
      </defs>

      {glow && <ellipse cx="60" cy="170" rx="58" ry="130" fill={`url(#bglow-${uid})`} />}

      {/* glass */}
      <path d={outline} fill={`url(#bglass-${uid})`} stroke="#E7D6B1" strokeOpacity="0.3" strokeWidth="1.2" />

      {/* liquid inside */}
      <g clipPath={`url(#bbody-${uid})`}>
        <rect x="0" y={liquidTopY} width="120" height={300 - liquidTopY} fill={`url(#bliquid-${uid})`} />
        <ellipse cx="60" cy={liquidTopY} rx={s.bodyW / 2 - 3} ry="3" fill={hi} opacity="0.7" />
      </g>

      {/* cork + cap */}
      <rect x={neckLeft - 2} y="20" width={s.neckW + 4} height="18" rx="3" fill="#5A3D26" stroke="#2a1c10" strokeWidth="1" />
      <rect x={neckLeft - 3} y="30" width={s.neckW + 6} height="8" rx="2" fill="#3a2616" />

      {/* paper label */}
      <g>
        <rect
          x={cx - s.bodyW / 2 + 8}
          y={shoulderBottom + 26}
          width={s.bodyW - 16}
          height="86"
          rx="6"
          fill="#E7D6B1"
          stroke="#9C7B45"
          strokeOpacity="0.6"
          strokeWidth="1"
          opacity="0.94"
        />
        <rect x={cx - s.bodyW / 2 + 12} y={shoulderBottom + 30} width={s.bodyW - 24} height="78" rx="4" fill="none" stroke="#9C7B45" strokeOpacity="0.4" strokeWidth="0.8" />
        <text x={cx} y={shoulderBottom + 78} textAnchor="middle" fontFamily="var(--font-cinzel), serif" fontSize="30" fontWeight="600" fill="#5A3D26">
          {(label ?? family[0] ?? "L").toUpperCase().slice(0, 2)}
        </text>
        <line x1={cx - s.bodyW / 2 + 16} y1={shoulderBottom + 92} x2={cx + s.bodyW / 2 - 16} y2={shoulderBottom + 92} stroke="#9C7B45" strokeOpacity="0.5" strokeWidth="0.8" />
      </g>

      {/* specular highlight */}
      <path
        d={`M${bodyLeft + 7},${shoulderBottom + 10} C${bodyLeft + 3},${(shoulderBottom + bodyBottom) / 2} ${bodyLeft + 5},${bodyBottom - 30} ${bodyLeft + 12},${bodyBottom - 16}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
