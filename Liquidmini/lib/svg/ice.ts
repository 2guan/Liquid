/**
 * Ice rendered as clear, cold volume rather than drink-coloured blocks.
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
  /** absolute y of the liquid surface — enables the waterline / wet film */
  waterY?: number;
  /** kept for the caller contract; ice no longer uses drink colour as tint */
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
  const { waterY, fillTop, fillBottom, fillHW } = opts;
  if (type === "none") return "";

  const uid = nextUid();
  const wl = waterY != null ? waterY - cy : null;
  const inWater = wl != null;

  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;
    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <radialGradient id="isph-${uid}" cx="36%" cy="28%" r="78%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.82"/>
          <stop offset="20%" stop-color="#f6fbff" stop-opacity="0.48"/>
          <stop offset="54%" stop-color="${tint}" stop-opacity="0.34"/>
          <stop offset="80%" stop-color="#b8d1dc" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.52"/>
        </radialGradient>
        <radialGradient id="sphHi-${uid}" cx="36%" cy="34%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.86"/>
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="wet-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#dff5ff" stop-opacity="0.05"/>
        </linearGradient>
        <clipPath id="${clip}"><circle r="${n(r)}"/></clipPath>
        <filter id="iceSoft-${uid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.9"/></filter>
      </defs>
      <circle r="${n(r)}" fill="url(#isph-${uid})" opacity="0.78"/>
      <g clip-path="url(#${clip})">
        ${inWater ? `<rect x="${n(-r)}" y="${n(wl!)}" width="${n(r * 2)}" height="${n(r * 2)}" fill="url(#wet-${uid})"/>` : ""}
        <ellipse cx="${n(-r * 0.2)}" cy="${n(r * 0.36)}" rx="${n(r * 0.72)}" ry="${n(r * 0.52)}" fill="#ffffff" opacity="0.08" filter="url(#iceSoft-${uid})"/>
        <ellipse cx="${n(r * 0.28)}" cy="${n(r * 0.28)}" rx="${n(r * 0.34)}" ry="${n(r * 0.16)}" fill="#ffffff" opacity="0.22" filter="url(#iceSoft-${uid})" transform="rotate(-24 ${n(r * 0.28)} ${n(r * 0.28)})"/>
        <ellipse cx="${n(-r * 0.12)}" cy="${n(-r * 0.04)}" rx="${n(r * 0.36)}" ry="${n(r * 0.5)}" fill="#ffffff" opacity="0.06"/>
      </g>
      <ellipse cx="${n(-r * 0.32)}" cy="${n(-r * 0.4)}" rx="${n(r * 0.34)}" ry="${n(r * 0.2)}" fill="url(#sphHi-${uid})" transform="rotate(-30 ${n(-r * 0.32)} ${n(-r * 0.4)})"/>
      ${wl != null && Math.abs(wl) < r * 0.98 ? `<g clip-path="url(#${clip})">
        <ellipse cx="0" cy="${n(wl)}" rx="${n(chord)}" ry="${n(Math.max(1.2, r * 0.09))}" fill="#ffffff" opacity="0.22" filter="url(#iceSoft-${uid})"/>
        <ellipse cx="${n(-chord * 0.18)}" cy="${n(wl - r * 0.02)}" rx="${n(chord * 0.62)}" ry="${n(Math.max(0.8, r * 0.035))}" fill="#ffffff" opacity="0.34"/>
      </g>` : ""}
      <circle cx="${n(r * 0.3)}" cy="${n(-r * 0.12)}" r="${n(Math.max(0.6, r * 0.034))}" fill="#ffffff" opacity="0.5"/>
      <circle cx="${n(r * 0.44)}" cy="${n(r * 0.34)}" r="${n(Math.max(0.5, r * 0.026))}" fill="#ffffff" opacity="0.36"/>
    </g>`;
  }

  if (type === "cube") {
    const s = r;
    const d = r * 0.36;
    const rad = r * 0.22;
    const clip = `cclip-${uid}`;
    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <linearGradient id="icf-${uid}" x1="0.12" y1="0" x2="0.82" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="#f7fcff" stop-opacity="0.72"/>
          <stop offset="72%" stop-color="${tint}" stop-opacity="0.56"/>
          <stop offset="100%" stop-color="#d7ecf4" stop-opacity="0.48"/>
        </linearGradient>
        <linearGradient id="ictop-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#e8f7fc" stop-opacity="0.54"/>
        </linearGradient>
        <linearGradient id="icside-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5fbff" stop-opacity="0.62"/>
          <stop offset="100%" stop-color="#cde4ee" stop-opacity="0.42"/>
        </linearGradient>
        <radialGradient id="ichi-${uid}" cx="36%" cy="28%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.78"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="${clip}"><rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}"/></clipPath>
        <filter id="iceSoft-${uid}" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="0.85"/></filter>
      </defs>
      <path d="M${n(-s + rad * 0.7)},${n(-s)} L${n(-s + d)},${n(-s - d)} L${n(s + d)},${n(-s - d)} L${n(s - rad * 0.45)},${n(-s)} Z" fill="url(#ictop-${uid})" opacity="0.78"/>
      <path d="M${n(s)},${n(-s + rad * 0.55)} L${n(s + d)},${n(-s - d)} L${n(s + d)},${n(s - d)} L${n(s)},${n(s - rad * 0.55)} Z" fill="url(#icside-${uid})" opacity="0.72"/>
      <rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}" fill="url(#icf-${uid})" opacity="0.72"/>
      <g clip-path="url(#${clip})">
        ${inWater ? `<rect x="${n(-s)}" y="${n(wl!)}" width="${n(s * 2)}" height="${n(s * 2)}" fill="#effbff" opacity="0.08"/>` : ""}
        <ellipse cx="${n(-s * 0.26)}" cy="${n(-s * 0.22)}" rx="${n(s * 0.52)}" ry="${n(s * 0.9)}" fill="url(#ichi-${uid})" transform="rotate(-18 ${n(-s * 0.26)} ${n(-s * 0.22)})"/>
        <ellipse cx="${n(s * 0.36)}" cy="${n(s * 0.44)}" rx="${n(s * 0.42)}" ry="${n(s * 0.16)}" fill="#ffffff" opacity="0.14" filter="url(#iceSoft-${uid})" transform="rotate(-12 ${n(s * 0.36)} ${n(s * 0.44)})"/>
        ${wl != null && Math.abs(wl) < s ? `<ellipse cx="0" cy="${n(wl)}" rx="${n(s * 0.94)}" ry="${n(Math.max(1.2, r * 0.07))}" fill="#ffffff" opacity="0.24" filter="url(#iceSoft-${uid})"/><rect x="${n(-s)}" y="${n(wl)}" width="${n(s * 2)}" height="${n(Math.max(1.5, r * 0.1))}" fill="#ffffff" opacity="0.06"/>` : ""}
      </g>
      <path d="M${n(-s + rad * 0.5)},${n(-s + 0.5)} C${n(-s * 0.5)},${n(-s * 0.95)} ${n(s * 0.45)},${n(-s * 0.82)} ${n(s - rad * 0.4)},${n(-s + 1.4)} L${n(s - rad * 0.4)},${n(-s + rad * 0.23)} C${n(s * 0.34)},${n(-s * 0.7)} ${n(-s * 0.4)},${n(-s * 0.78)} ${n(-s + rad * 0.72)},${n(-s + rad * 0.22)} Z" fill="#ffffff" opacity="0.2"/>
      <ellipse cx="${n(-s * 0.6)}" cy="${n(s * 0.84)}" rx="${n(s * 0.14)}" ry="${n(s * 0.06)}" fill="#ffffff" opacity="0.2"/>
    </g>`;
  }

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
        const sub = waterY != null && py > waterY + piece * 0.12;
        const half = piece * 0.5;
        const body = isBullet
          ? `<rect x="${n(-half)}" y="${n(-half * 0.6)}" width="${n(piece)}" height="${n(piece * 0.6)}" rx="${n(piece * 0.3)}" fill="url(#piece-${uid})"/><ellipse cx="${n(-half * 0.28)}" cy="${n(-half * 0.34)}" rx="${n(piece * 0.26)}" ry="${n(piece * 0.08)}" fill="url(#pieceHi-${uid})"/><ellipse cx="${n(half * 0.2)}" cy="${n(half * 0.16)}" rx="${n(piece * 0.32)}" ry="${n(piece * 0.07)}" fill="#ffffff" opacity="0.1"/>`
          : `<rect x="${n(-half)}" y="${n(-half)}" width="${n(piece)}" height="${n(piece)}" rx="${n(piece * 0.26)}" fill="url(#piece-${uid})"/><ellipse cx="${n(-half * 0.24)}" cy="${n(-half * 0.28)}" rx="${n(piece * 0.32)}" ry="${n(piece * 0.16)}" fill="url(#pieceHi-${uid})" transform="rotate(-18 ${n(-half * 0.24)} ${n(-half * 0.28)})"/><ellipse cx="${n(half * 0.22)}" cy="${n(half * 0.24)}" rx="${n(piece * 0.32)}" ry="${n(piece * 0.1)}" fill="#ffffff" opacity="0.1"/>`;
        const water = waterY != null && Math.abs(py - waterY) < piece * 0.55
          ? `<ellipse cx="0" cy="${n(waterY - py)}" rx="${n(piece * 0.46)}" ry="${n(piece * 0.05)}" fill="#ffffff" opacity="0.2"/>`
          : "";
        pieces.push(`<g transform="translate(${n(px)} ${n(py)}) rotate(${n(rot)})" opacity="${sub ? "0.58" : "0.68"}">${body}${water}</g>`);
        idx++;
      }
    }
    return `<g>
      <defs>
        <linearGradient id="piece-${uid}" x1="0.18" y1="0" x2="0.92" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
          <stop offset="45%" stop-color="#f1fbff" stop-opacity="0.52"/>
          <stop offset="100%" stop-color="#d1e8f1" stop-opacity="0.36"/>
        </linearGradient>
        <radialGradient id="pieceHi-${uid}" cx="38%" cy="35%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.74"/>
          <stop offset="72%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${pieces.join("")}
    </g>`;
  }

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
  const shardMarkup = shards
    .map(([d, op], i) => `<g><path d="${d}" fill="url(#icr-${uid})" opacity="${n(0.76 + op * 0.2)}"/><ellipse cx="${i % 2 ? 8 : -8}" cy="${i < 3 ? -2 : 18}" rx="8" ry="3.2" fill="url(#crHi-${uid})" transform="rotate(${i % 2 ? -20 : 16})"/></g>`)
    .join("");
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(k)})">
    <defs>
      <linearGradient id="icr-${uid}" x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88"/>
        <stop offset="54%" stop-color="#f0fbff" stop-opacity="0.62"/>
        <stop offset="100%" stop-color="#d1e8f1" stop-opacity="0.48"/>
      </linearGradient>
      <radialGradient id="crHi-${uid}" cx="35%" cy="32%" r="58%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="0" cy="16" rx="38" ry="25" fill="#effbff" opacity="0.11"/>
    ${shardMarkup}
    <ellipse cx="-10" cy="30" rx="15" ry="3.5" fill="#ffffff" opacity="0.14"/>
    <ellipse cx="17" cy="26" rx="12" ry="3" fill="#ffffff" opacity="0.12"/>
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
