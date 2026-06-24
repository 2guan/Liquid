/**
 * The Bottle — a parametric spirit-bottle silhouette with label + liquid.
 * Ported from src/components/art/Bottle.tsx (JSX → SVG string).
 */
import type { SpiritFamily } from "../tokens";
import { liquidRamp } from "../tokens";
import { n, nextUid, svgToDataUri } from "./helpers";

export type BottleShape = "standard" | "tall" | "squat" | "flask";

const SHAPE_BY_FAMILY: Record<string, BottleShape> = {
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
const SHAPES: Record<BottleShape, { bodyTop: number; bodyW: number; neckW: number; shoulderH: number; rx: number }> = {
  standard: { bodyTop: 108, bodyW: 66, neckW: 20, shoulderH: 34, rx: 12 },
  tall: { bodyTop: 124, bodyW: 54, neckW: 17, shoulderH: 30, rx: 10 },
  squat: { bodyTop: 134, bodyW: 78, neckW: 22, shoulderH: 24, rx: 16 },
  flask: { bodyTop: 120, bodyW: 84, neckW: 19, shoulderH: 40, rx: 30 },
};

export interface BottleOpts {
  family?: SpiritFamily;
  shape?: BottleShape;
  /** initial / monogram shown on the label */
  label?: string;
  fillLevel?: number; // 0..1 of body
  size?: number;
  tilt?: number; // degrees, for pouring
  glow?: boolean;
  title?: string;
}

export function bottleSvg(opts: BottleOpts): string {
  const {
    family = "whisky",
    shape,
    label,
    fillLevel = 0.78,
    size = 110,
    tilt = 0,
    glow = false,
    title,
  } = opts;

  const uid = nextUid();
  const s = SHAPES[shape ?? SHAPE_BY_FAMILY[family] ?? "standard"];
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

  const outline = `M${n(bodyLeft)},${n(bodyBottom - s.rx)} L${n(bodyLeft)},${n(shoulderBottom)} C${n(bodyLeft)},${n(shoulderTop)} ${n(neckLeft - 4)},${n(shoulderTop)} ${n(neckLeft)},${n(neckTop)} L${n(neckLeft)},36 L${n(neckRight)},36 L${n(neckRight)},${n(neckTop)} C${n(neckRight + 4)},${n(shoulderTop)} ${n(bodyRight)},${n(shoulderTop)} ${n(bodyRight)},${n(shoulderBottom)} L${n(bodyRight)},${n(bodyBottom - s.rx)} Q${n(bodyRight)},${n(bodyBottom)} ${n(bodyRight - s.rx)},${n(bodyBottom)} L${n(bodyLeft + s.rx)},${n(bodyBottom)} Q${n(bodyLeft)},${n(bodyBottom)} ${n(bodyLeft)},${n(bodyBottom - s.rx)} Z`;

  const liquidTopY = shoulderBottom + (1 - Math.max(0, Math.min(1, fillLevel))) * (bodyBottom - shoulderBottom - 8);
  const mono = (label ?? family[0] ?? "L").toUpperCase().slice(0, 2);
  // `tilt` is intentionally NOT baked into the SVG — an internal rotation gets
  // clipped by the viewBox. The pour tilt is applied with a CSS transform on the
  // container instead (see pure-pour-screen .pour-bottle), matching the web build.
  void tilt;
  const transform = "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size)}" height="${n(size * (300 / 120))}" viewBox="0 0 120 300" role="img" aria-label="${(title ?? `${family} bottle`).replace(/"/g, "")}">
    <defs>
      <linearGradient id="bglass-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0c0a07"/>
        <stop offset="18%" stop-color="${shadow}" stop-opacity="0.55"/>
        <stop offset="50%" stop-color="${body}" stop-opacity="0.30"/>
        <stop offset="82%" stop-color="${shadow}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#0c0a07"/>
      </linearGradient>
      <linearGradient id="bliquid-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${hi}" stop-opacity="0.95"/>
        <stop offset="60%" stop-color="${body}"/>
        <stop offset="100%" stop-color="${shadow}"/>
      </linearGradient>
      <radialGradient id="bglow-${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#F0B14B" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#D89C3A" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="bbody-${uid}"><path d="${outline}"/></clipPath>
    </defs>
    <g${transform}>
    ${glow ? `<ellipse cx="60" cy="180" rx="80" ry="120" fill="url(#bglow-${uid})"/>` : ""}
    <path d="${outline}" fill="url(#bglass-${uid})" stroke="#E7D6B1" stroke-opacity="0.3" stroke-width="1.2"/>
    <g clip-path="url(#bbody-${uid})">
      <rect x="0" y="${n(liquidTopY)}" width="120" height="${n(300 - liquidTopY)}" fill="url(#bliquid-${uid})"/>
      <ellipse cx="60" cy="${n(liquidTopY)}" rx="${n(s.bodyW / 2 - 3)}" ry="3" fill="${hi}" opacity="0.7"/>
    </g>
    <rect x="${n(neckLeft - 2)}" y="20" width="${n(s.neckW + 4)}" height="18" rx="3" fill="#5A3D26" stroke="#2a1c10" stroke-width="1"/>
    <rect x="${n(neckLeft - 3)}" y="30" width="${n(s.neckW + 6)}" height="8" rx="2" fill="#3a2616"/>
    <g>
      <rect x="${n(cx - s.bodyW / 2 + 8)}" y="${n(shoulderBottom + 26)}" width="${n(s.bodyW - 16)}" height="86" rx="6" fill="#E7D6B1" stroke="#9C7B45" stroke-opacity="0.6" stroke-width="1" opacity="0.94"/>
      <rect x="${n(cx - s.bodyW / 2 + 12)}" y="${n(shoulderBottom + 30)}" width="${n(s.bodyW - 24)}" height="78" rx="4" fill="none" stroke="#9C7B45" stroke-opacity="0.4" stroke-width="0.8"/>
      <text x="${n(cx)}" y="${n(shoulderBottom + 78)}" text-anchor="middle" font-family="Cinzel, serif" font-size="30" font-weight="600" fill="#5A3D26">${mono}</text>
      <line x1="${n(cx - s.bodyW / 2 + 16)}" y1="${n(shoulderBottom + 92)}" x2="${n(cx + s.bodyW / 2 - 16)}" y2="${n(shoulderBottom + 92)}" stroke="#9C7B45" stroke-opacity="0.5" stroke-width="0.8"/>
    </g>
    <path d="M${n(bodyLeft + 7)},${n(shoulderBottom + 10)} C${n(bodyLeft + 3)},${n((shoulderBottom + bodyBottom) / 2)} ${n(bodyLeft + 5)},${n(bodyBottom - 30)} ${n(bodyLeft + 12)},${n(bodyBottom - 16)}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export function bottleDataUri(opts: BottleOpts): string {
  return svgToDataUri(bottleSvg(opts));
}
