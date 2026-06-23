/**
 * Illustrative emblems for the four mode cards — a dram, a coupe + jigger, a
 * vintage microphone and a botanical flask. Etched brass line-art. Ported from
 * src/components/art/ModeEmblem.tsx; `currentColor` is baked to an explicit
 * stroke colour since <image> can't inherit CSS colour.
 */
import type { ModeId } from "../types";
import { n, svgToDataUri } from "./helpers";

export function emblemSvg(mode: ModeId, size = 64, color = "#C8A45D"): string {
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size)}" height="${n(size)}" viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">`;
  let body: string;
  if (mode === "pure") {
    body = `<path d="M22 16c-2 4-4 8-4 13 0 7 5 12 14 12s14-5 14-12c0-5-2-9-4-13"/><ellipse cx="32" cy="16" rx="10" ry="2.6"/><path d="M22 48l-1 5c0 1.5 5 2.5 11 2.5S43 54.5 43 53l-1-5"/><ellipse cx="22" cy="56" rx="12" ry="2.4" opacity="0.5"/><path d="M22 33c0 5 4 8 9 8" opacity="0.5"/><circle cx="32" cy="33" r="6.5"/><path d="M28.5 30.5a4 4 0 0 1 5 1" opacity="0.7"/>`;
  } else if (mode === "mixology") {
    body = `<path d="M14 16h26L27 33z"/><path d="M27 33v17M19 50h16"/><ellipse cx="27" cy="16" rx="13" ry="2.6"/><path d="M40 14c4-3 8-2 9 2-3 5-8 5-10 2"/><circle cx="47" cy="13" r="1.4" fill="${color}"/><path d="M44 44l6-3M48 41v6" opacity="0.6"/><path d="M44 47l8 4-2 5-8-4z" opacity="0.7"/>`;
  } else if (mode === "mood") {
    body = `<rect x="24" y="10" width="16" height="26" rx="8"/><path d="M27 16h10M27 21h10M27 26h10" opacity="0.6"/><path d="M19 28a13 13 0 0 0 26 0"/><path d="M32 41v8M25 53h14"/><path d="M12 18c-2 3-2 7 0 10M52 18c2 3 2 7 0 10" opacity="0.5"/>`;
  } else {
    body = `<path d="M27 12h10M28 12v9l-9 22c-1 3 1 6 4 6h18c3 0 5-3 4-6l-9-22v-9"/><path d="M22 38h20" opacity="0.6"/><path d="M32 30c-3-3-3-7-1-10 3 2 4 6 1 10z"/><path d="M32 30c3-2 6-2 9 0-2 3-6 3-9 0z" opacity="0.7"/><circle cx="29" cy="44" r="1.4" fill="${color}" opacity="0.7"/><circle cx="35" cy="40" r="1.1" fill="${color}" opacity="0.6"/>`;
  }
  return `${head}${body}</svg>`;
}

export function emblemDataUri(mode: ModeId, size = 64, color = "#C8A45D"): string {
  return svgToDataUri(emblemSvg(mode, size, color));
}
