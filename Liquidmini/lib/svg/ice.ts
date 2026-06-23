/**
 * Ice rendered as translucent refractive glass with a real waterline.
 * Ported from src/components/art/Ice.tsx (JSX → SVG string).
 */
import type { IceType } from "../types";
import { n, nextUid } from "./helpers";

export interface IceGroupOpts {
  type: IceType;
  cx: number;
  cy: number;
  r?: number;
  tint?: string;
  /** absolute y of the liquid surface — enables the waterline + submerged tint */
  waterY?: number;
  /** colour of the surrounding drink, used to tint the submerged portion */
  liquidColor?: string;
  /** fill region (absolute svg coords) for the multi-piece "cubes"/"bullets" ice */
  fillTop?: number;
  fillBottom?: number;
  fillHW?: number;
}

/** Inner SVG markup for the ice inside a glass (no wrapping <svg>). */
export function iceGroup(opts: IceGroupOpts): string {
  const { type, cx, cy } = opts;
  const r = opts.r ?? 26;
  const tint = opts.tint ?? "#e3edf2";
  const { waterY, liquidColor, fillTop, fillBottom, fillHW } = opts;
  if (type === "none") return "";

  const uid = nextUid();
  // waterline in the group's local coordinates (null → no surface to honour)
  const wl = waterY != null ? waterY - cy : null;
  const submerged = wl != null && !!liquidColor;

  /* ── Big clear sphere (the whisky "rock") ── */
  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;
    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <radialGradient id="isph-${uid}" cx="37%" cy="30%" r="74%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
          <stop offset="20%" stop-color="#eef7fb" stop-opacity="0.26"/>
          <stop offset="58%" stop-color="${tint}" stop-opacity="0.1"/>
          <stop offset="86%" stop-color="${tint}" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="${tint}" stop-opacity="0.36"/>
        </radialGradient>
        <clipPath id="${clip}"><circle r="${n(r)}"/></clipPath>
      </defs>
      <circle r="${n(r)}" fill="url(#isph-${uid})" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.8"/>
      <g clip-path="url(#${clip})">
        ${submerged ? `<rect x="${n(-r)}" y="${n(wl!)}" width="${n(r * 2)}" height="${n(r * 2)}" fill="${liquidColor}" opacity="0.4"/>` : ""}
        <ellipse cx="${n(-r * 0.22)}" cy="${n(r * 0.4)}" rx="${n(r * 0.78)}" ry="${n(r * 0.58)}" fill="${tint}" opacity="0.14"/>
        <path d="M${n(r * 0.34)},${n(r * 0.58)} A ${n(r * 0.62)} ${n(r * 0.62)} 0 0 0 ${n(r * 0.66)},${n(r * 0.12)}" fill="none" stroke="#ffffff" stroke-opacity="0.38" stroke-width="${n(Math.max(0.8, r * 0.05))}" stroke-linecap="round"/>
        <ellipse cx="${n(-r * 0.18)}" cy="${n(-r * 0.04)}" rx="${n(r * 0.4)}" ry="${n(r * 0.5)}" fill="#ffffff" opacity="0.05"/>
      </g>
      <ellipse cx="${n(-r * 0.34)}" cy="${n(-r * 0.4)}" rx="${n(r * 0.3)}" ry="${n(r * 0.18)}" fill="#ffffff" opacity="0.9" transform="rotate(-30 ${n(-r * 0.34)} ${n(-r * 0.4)})"/>
      <circle cx="${n(-r * 0.1)}" cy="${n(-r * 0.18)}" r="${n(Math.max(0.8, r * 0.06))}" fill="#ffffff" opacity="0.7"/>
      ${wl != null && Math.abs(wl) < r * 0.98 ? `<g clip-path="url(#${clip})">
        <ellipse cx="0" cy="${n(wl)}" rx="${n(chord)}" ry="${n(Math.max(1, r * 0.08))}" fill="#ffffff" opacity="0.1"/>
        <ellipse cx="0" cy="${n(wl)}" rx="${n(chord)}" ry="${n(Math.max(1, r * 0.08))}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="0.9"/>
      </g>` : ""}
      <circle cx="${n(r * 0.3)}" cy="${n(-r * 0.12)}" r="${n(Math.max(0.6, r * 0.035))}" fill="#ffffff" opacity="0.5"/>
      <circle cx="${n(r * 0.44)}" cy="${n(r * 0.34)}" r="${n(Math.max(0.5, r * 0.026))}" fill="#ffffff" opacity="0.38"/>
    </g>`;
  }

  /* ── Big clear cube (rounded by the melt) ── */
  if (type === "cube") {
    const s = r; // half-edge of the front face
    const d = r * 0.36; // isometric depth
    const rad = r * 0.16; // melt-rounded corners
    const clip = `cclip-${uid}`;
    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <linearGradient id="icf-${uid}" x1="0.15" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42"/>
          <stop offset="46%" stop-color="${tint}" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="${tint}" stop-opacity="0.22"/>
        </linearGradient>
        <clipPath id="${clip}"><rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}"/></clipPath>
      </defs>
      <path d="M${n(-s + rad * 0.5)},${n(-s)} L${n(-s + d)},${n(-s - d)} L${n(s + d)},${n(-s - d)} L${n(s - rad * 0.5)},${n(-s)} Z" fill="${tint}" fill-opacity="0.4" stroke="#ffffff" stroke-opacity="0.28" stroke-width="0.7" stroke-linejoin="round"/>
      <path d="M${n(s)},${n(-s + rad * 0.5)} L${n(s + d)},${n(-s - d)} L${n(s + d)},${n(s - d)} L${n(s)},${n(s - rad * 0.5)} Z" fill="${tint}" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.16" stroke-width="0.7" stroke-linejoin="round"/>
      <rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}" fill="url(#icf-${uid})" stroke="#ffffff" stroke-opacity="0.32" stroke-width="0.8"/>
      <g clip-path="url(#${clip})">
        ${submerged ? `<rect x="${n(-s)}" y="${n(wl!)}" width="${n(s * 2)}" height="${n(s * 2)}" fill="${liquidColor}" opacity="0.38"/>` : ""}
        <ellipse cx="${n(-s * 0.26)}" cy="${n(-s * 0.18)}" rx="${n(s * 0.46)}" ry="${n(s * 0.82)}" fill="#ffffff" opacity="0.06" transform="rotate(-18 ${n(-s * 0.26)} ${n(-s * 0.18)})"/>
        ${wl != null && Math.abs(wl) < s ? `<line x1="${n(-s)}" y1="${n(wl)}" x2="${n(s)}" y2="${n(wl)}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="0.9"/><rect x="${n(-s)}" y="${n(wl)}" width="${n(s * 2)}" height="${n(Math.max(1.2, r * 0.08))}" fill="#ffffff" opacity="0.08"/>` : ""}
      </g>
      <path d="M${n(-s + rad)},${n(-s)} A${n(rad)} ${n(rad)} 0 0 0 ${n(-s)},${n(-s + rad)} L${n(-s)},${n(s - rad)}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M${n(-s + rad)},${n(-s + 1)} L${n(s - rad)},${n(-s + 1.5)}" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1" stroke-linecap="round"/>
    </g>`;
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
    const pieces: string[] = [];
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
        const body = isBullet
          ? `<rect x="${n(-half)}" y="${n(-half * 0.6)}" width="${n(piece)}" height="${n(piece * 0.6)}" rx="${n(piece * 0.3)}" fill="${tint}" fill-opacity="0.5" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.6"/>${sub && liquidColor ? `<rect x="${n(-half)}" y="${n(-half * 0.6)}" width="${n(piece)}" height="${n(piece * 0.6)}" rx="${n(piece * 0.3)}" fill="${liquidColor}" opacity="0.28"/>` : ""}`
          : `<rect x="${n(-half)}" y="${n(-half)}" width="${n(piece)}" height="${n(piece)}" rx="${n(piece * 0.22)}" fill="${tint}" fill-opacity="0.46" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.6"/>${sub && liquidColor ? `<rect x="${n(-half)}" y="${n(-half)}" width="${n(piece)}" height="${n(piece)}" rx="${n(piece * 0.22)}" fill="${liquidColor}" opacity="0.28"/>` : ""}`;
        pieces.push(`<g transform="translate(${n(px)} ${n(py)}) rotate(${n(rot)})">${body}<line x1="${n(-half * 0.66)}" y1="${n(-half * (isBullet ? 0.4 : 0.66))}" x2="${n(half * 0.5)}" y2="${n(-half * (isBullet ? 0.4 : 0.66))}" stroke="#ffffff" stroke-opacity="0.42" stroke-width="0.7" stroke-linecap="round"/></g>`);
        idx++;
      }
    }
    return `<g><rect x="${n(cx - hw)}" y="${n(top - piece * 0.2)}" width="${n(hw * 2)}" height="${n(bot - top + piece * 0.4)}" fill="${tint}" opacity="0.06"/>${pieces.join("")}</g>`;
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
  const shardMarkup = shards
    .map(([d, op]) => {
      const head = d.split(" ").slice(0, 2).join(" ");
      return `<g><path d="${d}" fill="url(#icr-${uid})" stroke="#ffffff" stroke-opacity="0.32" stroke-width="0.7"/><path d="${head}" stroke="#ffffff" stroke-opacity="${n(op * 0.5)}" stroke-width="0.8" stroke-linecap="round"/></g>`;
    })
    .join("");
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(k)})">
    <defs>
      <linearGradient id="icr-${uid}" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <ellipse cx="0" cy="14" rx="36" ry="26" fill="${tint}" opacity="0.12"/>
    ${shardMarkup}
  </g>`;
}

/** Standalone ice swatch for selectors (full <svg>). */
export function iceSwatch(type: IceType, size = 72): string {
  if (type === "none") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 72 72"><circle cx="36" cy="36" r="22" fill="none" stroke="#C8A45D" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="3 5"/><path d="M24,48 L48,24" stroke="#C8A45D" stroke-opacity="0.5" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  const r = type === "sphere" ? 24 : type === "cube" ? 21 : 30;
  const inner = iceGroup({ type, cx: 36, cy: type === "cube" ? 40 : 38, r, fillTop: 16, fillBottom: 60, fillHW: 24 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 72 72">${inner}</svg>`;
}
