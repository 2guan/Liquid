/**
 * The Glass — a parametric SVG render styled as a refined vintage hand-drawn
 * illustration: loose ink linework over watercolour-flat fills, refractive
 * liquid, and gentle perpetual micro-motion. Ported from
 * src/components/art/Glass.tsx (JSX → SVG string for <image>).
 */
import type { GlassType, IceType, LiquidState } from "../types";
import type { SpiritFamily, LiquidLayer } from "../tokens";
import { liquidRamp, rampFromColor, layerBands, layerGradientStops } from "../tokens";
import { geomFor, halfWidthAt } from "../data/glasses";
import type { GarnishSpec } from "../data/garnish";
import { iceGroup } from "./ice";
import { garnishLayer } from "./garnish";
import { n, nextUid, MOTION_STYLE, svgToDataUri } from "./helpers";

export interface GlassOpts {
  glassType: GlassType;
  /** 0 (empty) … 1 (full to the brim of the cup region) */
  fillLevel?: number;
  family?: SpiritFamily;
  /** explicit liquid colour (any hex) — overrides `family` when set */
  liquidColor?: string;
  /** colour-layered drink (B-52…): bands bottom → top, overrides the single fill */
  layers?: LiquidLayer[];
  ice?: IceType;
  state?: LiquidState;
  /** amber halo behind the glass for hero placements */
  glow?: boolean;
  size?: number;
  /** frame the viewBox to the glass's actual content (for compact thumbnails) */
  fit?: boolean;
  /** carbonated drink → rising bubbles in the liquid */
  fizzy?: boolean;
  garnishes?: GarnishSpec[];
  title?: string;
}

/** Deterministic bubble field — dx: x offset frac of surface half-width;
 *  f: height up the liquid column; r: radius; d/dur: animation delay/duration. */
const BUBBLES: { dx: number; f: number; r: number; d: number; dur: number }[] = [
  { dx: -0.42, f: 0.16, r: 1.7, d: 0, dur: 3.6 },
  { dx: 0.34, f: 0.4, r: 1.1, d: 1.3, dur: 4.3 },
  { dx: -0.12, f: 0.6, r: 1.9, d: 0.6, dur: 3.1 },
  { dx: 0.46, f: 0.74, r: 1.0, d: 2.2, dur: 4.6 },
  { dx: 0.06, f: 0.28, r: 1.4, d: 1.8, dur: 3.9 },
  { dx: -0.5, f: 0.66, r: 1.2, d: 0.3, dur: 4.0 },
  { dx: 0.22, f: 0.88, r: 0.9, d: 2.7, dur: 3.4 },
  { dx: -0.3, f: 0.5, r: 1.5, d: 1.0, dur: 4.4 },
  { dx: 0.5, f: 0.22, r: 1.0, d: 1.6, dur: 3.7 },
  { dx: -0.04, f: 0.78, r: 1.2, d: 0.9, dur: 3.3 },
];

/** Build the full <svg> string for a glass. */
export function glassSvg(opts: GlassOpts): string {
  const {
    glassType,
    fillLevel = 0,
    family = "whisky",
    liquidColor,
    ice = "none",
    state = "still",
    glow = false,
    size = 240,
    fit = false,
    fizzy = false,
    garnishes,
    title,
    layers,
  } = opts;

  const uid = nextUid();
  const geom = geomFor(glassType);
  const clearFam = family === "gin" || family === "vodka" || family === "sparkling" || family === "rumWhite";
  const opaqueFam = family === "cream" || family === "coffeeMilk" || family === "pinacolada" || family === "tomato";
  const [hi, body, shadow] = liquidColor
    ? rampFromColor(liquidColor)
    : clearFam
      ? (["#EEF6F8", "#D6E6EC", "#A2BAC4"] as [string, string, string])
      : liquidRamp[family] ?? liquidRamp.default;

  let aTop = 0.86, aMid = 0.78, aBody = 0.82, aBody2 = 0.88, aBot = 0.95;
  if (liquidColor) {
    const m = liquidColor.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16) || 0;
    const g = parseInt(m.slice(2, 4), 16) || 0;
    const b = parseInt(m.slice(4, 6), 16) || 0;
    const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const f = Math.max(0.34, Math.min(0.9, 0.36 + sat * 0.72));
    aTop = f; aMid = f * 0.9; aBody = f; aBody2 = f * 1.06; aBot = Math.min(1, f + 0.16);
  } else if (clearFam) {
    aTop = 0.58; aMid = 0.48; aBody = 0.52; aBody2 = 0.64; aBot = 0.8;
  } else if (opaqueFam) {
    aTop = 0.97; aMid = 0.95; aBody = 0.97; aBody2 = 0.98; aBot = 1;
  }
  const edgeK = clearFam && !liquidColor ? 0.5 : 1;

  // The ink-distortion filter (feTurbulence + feDisplacementMap) is expensive to
  // rasterise. While pouring, the glass is re-rendered ~20×/s as the fill ramps,
  // so drop the heavy filter then — it would flicker/blank on the device.
  const detailed = size >= 130 && state !== "pouring";

  const garnishHead = fit && garnishes && garnishes.length > 0 ? 40 : 0;
  const vbTop = fit ? geom.content.top - garnishHead : 0;
  const vbH = fit ? geom.content.bottom - geom.content.top + garnishHead * 2 : 280;
  const svgH = size * (vbH / 200);

  const level = Math.max(0, Math.min(1, fillLevel));
  const liquidTop = geom.cup.bottom - level * (geom.cup.bottom - geom.cup.top);
  const surfaceHW = Math.max(2, halfWidthAt(geom, liquidTop) - 2);
  const hasLiquid = level > 0.005;
  const surfaceRy = surfaceHW * 0.14 + 1.5;

  // colour-layered drinks (B-52, Black Velvet…): slice the liquid into bands.
  const bands = layers && layers.length > 1 && hasLiquid ? layerBands(layers, liquidTop, geom.cup.bottom + 30) : null;
  const surfHi = bands ? bands[bands.length - 1].hi : hi;
  const surfShadow = bands ? bands[bands.length - 1].shadow : shadow;
  const baseHi = bands ? bands[0].hi : hi;

  const cupH = geom.cup.bottom - geom.cup.top;
  const interiorHW = Math.max(
    halfWidthAt(geom, geom.cup.bottom - 5),
    halfWidthAt(geom, geom.cup.top + cupH * 0.62),
  ) - 4;
  let iceR: number;
  let iceY: number;
  if (ice === "sphere") {
    iceR = Math.max(10, Math.min(interiorHW * 0.9, cupH * 0.52));
    iceY = Math.min(liquidTop + iceR * 0.8, geom.cup.bottom - iceR - 1);
  } else if (ice === "cube") {
    iceR = Math.max(9, Math.min(interiorHW * 0.74, cupH * 0.44));
    iceY = Math.min(liquidTop + iceR * 0.8, geom.cup.bottom - iceR - 2);
  } else if (ice === "crushed") {
    iceR = Math.max(16, interiorHW * 0.96);
    iceY = geom.cup.bottom - Math.min(iceR * 0.5, cupH * 0.42);
  } else {
    iceR = interiorHW;
    iceY = (liquidTop + geom.cup.bottom) / 2;
  }

  const rim = geom.rim;
  const inkFilter = detailed ? `filter="url(#ink-${uid})"` : "";

  // ── defs ──
  const defs = `<defs>
    <linearGradient id="liquid-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${hi}" stop-opacity="${n(aTop)}"/>
      <stop offset="16%" stop-color="${hi}" stop-opacity="${n(aMid)}"/>
      <stop offset="42%" stop-color="${body}" stop-opacity="${n(aBody)}"/>
      <stop offset="78%" stop-color="${body}" stop-opacity="${n(aBody2)}"/>
      <stop offset="100%" stop-color="${shadow}" stop-opacity="${n(aBot)}"/>
    </linearGradient>
    <linearGradient id="liqlight-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="28%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="46%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glass-${uid}" x1="0" y1="0" x2="1" y2="0.12">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="20%" stop-color="#dfe7ea" stop-opacity="0.035"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.016"/>
      <stop offset="86%" stop-color="#e9d6ad" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10"/>
    </linearGradient>
    <radialGradient id="glow-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F0B14B" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="#D89C3A" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#D89C3A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sheen-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="liqEdge-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${shadow}" stop-opacity="${n(0.58 * edgeK)}"/>
      <stop offset="9%" stop-color="${shadow}" stop-opacity="${n(0.22 * edgeK)}"/>
      <stop offset="24%" stop-color="${shadow}" stop-opacity="0"/>
      <stop offset="60%" stop-color="${hi}" stop-opacity="${n(0.1 * edgeK)}"/>
      <stop offset="78%" stop-color="${shadow}" stop-opacity="0"/>
      <stop offset="92%" stop-color="${shadow}" stop-opacity="${n(0.26 * edgeK)}"/>
      <stop offset="100%" stop-color="${shadow}" stop-opacity="${n(0.5 * edgeK)}"/>
    </linearGradient>
    <linearGradient id="wallAO-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#140d04" stop-opacity="0.5"/>
      <stop offset="13%" stop-color="#140d04" stop-opacity="0"/>
      <stop offset="87%" stop-color="#140d04" stop-opacity="0"/>
      <stop offset="100%" stop-color="#241808" stop-opacity="0.52"/>
    </linearGradient>
    <clipPath id="cup-${uid}"><path d="${geom.outline}"/></clipPath>
    ${detailed ? `<filter id="ink-${uid}" x="-6%" y="-4%" width="112%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="1" seed="6" result="nz"/><feDisplacementMap in="SourceGraphic" in2="nz" scale="0.7" xChannelSelector="R" yChannelSelector="G"/></filter>` : ""}
    <filter id="soft-${uid}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.3"/></filter>
    <filter id="softsh-${uid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.4"/></filter>
  </defs>`;

  // ── liquid group ──
  let liquidGroup = "";
  if (hasLiquid) {
    const bubbles = fizzy
      ? BUBBLES.map((b) => {
          const by = geom.cup.bottom - 3 - b.f * (geom.cup.bottom - 3 - liquidTop);
          const bx = 100 + b.dx * surfaceHW * 0.78;
          const rise = -(by - liquidTop - 1.5);
          const style = detailed
            ? ` class="bubble-rise" style="transform-box:fill-box;transform-origin:center;--rise:${n(rise)}px;animation-delay:${b.d}s;animation-duration:${b.dur}s"`
            : "";
          return `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(b.r)}" fill="#ffffff" opacity="0.5"${style}/>`;
        }).join("")
      : "";
    const swirl = state === "swirling"
      ? `<ellipse cx="${n(100 - surfaceHW * 0.34)}" cy="${n(liquidTop + 3)}" rx="${n(surfaceHW * 0.26)}" ry="${n(surfaceHW * 0.2)}" fill="#ffffff" opacity="0.1" ${detailed ? `filter="url(#soft-${uid})" ` : ""}class="animate-swirl-slow" style="transform-origin:100px ${n(liquidTop + 3)}px"/>`
      : "";
    const glint = detailed
      ? `<ellipse cx="${n(100 - surfaceHW * 0.28)}" cy="${n(liquidTop - 0.5)}" rx="${n(surfaceHW * 0.34)}" ry="${n(Math.max(1, surfaceRy * 0.5))}" fill="#ffffff" class="glint-drift" style="transform-origin:100px ${n(liquidTop)}px"/>`
      : "";
    const fillMarkup = bands
      ? `<defs><linearGradient id="lay-${uid}" x1="0" y1="0" x2="0" y2="1">${layerGradientStops(bands, liquidTop, geom.cup.bottom + 30).map((s) => `<stop offset="${n(s.offset * 100)}%" stop-color="${s.color}"/>`).join("")}</linearGradient></defs><rect x="0" y="${n(liquidTop)}" width="200" height="${n(geom.cup.bottom + 30 - liquidTop)}" fill="url(#lay-${uid})" opacity="0.7"/>`
      : `<rect x="0" y="${n(liquidTop)}" width="200" height="${n(geom.cup.bottom + 30 - liquidTop)}" fill="url(#liquid-${uid})"/><rect x="0" y="${n(liquidTop)}" width="200" height="${n(geom.cup.bottom + 30 - liquidTop)}" fill="url(#liqEdge-${uid})"/>`;
    liquidGroup = `<g clip-path="url(#cup-${uid})">
      ${fillMarkup}
      <rect x="0" y="${n(liquidTop)}" width="200" height="${n(geom.cup.bottom + 30 - liquidTop)}" fill="url(#liqlight-${uid})" opacity="0.6"/>
      <ellipse cx="100" cy="${n(geom.cup.bottom - 5)}" rx="${n(surfaceHW * 0.74)}" ry="7" fill="${baseHi}" opacity="0.3"/>
      <ellipse cx="100" cy="${n(geom.cup.bottom - 4)}" rx="${n(surfaceHW * 0.4)}" ry="3.5" fill="#ffffff" opacity="0.16"/>
      <ellipse cx="100" cy="${n(liquidTop + surfaceRy + 2)}" rx="${n(surfaceHW)}" ry="${n(surfaceRy)}" fill="${surfShadow}" opacity="0.28"/>
      <ellipse cx="100" cy="${n(liquidTop)}" rx="${n(surfaceHW)}" ry="${n(surfaceRy)}" fill="${surfHi}" opacity="0.6"/>
      <ellipse cx="100" cy="${n(liquidTop)}" rx="${n(surfaceHW)}" ry="${n(surfaceRy)}" fill="none" stroke="#fff6e2" stroke-opacity="0.5" stroke-width="0.9"${detailed ? ` class="surface-shimmer" style="transform-origin:100px ${n(liquidTop)}px"` : ""}/>
      ${glint}${swirl}${bubbles}
    </g>`;
  }

  const iceMarkup = ice !== "none" && hasLiquid
    ? `<g clip-path="url(#cup-${uid})">${iceGroup({ type: ice, cx: 100, cy: iceY, r: iceR, waterY: liquidTop, liquidColor: body, fillTop: liquidTop, fillBottom: geom.cup.bottom, fillHW: interiorHW })}</g>`
    : "";

  const backGarnish = hasLiquid && garnishes && garnishes.length > 0
    ? garnishLayer({ layer: "back", clipId: `cup-${uid}`, specs: garnishes, rim, cupTop: geom.cup.top, liquidTop, surfaceHW, liquidColor: body, liquidShadow: shadow })
    : "";
  const frontGarnish = garnishes && garnishes.length > 0
    ? garnishLayer({ layer: "front", specs: garnishes, rim, cupTop: geom.cup.top, liquidTop, surfaceHW, liquidColor: body, liquidShadow: shadow })
    : "";

  const optics = `<g clip-path="url(#cup-${uid})">
    <rect x="0" y="${n(geom.cup.top - 6)}" width="200" height="${n(cupH + 12)}" fill="url(#wallAO-${uid})"/>
    <ellipse cx="${n(100 - interiorHW * 0.34)}" cy="${n(geom.cup.top + cupH * 0.3)}" rx="${n(Math.max(12, interiorHW * 0.52))}" ry="${n(cupH * 0.44)}" fill="url(#sheen-${uid})"/>
    <ellipse cx="${n(100 + interiorHW * 0.46)}" cy="${n(geom.cup.top + cupH * 0.16)}" rx="${n(Math.max(2.5, interiorHW * 0.12))}" ry="${n(cupH * 0.1)}" fill="#ffffff" opacity="0.12"/>
    <path d="M${n(rim.cx - rim.rx * 0.72)},${n(rim.cy + 6)} C${n(rim.cx - rim.rx * 0.92)},${n((rim.cy + geom.cup.bottom) / 2)} ${n(rim.cx - rim.rx * 0.82)},${n(geom.cup.bottom - 18)} ${n(rim.cx - rim.rx * 0.5)},${n(geom.cup.bottom - 9)}" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="4.2" stroke-linecap="round"${detailed ? ` class="specular-breathe"` : ""}/>
    <path d="M${n(rim.cx - rim.rx * 0.68)},${n(rim.cy + 9)} C${n(rim.cx - rim.rx * 0.86)},${n((rim.cy + geom.cup.bottom) / 2)} ${n(rim.cx - rim.rx * 0.78)},${n(geom.cup.bottom - 20)} ${n(rim.cx - rim.rx * 0.5)},${n(geom.cup.bottom - 12)}" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1" stroke-linecap="round"/>
    <path d="M${n(rim.cx + rim.rx * 0.84)},${n(rim.cy + 10)} C${n(rim.cx + rim.rx * 0.92)},${n((rim.cy + geom.cup.bottom) / 2)} ${n(rim.cx + rim.rx * 0.86)},${n(geom.cup.bottom - 24)} ${n(rim.cx + rim.rx * 0.6)},${n(geom.cup.bottom - 12)}" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;

  const baseHWb = Math.max(4, halfWidthAt(geom, geom.cup.bottom) - 5);
  const baseHWring = Math.max(4, halfWidthAt(geom, geom.cup.bottom) - 4);
  const baseHWglint = Math.max(2, halfWidthAt(geom, geom.cup.bottom) * 0.3);
  const frontLinework = `<g ${inkFilter}>
    <ellipse cx="100" cy="${n(geom.cup.bottom - 2)}" rx="${n(baseHWb)}" ry="4.5" fill="#fff2d6" opacity="0.14"/>
    <ellipse cx="100" cy="${n(geom.cup.bottom - 0.5)}" rx="${n(baseHWring)}" ry="3.4" fill="none" stroke="#231708" stroke-opacity="0.42" stroke-width="1.5"/>
    <ellipse cx="${n(100 - 2)}" cy="${n(geom.cup.bottom - 3)}" rx="${n(baseHWglint)}" ry="1.4" fill="#fff7e2" opacity="0.4"/>
    <path d="${geom.outline}" fill="none" stroke="#6e5a38" stroke-opacity="0.32" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="${geom.outline}" fill="none" stroke="#EFE2BE" stroke-opacity="0.5" stroke-width="1.2" stroke-linejoin="round"/>
  </g>`;

  const rimMarkup = `<g>
    <ellipse cx="${n(rim.cx)}" cy="${n(rim.cy)}" rx="${n(rim.rx)}" ry="${n(rim.ry)}" fill="none" stroke="#FBEFC9" stroke-opacity="0.52" stroke-width="1.1"/>
    <path d="M${n(rim.cx - rim.rx * 0.7)},${n(rim.cy + rim.ry * 0.5)} A${n(rim.rx)} ${n(rim.ry)} 0 0 0 ${n(rim.cx + rim.rx * 0.7)},${n(rim.cy + rim.ry * 0.5)}" fill="none" stroke="#fff7e0" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M${n(rim.cx - rim.rx * 0.42)},${n(rim.cy - rim.ry * 0.62)} A${n(rim.rx)} ${n(rim.ry)} 0 0 1 ${n(rim.cx + rim.rx * 0.06)},${n(rim.cy - rim.ry)}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.9" stroke-linecap="round"${detailed ? ` class="rim-glint"` : ""}/>
  </g>`;

  const glowMarkup = glow
    ? `<ellipse cx="100" cy="${n(geom.cup.top + 40)}" rx="110" ry="110" fill="url(#glow-${uid})"${detailed ? ` class="animate-breathe"` : ""}/>`
    : "";
  const stemMarkup = geom.stem
    ? `<path d="${geom.stem}" fill="url(#glass-${uid})" stroke="#E7D6B1" stroke-opacity="0.32" stroke-width="1" ${inkFilter}/>`
    : "";
  const luminousEdge = detailed
    ? `<path d="${geom.outline}" fill="none" stroke="#fff1d6" stroke-opacity="0.16" stroke-width="2.6" filter="url(#soft-${uid})"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size)}" height="${n(svgH)}" viewBox="0 ${n(vbTop)} 200 ${n(vbH)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${(title ?? `${glassType} glass`).replace(/"/g, "")}">
    ${defs}
    ${detailed ? MOTION_STYLE : ""}
    ${glowMarkup}
    <ellipse cx="${n(geom.shadow.cx)}" cy="${n(geom.shadow.cy + 1)}" rx="${n(geom.shadow.rx + 5)}" ry="${n(geom.shadow.ry + 2.5)}" fill="#000000" opacity="0.1" filter="url(#softsh-${uid})"/>
    <ellipse cx="${n(geom.shadow.cx)}" cy="${n(geom.shadow.cy)}" rx="${n(geom.shadow.rx)}" ry="${n(geom.shadow.ry)}" fill="#000000" opacity="0.3" filter="url(#softsh-${uid})"/>
    ${stemMarkup}
    ${luminousEdge}
    <path d="${geom.outline}" fill="url(#glass-${uid})"/>
    ${liquidGroup}
    ${iceMarkup}
    ${backGarnish}
    ${optics}
    ${frontLinework}
    ${rimMarkup}
    ${frontGarnish}
  </svg>`;
}

/** Convenience: glass SVG already wrapped as a data URI for <image src>. */
export function glassDataUri(opts: GlassOpts): string {
  return svgToDataUri(glassSvg(opts));
}
