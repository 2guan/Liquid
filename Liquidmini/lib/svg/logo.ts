/**
 * The Sip & Sigh emblem — a brass medallion enclosing a drop & a bar line.
 * Ported from src/components/art/Logo.tsx; used in the loading veil.
 */
import { n, svgToDataUri } from "./helpers";

export function logoSvg(size = 64, color = "#C8A45D"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size)}" height="${n(size)}" viewBox="0 0 64 64" fill="none" role="img">
    <defs>
      <radialGradient id="lglow" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#F0B14B" stop-opacity="0.35"/><stop offset="100%" stop-color="#D89C3A" stop-opacity="0"/></radialGradient>
      <linearGradient id="lring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E3C684"/><stop offset="100%" stop-color="#A88945"/></linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#lglow)"/>
    <circle cx="32" cy="32" r="29" fill="none" stroke="url(#lring)" stroke-width="1.4"/>
    <circle cx="32" cy="32" r="25" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="0.8"/>
    <path d="M32 14c0 0 9 11 9 17a9 9 0 0 1-18 0c0-6 9-17 9-17z" fill="none" stroke="#E3C684" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M25 33a7 7 0 0 0 14 0c0-1.4-.4-2.9-1-4.4H26c-.6 1.5-1 3-1 4.4z" fill="#D89C3A" fill-opacity="0.55"/>
    <path d="M20 46h24" stroke="${color}" stroke-opacity="0.5" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24 49h16" stroke="${color}" stroke-opacity="0.3" stroke-width="1" stroke-linecap="round"/>
  </svg>`;
}

export function logoDataUri(size = 64, color = "#C8A45D"): string {
  return svgToDataUri(logoSvg(size, color));
}
