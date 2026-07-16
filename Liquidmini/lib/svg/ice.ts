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
  selector?: boolean;
  iceSeed?: number;
}

/** Inner SVG markup for the ice inside a glass (no wrapping <svg>). */
export function iceGroup(opts: IceGroupOpts): string {
  const { type, cx, cy } = opts;
  const r = opts.r ?? 26;
  const tint = opts.tint ?? "#e3edf2";
  const { waterY, fillTop, fillBottom, fillHW, liquidColor, selector = false, iceSeed = 0 } = opts;
  if (type === "none") return "";

  const uid = nextUid();
  const wl = waterY != null ? waterY - cy : null;
  const inWater = wl != null;

  if (type === "sphere") {
    const clip = `sclip-${uid}`;
    const chord = wl != null ? Math.sqrt(Math.max(0, r * r - wl * wl)) : 0;

    const renderSphere = (sub: boolean): string => `<g>
      <circle r="${n(r)}" fill="url(#isph-${sub ? "sub" : "dry"}-${uid})" opacity="${sub ? 0.78 : 0.78}" filter="url(#sphereSoft-${uid})"/>
      <g clip-path="url(#${clip})">
        <ellipse cx="${n(-r * 0.2)}" cy="${n(r * 0.36)}" rx="${n(r * 0.72)}" ry="${n(r * 0.52)}" fill="#ffffff" opacity="${sub ? 0.06 : 0.08}" filter="url(#glowSoft-${uid})"/>
        <ellipse cx="${n(r * 0.28)}" cy="${n(r * 0.28)}" rx="${n(r * 0.34)}" ry="${n(r * 0.16)}" fill="#ffffff" opacity="${sub ? 0.16 : 0.22}" filter="url(#glowSoft-${uid})" transform="rotate(-24 ${n(r * 0.28)} ${n(r * 0.28)})"/>
        <ellipse cx="${n(-r * 0.12)}" cy="${n(-r * 0.04)}" rx="${n(r * 0.36)}" ry="${n(r * 0.5)}" fill="#ffffff" opacity="${sub ? 0.04 : 0.06}" filter="url(#iceGlow-${uid})"/>
      </g>
      <ellipse cx="${n(-r * 0.32)}" cy="${n(-r * 0.4)}" rx="${n(r * 0.34)}" ry="${n(r * 0.2)}" fill="url(#sphHi-${sub ? "sub" : "dry"}-${uid})" transform="rotate(-30 ${n(-r * 0.32)} ${n(-r * 0.4)})" filter="url(#glowSoft-${uid})"/>
      <g filter="url(#iceGlow-${uid})">
        <circle cx="${n(r * 0.3)}" cy="${n(-r * 0.12)}" r="${n(Math.max(0.6, r * 0.034))}" fill="#ffffff" opacity="${sub ? 0.38 : 0.5}"/>
        <circle cx="${n(r * 0.44)}" cy="${n(r * 0.34)}" r="${n(Math.max(0.5, r * 0.026))}" fill="#ffffff" opacity="${sub ? 0.26 : 0.36}"/>
      </g>
    </g>`;

    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <clipPath id="${clip}"><circle r="${n(r)}"/></clipPath>
        ${wl != null ? `
        <clipPath id="dryClip-${uid}">
          <rect x="${n(-r - 5)}" y="${n(-r - 5)}" width="${n(r * 2 + 10)}" height="${n(wl + r + 5)}" />
        </clipPath>
        <clipPath id="subClip-${uid}">
          <rect x="${n(-r - 5)}" y="${n(wl)}" width="${n(r * 2 + 10)}" height="500" />
        </clipPath>
        ` : ""}
        <filter id="cubeSoft-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        <filter id="iceSoft-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id="iceGlow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="glowSoft-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <filter id="sphereSoft-${uid}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="${selector ? 0 : 0.8}" />
        </filter>
        <radialGradient id="isph-dry-${uid}" cx="36%" cy="28%" r="78%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.82" />
          <stop offset="20%" stop-color="#f6fbff" stop-opacity="0.48" />
          <stop offset="54%" stop-color="${tint}" stop-opacity="0.34" />
          <stop offset="80%" stop-color="#b8d1dc" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.52" />
        </radialGradient>
        <radialGradient id="isph-sub-${uid}" cx="36%" cy="28%" r="78%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.48" />
          <stop offset="20%" stop-color="#f6fbff" stop-opacity="0.32" />
          <stop offset="54%" stop-color="${tint}" stop-opacity="0.22" />
          <stop offset="80%" stop-color="#b8d1dc" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.38" />
        </radialGradient>
        <radialGradient id="sphHi-dry-${uid}" cx="36%" cy="34%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.86" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="sphHi-sub-${uid}" cx="36%" cy="34%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.62" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      ${wl == null ? renderSphere(false) : `
        <g clip-path="url(#dryClip-${uid})">${renderSphere(false)}</g>
        <g clip-path="url(#subClip-${uid})">${renderSphere(true)}</g>
        ${Math.abs(wl) < r * 0.98 ? `
        <g clip-path="url(#${clip})">
          <ellipse cx="0" cy="${n(wl)}" rx="${n(chord)}" ry="${n(Math.max(1.2, r * 0.09))}" fill="#ffffff" opacity="0.25" filter="url(#iceSoft-${uid})"/>
          <ellipse cx="${n(-chord * 0.18)}" cy="${n(wl - r * 0.02)}" rx="${n(chord * 0.62)}" ry="${n(Math.max(0.8, r * 0.035))}" fill="#ffffff" opacity="0.38"/>
        </g>
        ` : ""}
      `}
    </g>`;
  }

  if (type === "cube") {
    const s = r;
    const d = r * 0.36;
    const rad = r * 0.22;
    const clip = `cclip-${uid}`;
    const renderCube = (sub: boolean): string => `<g>
      <g filter="url(#cubeSoft-${uid})">
        <path d="M${n(-s + rad * 0.7)},${n(-s)} L${n(-s + d)},${n(-s - d)} L${n(s + d)},${n(-s - d)} L${n(s - rad * 0.45)},${n(-s)} Z" fill="url(#ictop-${sub ? "sub" : "dry"}-${uid})" opacity="${sub ? 0.48 : 0.78}"/>
        <path d="M${n(s)},${n(-s + rad * 0.55)} L${n(s + d)},${n(-s - d)} L${n(s + d)},${n(s - d)} L${n(s)},${n(s - rad * 0.55)} Z" fill="url(#icside-${sub ? "sub" : "dry"}-${uid})" opacity="${sub ? 0.42 : 0.72}"/>
        <rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}" fill="url(#icf-${sub ? "sub" : "dry"}-${uid})" opacity="${sub ? 0.44 : 0.72}"/>
      </g>
      <g clip-path="url(#${clip})">
        <ellipse cx="${n(-s * 0.26)}" cy="${n(-s * 0.15)}" rx="${n(s * 0.52)}" ry="${n(s * 0.7)}" fill="url(#ichi-${sub ? "sub" : "dry"}-${uid})" transform="rotate(-18 ${n(-s * 0.26)} ${n(-s * 0.15)})" filter="url(#glowSoft-${uid})"/>
        <ellipse cx="${n(s * 0.36)}" cy="${n(s * 0.44)}" rx="${n(s * 0.42)}" ry="${n(s * 0.16)}" fill="#ffffff" opacity="${sub ? 0.09 : 0.14}" filter="url(#iceGlow-${uid})" transform="rotate(-12 ${n(s * 0.36)} ${n(s * 0.44)})"/>
      </g>
      <path d="M${n(-s + rad * 0.5)},${n(-s + 0.5)} C${n(-s * 0.5)},${n(-s * 0.95)} ${n(s * 0.45)},${n(-s * 0.82)} ${n(s - rad * 0.4)},${n(-s + 1.4)} L${n(s - rad * 0.4)},${n(-s + rad * 0.23)} C${n(s * 0.34)},${n(-s * 0.7)} ${n(-s * 0.4)},${n(-s * 0.78)} ${n(-s + rad * 0.72)},${n(-s + rad * 0.22)} Z" fill="#ffffff" opacity="${sub ? 0.12 : 0.2}" filter="url(#iceGlow-${uid})"/>
      <ellipse cx="${n(-s * 0.6)}" cy="${n(s * 0.84)}" rx="${n(s * 0.14)}" ry="${n(s * 0.06)}" fill="#ffffff" opacity="${sub ? 0.11 : 0.2}" filter="url(#iceGlow-${uid})"/>
    </g>`;

    return `<g transform="translate(${n(cx)} ${n(cy)})">
      <defs>
        <clipPath id="${clip}"><rect x="${n(-s)}" y="${n(-s)}" width="${n(s * 2)}" height="${n(s * 2)}" rx="${n(rad)}"/></clipPath>
        ${wl != null ? `
        <clipPath id="dryClip-${uid}">
          <rect x="${n(-s - 10)}" y="${n(-s - d - 10)}" width="${n(s * 2 + d + 20)}" height="${n(wl + s + d + 10)}" />
        </clipPath>
        <clipPath id="subClip-${uid}">
          <rect x="${n(-s - 10)}" y="${n(wl)}" width="${n(s * 2 + d + 20)}" height="500" />
        </clipPath>
        ` : ""}
        <filter id="cubeSoft-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        <filter id="iceSoft-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id="iceGlow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="glowSoft-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <linearGradient id="icf-dry-${uid}" x1="0.12" y1="0" x2="0.82" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="#f7fcff" stop-opacity="0.72"/>
          <stop offset="72%" stop-color="${tint}" stop-opacity="0.56"/>
          <stop offset="100%" stop-color="#d7ecf4" stop-opacity="0.48"/>
        </linearGradient>
        <linearGradient id="icf-sub-${uid}" x1="0.12" y1="0" x2="0.82" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.52"/>
          <stop offset="35%" stop-color="#f7fcff" stop-opacity="0.38"/>
          <stop offset="72%" stop-color="${tint}" stop-opacity="0.26"/>
          <stop offset="100%" stop-color="#d7ecf4" stop-opacity="0.20"/>
        </linearGradient>
        <linearGradient id="ictop-dry-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#e8f7fc" stop-opacity="0.54"/>
        </linearGradient>
        <linearGradient id="ictop-sub-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.52"/>
          <stop offset="100%" stop-color="#e8f7fc" stop-opacity="0.28"/>
        </linearGradient>
        <linearGradient id="icside-dry-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5fbff" stop-opacity="0.62"/>
          <stop offset="100%" stop-color="#cde4ee" stop-opacity="0.42"/>
        </linearGradient>
        <linearGradient id="icside-sub-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5fbff" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#cde4ee" stop-opacity="0.20"/>
        </linearGradient>
        <radialGradient id="ichi-dry-${uid}" cx="36%" cy="28%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.78"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="ichi-sub-${uid}" cx="36%" cy="28%" r="64%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.48"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${wl == null ? renderCube(false) : `
        <g clip-path="url(#dryClip-${uid})">${renderCube(false)}</g>
        <g clip-path="url(#subClip-${uid})">${renderCube(true)}</g>
        ${Math.abs(wl) < s ? `
          <ellipse cx="0" cy="${n(wl)}" rx="${n(s * 0.94)}" ry="${n(Math.max(1.2, r * 0.07))}" fill="#ffffff" opacity="0.25" filter="url(#iceSoft-${uid})"/>
          <rect x="${n(-s)}" y="${n(wl)}" width="${n(s * 2)}" height="${n(Math.max(1.5, r * 0.1))}" fill="#ffffff" opacity="0.08"/>
        ` : ""}
      `}
    </g>`;
  }

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
    const pieces: string[] = [];
    const clipDefs: string[] = [];
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
        const pieceH = (isBullet ? 15 : 17) * scale;
        const isSubmerged = localWaterY != null && localWaterY < -pieceH;
        const isDry = localWaterY == null || localWaterY > pieceH;
        const isIntersecting = !isDry && !isSubmerged && localWaterY != null;

        if (isIntersecting && localWaterY != null) {
          clipDefs.push(
            `<clipPath id="dryClip-${uid}-${idx}">
              <rect x="-50" y="-100" width="100" height="${n(100 + localWaterY)}" />
            </clipPath>`,
            `<clipPath id="subClip-${uid}-${idx}">
              <rect x="-50" y="${n(localWaterY)}" width="100" height="${n(100 - localWaterY)}" />
            </clipPath>`
          );
        }

        const renderPiece = (sub: boolean): string => {
          if (isBullet) {
            return `<g transform="rotate(${n(rot)}) scale(${n(scale)})">
              <path d="M -13,-4 A 13,11 0 0 1 13,-4 L 13,11 A 13,3.5 0 0 1 -13,11 Z" fill="url(#bulletOuter-${sub ? "sub" : "dry"}-${uid})" filter="url(#cubeSoft-${uid})" />
              <path d="M -6,11 L -6,-3 A 6,6 0 0 1 6,-3 L 6,11 A 6,1.6 0 0 1 -6,11 Z" fill="url(#bulletCavity-${sub ? "sub" : "dry"}-${uid})" filter="url(#cubeSoft-${uid})" />
              <path d="M -9,-2 L -9,8" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="${sub ? 0.15 : 0.45}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -10,-6 A 10,8 0 0 1 -2,-13" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="${sub ? 0.18 : 0.55}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -13,11 A 13,3.5 0 0 0 13,11" stroke="#ffffff" stroke-width="1.2" opacity="${sub ? 0.12 : 0.35}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -6,11 A 6,1.6 0 0 0 6,11" stroke="#ffffff" stroke-width="0.8" opacity="${sub ? 0.1 : 0.25}" filter="url(#iceSoft-${uid})" fill="none" />
            </g>`;
          } else {
            return `<g transform="rotate(${n(rot)}) scale(${n(scale)})">
              <g filter="url(#cubeSoft-${uid})">
                <path d="${cubeRightPath}" fill="url(#cubeRight-${sub ? "sub" : "dry"}-${uid})" />
                <path d="${cubeLeftPath}" fill="url(#cubeLeft-${sub ? "sub" : "dry"}-${uid})" />
                <path d="${cubeTopPath}" fill="url(#cubeTop-${sub ? "sub" : "dry"}-${uid})" />
              </g>
              <ellipse cx="0" cy="-1.2" rx="2.4" ry="1.2" fill="#ffffff" opacity="${sub ? 0.08 : 0.22}" filter="url(#iceSoft-${uid})" />
              <path d="M 0,-1 L 0,13.4" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="${sub ? 0.18 : 0.42}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -0.8,-1.4 Q -5.2,-4.1 -10.4,-7.1" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="${sub ? 0.1 : 0.22}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M 0.8,-1.4 Q 5.2,-4.1 10.4,-7.1" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="${sub ? 0.1 : 0.22}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -12.2,-5.7 Q -12.5,-0.4 -12.1,4.6 M 12.2,-5.7 Q 12.5,-0.4 12.1,4.6" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" opacity="${sub ? 0.07 : 0.14}" filter="url(#iceSoft-${uid})" fill="none" />
              <path d="M -10.2,-7.3 Q -5.2,-10.4 -1.8,-13.1 M 1.8,-13.1 Q 5.2,-10.4 10.2,-7.3" stroke="#ffffff" stroke-width="0.95" stroke-linecap="round" opacity="${sub ? 0.1 : 0.26}" filter="url(#iceSoft-${uid})" fill="none" />
              <g filter="url(#iceGlow-${uid})" opacity="${sub ? 0.08 : 0.16}">
                <path d="${cubeCoreTopPath}" fill="#ffffff" />
                <path d="${cubeCoreLeftPath}" fill="#ffffff" />
                <path d="${cubeCoreRightPath}" fill="#ffffff" />
              </g>
            </g>`;
          }
        };

        const pieceContent: string[] = [];
        if (isDry) pieceContent.push(renderPiece(false));
        if (isSubmerged) pieceContent.push(renderPiece(true));
        if (isIntersecting) {
          pieceContent.push(
            `<g clip-path="url(#subClip-${uid}-${idx})">${renderPiece(true)}</g>`,
            `<g clip-path="url(#dryClip-${uid}-${idx})">${renderPiece(false)}</g>`,
            `<ellipse cx="0" cy="${n(localWaterY!)}" rx="${n((isBullet ? 12 : 16) * scale)}" ry="${n((isBullet ? 1.5 : 2) * scale)}" fill="#ffffff" opacity="0.25" filter="url(#iceSoft-${uid})" />`,
            `<ellipse cx="0" cy="${n(localWaterY!)}" rx="${n((isBullet ? 8 : 10) * scale)}" ry="${n((isBullet ? 0.6 : 0.8) * scale)}" fill="#ffffff" opacity="0.4" />`
          );
        }

        pieces.push(`<g transform="translate(${n(px)} ${n(py)})">${pieceContent.join("")}</g>`);
        idx++;
      }
    }
    if (pieces.length === 0) {
      const px = cx;
      const py = cy;
      const localWaterY = waterY != null ? waterY - py : null;
      const scale = isBullet ? piece / 26 : piece / 34;
      const pieceH = (isBullet ? 15 : 17) * scale;
      const isSubmerged = localWaterY != null && localWaterY < -pieceH;
      const isDry = localWaterY == null || localWaterY > pieceH;
      const isIntersecting = !isDry && !isSubmerged && localWaterY != null;

      if (isIntersecting && localWaterY != null) {
        clipDefs.push(
          `<clipPath id="dryClip-${uid}-fallback">
            <rect x="-50" y="-100" width="100" height="${n(100 + localWaterY)}" />
          </clipPath>`,
          `<clipPath id="subClip-${uid}-fallback">
            <rect x="-50" y="${n(localWaterY)}" width="100" height="${n(100 - localWaterY)}" />
          </clipPath>`
        );
      }

      const renderPiece = (sub: boolean): string => {
        if (isBullet) {
          return `<g transform="rotate(0) scale(${n(scale)})">
            <path d="M -13,-4 A 13,11 0 0 1 13,-4 L 13,11 A 13,3.5 0 0 1 -13,11 Z" fill="url(#bulletOuter-${sub ? "sub" : "dry"}-${uid})" filter="url(#cubeSoft-${uid})" />
            <path d="M -6,11 L -6,-3 A 6,6 0 0 1 6,-3 L 6,11 A 6,1.6 0 0 1 -6,11 Z" fill="url(#bulletCavity-${sub ? "sub" : "dry"}-${uid})" filter="url(#cubeSoft-${uid})" />
            <path d="M -9,-2 L -9,8" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="${sub ? 0.15 : 0.45}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -10,-6 A 10,8 0 0 1 -2,-13" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="${sub ? 0.18 : 0.55}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -13,11 A 13,3.5 0 0 0 13,11" stroke="#ffffff" stroke-width="1.2" opacity="${sub ? 0.12 : 0.35}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -6,11 A 6,1.6 0 0 0 6,11" stroke="#ffffff" stroke-width="0.8" opacity="${sub ? 0.1 : 0.25}" filter="url(#iceSoft-${uid})" fill="none" />
          </g>`;
        } else {
          return `<g transform="rotate(-5) scale(${n(scale)})">
            <g filter="url(#cubeSoft-${uid})">
              <path d="${cubeRightPath}" fill="url(#cubeRight-${sub ? "sub" : "dry"}-${uid})" />
              <path d="${cubeLeftPath}" fill="url(#cubeLeft-${sub ? "sub" : "dry"}-${uid})" />
              <path d="${cubeTopPath}" fill="url(#cubeTop-${sub ? "sub" : "dry"}-${uid})" />
            </g>
            <ellipse cx="0" cy="-1.2" rx="2.4" ry="1.2" fill="#ffffff" opacity="${sub ? 0.08 : 0.22}" filter="url(#iceSoft-${uid})" />
            <path d="M 0,-1 L 0,13.4" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="${sub ? 0.16 : 0.35}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -0.8,-1.4 Q -5.2,-4.1 -10.4,-7.1" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="${sub ? 0.08 : 0.18}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M 0.8,-1.4 Q 5.2,-4.1 10.4,-7.1" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="${sub ? 0.08 : 0.18}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -12.2,-5.7 Q -12.5,-0.4 -12.1,4.6 M 12.2,-5.7 Q 12.5,-0.4 12.1,4.6" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" opacity="${sub ? 0.06 : 0.12}" filter="url(#iceSoft-${uid})" fill="none" />
            <path d="M -10.2,-7.3 Q -5.2,-10.4 -1.8,-13.1 M 1.8,-13.1 Q 5.2,-10.4 10.2,-7.3" stroke="#ffffff" stroke-width="1.0" stroke-linecap="round" opacity="${sub ? 0.09 : 0.22}" filter="url(#iceSoft-${uid})" fill="none" />
            <g filter="url(#iceGlow-${uid})" opacity="${sub ? 0.08 : 0.16}">
              <path d="${cubeCoreTopPath}" fill="#ffffff" />
              <path d="${cubeCoreLeftPath}" fill="#ffffff" />
              <path d="${cubeCoreRightPath}" fill="#ffffff" />
            </g>
          </g>`;
        }
      };

      const fallbackContent: string[] = [];
      if (isDry) fallbackContent.push(renderPiece(false));
      if (isSubmerged) fallbackContent.push(renderPiece(true));
      if (isIntersecting) {
        fallbackContent.push(
          `<g clip-path="url(#subClip-${uid}-fallback)">${renderPiece(true)}</g>`,
          `<g clip-path="url(#dryClip-${uid}-fallback)">${renderPiece(false)}</g>`,
          `<ellipse cx="0" cy="${n(localWaterY!)}" rx="${n((isBullet ? 12 : 16) * scale)}" ry="${n((isBullet ? 1.5 : 2) * scale)}" fill="#ffffff" opacity="0.25" filter="url(#iceSoft-${uid})" />`,
          `<ellipse cx="0" cy="${n(localWaterY!)}" rx="${n((isBullet ? 8 : 10) * scale)}" ry="${n((isBullet ? 0.6 : 0.8) * scale)}" fill="#ffffff" opacity="0.4" />`
        );
      }

      pieces.push(`<g transform="translate(${n(px)} ${n(py)})">${fallbackContent.join("")}</g>`);
    }

    return `<g>
      <defs>
        ${clipDefs.join("")}
        <filter id="cubeSoft-${uid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id="iceSoft-${uid}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
        <filter id="iceGlow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        
        <linearGradient id="bulletOuter-dry-${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${cool1}" stop-opacity="0.78" />
          <stop offset="25%" stop-color="#ffffff" stop-opacity="0.96" />
          <stop offset="55%" stop-color="${cool2}" stop-opacity="0.65" />
          <stop offset="85%" stop-color="${cool3}" stop-opacity="0.58" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.76" />
        </linearGradient>
        <linearGradient id="bulletOuter-sub-${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${cool1}" stop-opacity="0.1" />
          <stop offset="25%" stop-color="#ffffff" stop-opacity="0.32" />
          <stop offset="55%" stop-color="${cool2}" stop-opacity="0.08" />
          <stop offset="85%" stop-color="${cool3}" stop-opacity="0.06" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.12" />
        </linearGradient>
        <linearGradient id="bulletCavity-dry-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${cavity1}" stop-opacity="0.7" />
          <stop offset="100%" stop-color="${cavity2}" stop-opacity="0.4" />
        </linearGradient>
        <linearGradient id="bulletCavity-sub-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${cool1}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
        </linearGradient>

        <linearGradient id="cubeTop-dry-${uid}" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92" />
          <stop offset="60%" stop-color="${cool2}" stop-opacity="0.78" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.65" />
        </linearGradient>
        <linearGradient id="cubeTop-sub-${uid}" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
          <stop offset="60%" stop-color="${cool2}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.08" />
        </linearGradient>

        <linearGradient id="cubeLeft-dry-${uid}" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.86" />
          <stop offset="50%" stop-color="${softWhite}" stop-opacity="0.68" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.52" />
        </linearGradient>
        <linearGradient id="cubeLeft-sub-${uid}" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="50%" stop-color="${softWhite}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${cool1}" stop-opacity="0.06" />
        </linearGradient>

        <linearGradient id="cubeRight-dry-${uid}" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="${softWhite}" stop-opacity="0.78" />
          <stop offset="50%" stop-color="${cool1}" stop-opacity="0.58" />
          <stop offset="100%" stop-color="${cool3}" stop-opacity="0.44" />
        </linearGradient>
        <linearGradient id="cubeRight-sub-${uid}" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="${softWhite}" stop-opacity="0.18" />
          <stop offset="50%" stop-color="${cool1}" stop-opacity="0.08" />
          <stop offset="100%" stop-color="${cool3}" stop-opacity="0.05" />
        </linearGradient>
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
    .map(([d, op], i) => `<g filter="url(#crushedSoft-${uid})"><path d="${d}" fill="url(#icr-${uid})" opacity="${n(0.52 + op * 0.1)}"/><ellipse cx="${i % 2 ? 8 : -8}" cy="${i < 3 ? -2 : 18}" rx="11" ry="5" fill="url(#crHi-${uid})" transform="rotate(${i % 2 ? -20 : 16})" filter="url(#crushedGlow-${uid})"/></g>`)
    .join("");
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(k)})">
    <defs>
      <filter id="crushedSoft-${uid}" x="-18%" y="-18%" width="136%" height="136%">
        <feGaussianBlur stdDeviation="0.72" />
      </filter>
      <filter id="crushedGlow-${uid}" x="-45%" y="-45%" width="190%" height="190%">
        <feGaussianBlur stdDeviation="1.8" />
      </filter>
      <linearGradient id="icr-${uid}" x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.64"/>
        <stop offset="58%" stop-color="#f4fbfc" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#e1eef1" stop-opacity="0.24"/>
      </linearGradient>
      <radialGradient id="crHi-${uid}" cx="35%" cy="32%" r="58%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
        <stop offset="56%" stop-color="#ffffff" stop-opacity="0.09"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="0" cy="16" rx="39" ry="26" fill="#effbff" opacity="0.07" filter="url(#crushedGlow-${uid})"/>
    ${shardMarkup}
    <ellipse cx="-4" cy="18" rx="28" ry="14" fill="#ffffff" opacity="0.055" filter="url(#crushedGlow-${uid})"/>
    <ellipse cx="-10" cy="30" rx="16" ry="4.2" fill="#ffffff" opacity="0.06" filter="url(#crushedGlow-${uid})"/>
    <ellipse cx="17" cy="26" rx="13" ry="3.6" fill="#ffffff" opacity="0.055" filter="url(#crushedGlow-${uid})"/>
  </g>`;
}

/** Standalone ice swatch for selectors (full <svg>). */
export function iceSwatch(type: IceType, size = 72, selector = false): string {
  if (type === "none") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 72 72"><circle cx="36" cy="36" r="22" fill="none" stroke="#C8A45D" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="3 5"/><path d="M24,48 L48,24" stroke="#C8A45D" stroke-opacity="0.5" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  const r = type === "sphere" ? 24 : type === "cube" ? 21 : 30;
  const inner = iceGroup({ type, cx: 36, cy: type === "cube" ? 40 : 38, r, fillTop: 16, fillBottom: 60, fillHW: 24, selector });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 72 72">${inner}</svg>`;
}
