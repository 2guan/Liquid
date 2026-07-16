/**
 * Shared helpers for the SVG string-builders. The web build renders SVG via
 * React/JSX; the mini-program can't put inline <svg> in WXML, so each art piece
 * is assembled as an SVG *string* and handed to <image> as a data URI. Because
 * every <image> is its own SVG document, gradient/clip ids are document-scoped
 * and never collide across glasses — within a single document we still suffix
 * ids with a per-build counter so repeated sub-pieces stay unique.
 */

/* ── colour helpers (mirror Garnish.tsx / tokens.ts) ── */
export function clampHex(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
export function mix(hex: string, target: number, amt: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const f = (c: number) => clampHex(c + (target - c) * amt).toString(16).padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}
export const lighten = (hex: string, amt: number) => mix(hex, 255, amt);
export const darken = (hex: string, amt: number) => mix(hex, 0, amt);

/** number → trimmed string (avoid "1.2000000001" noise from float maths). */
export function n(v: number): string {
  return String(Math.round(v * 1000) / 1000);
}

let uidSeq = 0;
/** A short unique suffix for ids inside one built SVG document. */
export function nextUid(): string {
  uidSeq = (uidSeq + 1) % 1e9;
  return `u${uidSeq}`;
}

/**
 * Glassware micro-motion keyframes, embedded inside each SVG document so the
 * animation runs in <image>'s independent render sandbox (web build keeps these
 * in globals.css). Ported verbatim from src/app/globals.css.
 */
export const MOTION_STYLE = `<style>
.glint-drift{transform-box:fill-box;transform-origin:center;animation:glintDrift 6.5s ease-in-out infinite}
@keyframes glintDrift{0%,100%{opacity:.78;transform:translateX(-2px) scaleX(.97)}50%{opacity:1;transform:translateX(2px) scaleX(1.03)}}
.surface-shimmer{transform-box:fill-box;transform-origin:center;animation:surfaceShimmer 4.6s ease-in-out infinite}
@keyframes surfaceShimmer{0%,100%{opacity:.34;transform:scaleX(.96)}50%{opacity:.62;transform:scaleX(1.04)}}
.specular-breathe{animation:specularBreathe 5.5s ease-in-out infinite}
@keyframes specularBreathe{0%,100%{opacity:.72}50%{opacity:1}}
.rim-glint{transform-box:fill-box;transform-origin:center;animation:rimGlint 7s ease-in-out infinite}
@keyframes rimGlint{0%,100%{opacity:.3}45%{opacity:.85}}
.animate-breathe{animation:breathe 6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.7}50%{opacity:1}}
.animate-swirl-slow{animation:swirlSlow 9s linear infinite}
@keyframes swirlSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.bubble-rise{transform-box:fill-box;transform-origin:center;animation-name:bubbleRise;animation-timing-function:ease-in;animation-iteration-count:infinite}
@keyframes bubbleRise{0%{transform:translateY(0);opacity:0}15%{opacity:.7}80%{opacity:.5}100%{transform:translateY(var(--rise,-40px));opacity:0}}
</style>`;

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** UTF-8 string → base64. WeChat's logic layer has no btoa, and <image> only
 *  reliably decodes BASE64-encoded SVG data URIs (URL-encoded ones render blank
 *  on iOS/Android), so every glass/icon goes through here. */
function utf8ToBase64(str: string): string {
  // 1) string → UTF-8 byte values (via encodeURIComponent's %XX escapes)
  const enc = encodeURIComponent(str);
  const bytes: number[] = [];
  for (let i = 0; i < enc.length; i++) {
    const ch = enc.charCodeAt(i);
    if (ch === 37 /* % */) {
      bytes.push(parseInt(enc.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(ch);
    }
  }
  // 2) bytes → base64
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : "=";
    out += i + 2 < bytes.length ? B64[b2 & 63] : "=";
  }
  return out;
}

/** Wrap built SVG markup as a data URI suitable for <image src>. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;
}
