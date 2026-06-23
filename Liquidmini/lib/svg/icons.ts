/**
 * Line-art icon set in the engraved-gold style. 24×24, baked stroke colour.
 * Ported from src/components/art/icons.tsx (JSX → SVG string + data URI).
 */
import { n, svgToDataUri } from "./helpers";

export type IconName =
  | "home" | "library" | "journal" | "trophy" | "settings" | "back" | "forward"
  | "share" | "save" | "mic" | "sound-on" | "sound-off" | "close" | "plus"
  | "sparkle" | "lock" | "check" | "info" | "droplet" | "snow" | "search"
  | "refresh" | "trash" | "stir";

const PATHS: Record<IconName, string> = {
  home: `<path d="M4 11.5 12 4l8 7.5M6 10v9.5h12V10"/>`,
  library: `<path d="M6 3h3v18H6zM6 7h3"/><path d="M11 3h3v18h-3zM11 8h3"/><path d="M16.4 4.6l2.9.8 1.7 15.2-3.6.6z"/>`,
  journal: `<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M17 7a3 3 0 0 1 3-3h0v13M9 8h5M9 11h5"/>`,
  trophy: `<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 19h6M10 16h4v3h-4z"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18 6l-1.8 1.8M7.8 16.2 6 18M18 18l-1.8-1.8M7.8 7.8 6 6"/>`,
  back: `<path d="M14 6l-6 6 6 6"/>`,
  forward: `<path d="M10 6l6 6-6 6"/>`,
  share: `<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4"/>`,
  save: `<path d="M6 4h12v16l-6-4-6 4z"/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>`,
  "sound-on": `<path d="M4 9v6h3l5 4V5L7 9z"/><path d="M16 9a3 3 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10"/>`,
  "sound-off": `<path d="M4 9v6h3l5 4V5L7 9z"/><path d="M16 9l5 6M21 9l-5 6"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  sparkle: `<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>`,
  lock: `<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>`,
  check: `<path d="M5 12.5 10 17l9-10"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>`,
  droplet: `<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/>`,
  snow: `<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9M12 6l-2.2-2M12 6l2.2-2M12 18l-2.2 2M12 18l2.2 2"/>`,
  search: `<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>`,
  refresh: `<path d="M5 12a7 7 0 0 1 12-5l2 2M19 12a7 7 0 0 1-12 5l-2-2M17 4v5h-5M7 20v-5h5"/>`,
  trash: `<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>`,
  stir: `<path d="M14 3 8 17a3 3 0 1 1-2-1L12 2"/><circle cx="6.5" cy="18.5" r="2"/>`,
};

export function iconSvg(name: IconName, size = 22, color = "#C8A45D", strokeWidth = 1.5): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size)}" height="${n(size)}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${n(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
}

export function iconDataUri(name: IconName, size = 22, color = "#C8A45D", strokeWidth = 1.5): string {
  return svgToDataUri(iconSvg(name, size, color, strokeWidth));
}
