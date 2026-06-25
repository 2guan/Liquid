/**
 * Physical garnishes (citrus, herbs, spices, foam, rim crust…) as SVG strings.
 * Ported from src/components/art/Garnish.tsx (JSX → SVG string).
 */
import type { GarnishSpec, GarnishKind } from "../data/garnish";
import { lighten, darken, n, nextUid } from "./helpers";

/**
 * The element a single garnish draws around its local origin. Tall kinds grow
 * upward (−y) from the origin (planted on the rim); surface kinds are centred.
 */
export function garnishShape(kind: GarnishKind, color: string, s: number): string {
  switch (kind) {
    case "citrusWheel": {
      const segs = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return `<line x1="0" y1="0" x2="${n(Math.cos(a) * s * 0.74)}" y2="${n(Math.sin(a) * s * 0.74)}" stroke="${color}" stroke-opacity="0.5" stroke-width="${n(s * 0.05)}"/>`;
      }).join("");
      return `<g><circle r="${n(s)}" fill="${color}"/><circle r="${n(s * 0.82)}" fill="${lighten(color, 0.62)}"/>${segs}<circle r="${n(s * 0.12)}" fill="${lighten(color, 0.4)}"/><ellipse cx="${n(-s * 0.35)}" cy="${n(-s * 0.4)}" rx="${n(s * 0.22)}" ry="${n(s * 0.12)}" fill="#ffffff" opacity="0.4" transform="rotate(-30 ${n(-s * 0.35)} ${n(-s * 0.4)})"/></g>`;
    }
    case "cucumberSlice": {
      const seeds = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return `<ellipse cx="${n(Math.cos(a) * s * 0.32)}" cy="${n(Math.sin(a) * s * 0.32)}" rx="${n(s * 0.07)}" ry="${n(s * 0.1)}" fill="${darken(color, 0.2)}" opacity="0.5"/>`;
      }).join("");
      return `<g><circle r="${n(s)}" fill="${darken(color, 0.12)}"/><circle r="${n(s * 0.84)}" fill="${lighten(color, 0.5)}"/>${seeds}<ellipse cx="${n(-s * 0.34)}" cy="${n(-s * 0.38)}" rx="${n(s * 0.2)}" ry="${n(s * 0.1)}" fill="#ffffff" opacity="0.35" transform="rotate(-30 ${n(-s * 0.34)} ${n(-s * 0.38)})"/></g>`;
    }
    case "citrusTwist":
      return `<g><path d="M${n(-s * 0.7)},${n(-s)} C${n(s * 0.7)},${n(-s)} ${n(s * 0.8)},${n(s * 0.6)} ${n(-s * 0.2)},${n(s)} C${n(-s * 0.9)},${n(s * 1.2)} ${n(-s)},${n(s * 0.2)} ${n(-s * 0.45)},0" fill="none" stroke="${color}" stroke-width="${n(s * 0.42)}" stroke-linecap="round"/><path d="M${n(-s * 0.7)},${n(-s)} C${n(s * 0.7)},${n(-s)} ${n(s * 0.8)},${n(s * 0.6)} ${n(-s * 0.2)},${n(s)}" fill="none" stroke="${lighten(color, 0.45)}" stroke-width="${n(s * 0.16)}" stroke-linecap="round"/></g>`;
    case "berry": {
      const dots = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return `<circle cx="${n(Math.cos(a) * s * 0.4)}" cy="${n(Math.sin(a) * s * 0.4)}" r="${n(s * 0.18)}" fill="${darken(color, 0.12)}" opacity="0.55"/>`;
      }).join("");
      return `<g><circle r="${n(s * 0.78)}" fill="${color}"/>${dots}<circle cx="${n(-s * 0.24)}" cy="${n(-s * 0.28)}" r="${n(s * 0.16)}" fill="#ffffff" opacity="0.5"/></g>`;
    }
    case "cherry":
      return `<g><path d="M${n(s * 0.2)},${n(-s * 1.7)} C${n(s * 0.1)},${n(-s * 0.9)} ${n(-s * 0.1)},${n(-s * 0.6)} 0,${n(-s * 0.55)}" fill="none" stroke="#6E5A2A" stroke-width="${n(s * 0.12)}" stroke-linecap="round"/><circle r="${n(s * 0.7)}" fill="${color}"/><circle r="${n(s * 0.7)}" fill="none" stroke="${darken(color, 0.3)}" stroke-opacity="0.5" stroke-width="${n(s * 0.06)}"/><circle cx="${n(-s * 0.26)}" cy="${n(-s * 0.26)}" r="${n(s * 0.16)}" fill="#ffffff" opacity="0.55"/></g>`;
    case "fruitSlice":
      return `<g><path d="M0,${n(s)} A${n(s)} ${n(s)} 0 0 1 ${n(-s)},0 L0,0 Z" fill="${lighten(color, 0.45)}" stroke="${color}" stroke-width="${n(s * 0.12)}" stroke-linejoin="round"/><path d="M0,${n(s)} A${n(s)} ${n(s)} 0 0 1 ${n(-s)},0" fill="none" stroke="${darken(color, 0.1)}" stroke-width="${n(s * 0.22)}" stroke-linecap="round"/><ellipse cx="${n(-s * 0.45)}" cy="${n(s * 0.42)}" rx="${n(s * 0.12)}" ry="${n(s * 0.2)}" fill="#ffffff" opacity="0.3" transform="rotate(40 ${n(-s * 0.45)} ${n(s * 0.42)})"/></g>`;
    case "mintSprig": {
      const leaf = (lx: number, ly: number, rot: number, sc: number) =>
        `<g transform="translate(${n(lx)} ${n(ly)}) rotate(${n(rot)}) scale(${n(sc)})"><path d="M0,0 C${n(s * 0.55)},${n(-s * 0.2)} ${n(s * 0.55)},${n(-s * 0.9)} 0,${n(-s * 1.15)} C${n(-s * 0.55)},${n(-s * 0.9)} ${n(-s * 0.55)},${n(-s * 0.2)} 0,0 Z" fill="${color}"/><path d="M0,0 L0,${n(-s * 1.05)}" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.05)}"/></g>`;
      return `<g><path d="M0,0 C${n(s * 0.1)},${n(-s)} 0,${n(-s * 1.8)} ${n(-s * 0.1)},${n(-s * 2.4)}" fill="none" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.1)}"/>${leaf(0, -s * 2.2, 8, 1)}${leaf(-s * 0.3, -s * 1.5, -32, 0.85)}${leaf(s * 0.32, -s * 1.4, 34, 0.85)}${leaf(-s * 0.3, -s * 0.85, -50, 0.7)}${leaf(s * 0.3, -s * 0.8, 52, 0.7)}</g>`;
    }
    case "herbSprig": {
      const needles = Array.from({ length: 12 }, (_, i) => {
        const y = -i * s * 0.22 - s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        return `<line x1="0" y1="${n(y)}" x2="${n(side * s * 0.5)}" y2="${n(y - s * 0.28)}" stroke="${color}" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>`;
      }).join("");
      return `<g><path d="M0,0 L0,${n(-s * 2.8)}" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.1)}"/>${needles}</g>`;
    }
    case "thymeSprig": {
      const leaves = Array.from({ length: 11 }, (_, i) => {
        const y = -s * 0.3 - i * s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        return `<ellipse cx="${n(side * s * 0.14)}" cy="${n(y)}" rx="${n(s * 0.17)}" ry="${n(s * 0.09)}" fill="${i % 3 === 0 ? lighten(color, 0.12) : color}" transform="rotate(${n(side * 34)} ${n(side * s * 0.14)} ${n(y)})"/>`;
      }).join("");
      return `<g><path d="M0,0 C${n(s * 0.06)},${n(-s)} ${n(-s * 0.06)},${n(-s * 1.8)} ${n(s * 0.04)},${n(-s * 2.4)}" fill="none" stroke="${darken(color, 0.22)}" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>${leaves}</g>`;
    }
    case "dillSprig": {
      const fronds = Array.from({ length: 7 }, (_, i) => {
        const y = -s * 0.45 - i * s * 0.28;
        const side = i % 2 === 0 ? 1 : -1;
        const hairs = Array.from({ length: 4 }, (_, j) =>
          `<line x1="0" y1="${n(y)}" x2="${n(side * (s * 0.18 + j * s * 0.12))}" y2="${n(y - s * 0.34 - j * s * 0.04)}" stroke="${color}" stroke-width="${n(s * 0.045)}" stroke-linecap="round"/>`,
        ).join("");
        return `<g>${hairs}</g>`;
      }).join("");
      return `<g><path d="M0,0 L0,${n(-s * 2.4)}" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.07)}" stroke-linecap="round"/>${fronds}</g>`;
    }
    case "bayLeaf": {
      const veins = [-0.7, -0.3, 0.1, 0.5].map((t) =>
        `<g><line x1="0" y1="${n(t * s)}" x2="${n(s * 0.34)}" y2="${n(t * s + s * 0.28)}" stroke="${darken(color, 0.25)}" stroke-opacity="0.5" stroke-width="${n(s * 0.035)}"/><line x1="0" y1="${n(t * s)}" x2="${n(-s * 0.34)}" y2="${n(t * s + s * 0.28)}" stroke="${darken(color, 0.25)}" stroke-opacity="0.5" stroke-width="${n(s * 0.035)}"/></g>`,
      ).join("");
      return `<g><path d="M0,${n(-s * 1.5)} C${n(s * 0.52)},${n(-s * 0.9)} ${n(s * 0.5)},${n(s * 0.8)} 0,${n(s * 1.5)} C${n(-s * 0.5)},${n(s * 0.8)} ${n(-s * 0.52)},${n(-s * 0.9)} 0,${n(-s * 1.5)} Z" fill="${color}" stroke="${darken(color, 0.28)}" stroke-width="${n(s * 0.05)}" stroke-linejoin="round"/><path d="M0,${n(-s * 1.4)} L0,${n(s * 1.4)}" stroke="${darken(color, 0.32)}" stroke-width="${n(s * 0.05)}"/>${veins}<path d="M${n(-s * 0.18)},${n(-s * 1.1)} C${n(-s * 0.3)},${n(-s * 0.4)} ${n(-s * 0.28)},${n(s * 0.4)} ${n(-s * 0.12)},${n(s * 0.9)}" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/></g>`;
    }
    case "basilLeaf": {
      const veins = [-0.55, -0.15, 0.25].map((t) =>
        `<g><path d="M0,${n(t * s)} Q${n(s * 0.45)},${n(t * s + s * 0.1)} ${n(s * 0.78)},${n(t * s + s * 0.45)}" fill="none" stroke="${darken(color, 0.22)}" stroke-opacity="0.5" stroke-width="${n(s * 0.04)}"/><path d="M0,${n(t * s)} Q${n(-s * 0.45)},${n(t * s + s * 0.1)} ${n(-s * 0.78)},${n(t * s + s * 0.45)}" fill="none" stroke="${darken(color, 0.22)}" stroke-opacity="0.5" stroke-width="${n(s * 0.04)}"/></g>`,
      ).join("");
      return `<g><path d="M0,${n(-s * 1.35)} C${n(s * 1.02)},${n(-s * 0.8)} ${n(s * 0.92)},${n(s * 0.7)} 0,${n(s * 1.15)} C${n(-s * 0.92)},${n(s * 0.7)} ${n(-s * 1.02)},${n(-s * 0.8)} 0,${n(-s * 1.35)} Z" fill="${color}" stroke="${darken(color, 0.24)}" stroke-width="${n(s * 0.05)}" stroke-linejoin="round"/><path d="M0,${n(-s * 1.2)} L0,${n(s * 1.05)}" stroke="${darken(color, 0.3)}" stroke-width="${n(s * 0.055)}"/>${veins}<ellipse cx="${n(-s * 0.34)}" cy="${n(-s * 0.34)}" rx="${n(s * 0.3)}" ry="${n(s * 0.5)}" fill="#ffffff" opacity="0.16" transform="rotate(-24 ${n(-s * 0.34)} ${n(-s * 0.34)})"/></g>`;
    }
    case "sageLeaf": {
      const stipple = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return `<circle cx="${n(Math.cos(a) * s * 0.26)}" cy="${n(Math.sin(a) * s * 0.7)}" r="${n(s * 0.05)}" fill="${darken(color, 0.14)}" opacity="0.4"/>`;
      }).join("");
      return `<g><path d="M0,${n(-s * 1.45)} C${n(s * 0.46)},${n(-s * 0.9)} ${n(s * 0.5)},${n(s * 0.85)} 0,${n(s * 1.3)} C${n(-s * 0.5)},${n(s * 0.85)} ${n(-s * 0.46)},${n(-s * 0.9)} 0,${n(-s * 1.45)} Z" fill="${lighten(color, 0.1)}" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.05)}" stroke-linejoin="round"/><path d="M0,${n(-s * 1.35)} L0,${n(s * 1.2)}" stroke="${darken(color, 0.18)}" stroke-opacity="0.6" stroke-width="${n(s * 0.05)}"/>${stipple}</g>`;
    }
    case "lavender": {
      const buds = Array.from({ length: 6 }, (_, i) =>
        `<ellipse cx="${n((i % 2 === 0 ? 1 : -1) * s * 0.16)}" cy="${n(-s * 2.1 + i * s * 0.22)}" rx="${n(s * 0.2)}" ry="${n(s * 0.16)}" fill="${color}" opacity="0.9"/>`,
      ).join("");
      return `<g><path d="M0,0 L0,${n(-s * 2.2)}" stroke="#6E7A4A" stroke-width="${n(s * 0.1)}"/>${buds}</g>`;
    }
    case "leaf":
      return `<g><path d="M0,${n(s)} C${n(s * 0.9)},${n(s * 0.3)} ${n(s * 0.9)},${n(-s * 0.7)} 0,${n(-s)} C${n(-s * 0.9)},${n(-s * 0.7)} ${n(-s * 0.9)},${n(s * 0.3)} 0,${n(s)} Z" fill="${color}"/><path d="M0,${n(s)} L0,${n(-s)}" stroke="${darken(color, 0.28)}" stroke-width="${n(s * 0.06)}"/></g>`;
    case "flower": {
      const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * 360;
        return `<ellipse cx="0" cy="${n(-s * 0.55)}" rx="${n(s * 0.28)}" ry="${n(s * 0.55)}" fill="${color}" opacity="0.92" transform="rotate(${n(a)})"/>`;
      }).join("");
      return `<g>${petals}<circle r="${n(s * 0.26)}" fill="${lighten(color, 0.5)}"/></g>`;
    }
    case "cinnamonStick":
      return `<g><rect x="${n(-s * 0.32)}" y="${n(-s * 2.6)}" width="${n(s * 0.64)}" height="${n(s * 2.6)}" rx="${n(s * 0.3)}" fill="${color}"/><rect x="${n(-s * 0.32)}" y="${n(-s * 2.6)}" width="${n(s * 0.26)}" height="${n(s * 2.6)}" rx="${n(s * 0.13)}" fill="${darken(color, 0.25)}"/><rect x="${n(s * 0.06)}" y="${n(-s * 2.6)}" width="${n(s * 0.16)}" height="${n(s * 2.6)}" rx="${n(s * 0.08)}" fill="${lighten(color, 0.25)}" opacity="0.7"/></g>`;
    case "clove": {
      const one = (x: number, y: number, rot: number) => {
        const spokes = Array.from({ length: 4 }, (_, i) =>
          `<line x1="0" y1="${n(-s * 0.05)}" x2="${n(Math.cos((i / 4) * 6.28) * s * 0.26)}" y2="${n(-s * 0.05 + Math.sin((i / 4) * 6.28) * s * 0.26)}" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.07)}" stroke-linecap="round"/>`,
        ).join("");
        return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)})"><line x1="0" y1="0" x2="0" y2="${n(s * 0.9)}" stroke="${color}" stroke-width="${n(s * 0.14)}" stroke-linecap="round"/><circle cx="0" cy="${n(-s * 0.05)}" r="${n(s * 0.28)}" fill="${lighten(color, 0.2)}"/>${spokes}</g>`;
      };
      return `<g>${one(-s * 0.5, -s * 0.4, -20)}${one(s * 0.5, -s * 0.3, 22)}</g>`;
    }
    case "starAnise": {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return `${n(Math.cos(a) * s)},${n(Math.sin(a) * s)}`;
      });
      const inner = Array.from({ length: 8 }, (_, i) => {
        const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
        return `${n(Math.cos(a) * s * 0.4)},${n(Math.sin(a) * s * 0.4)}`;
      });
      const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p} L${inner[i]}`).join(" ") + " Z";
      const seeds = pts.map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return `<circle cx="${n(Math.cos(a) * s * 0.62)}" cy="${n(Math.sin(a) * s * 0.62)}" r="${n(s * 0.13)}" fill="${lighten(color, 0.4)}"/>`;
      }).join("");
      return `<g><path d="${d}" fill="${color}" stroke="${darken(color, 0.3)}" stroke-width="${n(s * 0.04)}" stroke-linejoin="round"/>${seeds}</g>`;
    }
    case "seeds": {
      const pts: [number, number][] = [[-s * 0.5, 0], [s * 0.2, -s * 0.4], [s * 0.5, s * 0.3], [-s * 0.2, s * 0.4], [0, -s * 0.05], [-s * 0.6, s * 0.5]];
      return `<g>${pts.map(([x, y], i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(s * 0.22)}" fill="${i % 2 ? lighten(color, 0.15) : color}"/>`).join("")}</g>`;
    }
    case "gingerSlice": {
      const lines = Array.from({ length: 3 }, (_, i) =>
        `<line x1="${n(-s * 0.5 + i * s * 0.4)}" y1="${n(-s * 0.5)}" x2="${n(-s * 0.4 + i * s * 0.4)}" y2="${n(s * 0.5)}" stroke="${darken(color, 0.15)}" stroke-opacity="0.4" stroke-width="${n(s * 0.05)}"/>`,
      ).join("");
      return `<g><path d="M${n(-s * 0.9)},${n(-s * 0.2)} C${n(-s * 0.6)},${n(-s)} ${n(s * 0.8)},${n(-s * 0.9)} ${n(s)},${n(-s * 0.1)} C${n(s * 1.1)},${n(s * 0.7)} ${n(-s * 0.3)},${n(s)} ${n(-s * 0.9)},${n(-s * 0.2)} Z" fill="${lighten(color, 0.2)}" stroke="${darken(color, 0.18)}" stroke-width="${n(s * 0.07)}"/>${lines}</g>`;
    }
    case "chili":
      return `<g><path d="M0,${n(-s * 2.4)} C${n(s * 0.1)},${n(-s * 2.2)} ${n(s * 0.55)},${n(-s)} ${n(s * 0.3)},${n(-s * 0.2)} C${n(s * 0.1)},${n(s * 0.3)} ${n(-s * 0.4)},${n(s * 0.1)} ${n(-s * 0.2)},${n(-s * 0.8)} C${n(-s * 0.05)},${n(-s * 1.6)} ${n(-s * 0.15)},${n(-s * 2.2)} 0,${n(-s * 2.4)} Z" fill="${color}"/><path d="M0,${n(-s * 2.4)} C${n(s * 0.05)},${n(-s * 1.6)} ${n(s * 0.1)},${n(-s)} ${n(s * 0.15)},${n(-s * 0.5)}" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="${n(s * 0.1)}" stroke-linecap="round"/><path d="M0,${n(-s * 2.4)} C${n(-s * 0.2)},${n(-s * 2.6)} ${n(-s * 0.5)},${n(-s * 2.5)} ${n(-s * 0.6)},${n(-s * 2.3)}" fill="none" stroke="#5A7A3A" stroke-width="${n(s * 0.16)}" stroke-linecap="round"/></g>`;
    case "vanillaPod":
      return `<g><path d="M0,0 C${n(s * 0.3)},${n(-s)} ${n(-s * 0.2)},${n(-s * 1.9)} ${n(s * 0.1)},${n(-s * 2.8)}" fill="none" stroke="${color}" stroke-width="${n(s * 0.34)}" stroke-linecap="round"/><path d="M0,0 C${n(s * 0.3)},${n(-s)} ${n(-s * 0.2)},${n(-s * 1.9)} ${n(s * 0.1)},${n(-s * 2.8)}" fill="none" stroke="${lighten(color, 0.25)}" stroke-width="${n(s * 0.1)}" stroke-linecap="round"/></g>`;
    case "coffeeBeans": {
      const bean = (x: number, y: number, rot: number) =>
        `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)})"><ellipse rx="${n(s * 0.42)}" ry="${n(s * 0.6)}" fill="${color}"/><path d="M0,${n(-s * 0.5)} C${n(s * 0.12)},${n(-s * 0.2)} ${n(s * 0.12)},${n(s * 0.2)} 0,${n(s * 0.5)}" fill="none" stroke="${darken(color, 0.4)}" stroke-width="${n(s * 0.09)}"/><ellipse cx="${n(-s * 0.14)}" cy="${n(-s * 0.18)}" rx="${n(s * 0.1)}" ry="${n(s * 0.16)}" fill="#ffffff" opacity="0.25"/></g>`;
      return `<g>${bean(-s * 0.55, s * 0.2, -18)}${bean(s * 0.5, -s * 0.1, 16)}${bean(0, s * 0.55, 4)}</g>`;
    }
    case "olive":
      return `<g><line x1="${n(s * 0.1)}" y1="${n(-s * 1.6)}" x2="${n(-s * 0.1)}" y2="${n(s * 0.4)}" stroke="#C9A45D" stroke-width="${n(s * 0.12)}"/><ellipse rx="${n(s * 0.6)}" ry="${n(s * 0.8)}" fill="${color}"/><ellipse rx="${n(s * 0.6)}" ry="${n(s * 0.8)}" fill="none" stroke="${darken(color, 0.25)}" stroke-opacity="0.5" stroke-width="${n(s * 0.06)}"/><circle cx="0" cy="${n(s * 0.35)}" r="${n(s * 0.2)}" fill="#C5402A"/><ellipse cx="${n(-s * 0.2)}" cy="${n(-s * 0.3)}" rx="${n(s * 0.12)}" ry="${n(s * 0.2)}" fill="#ffffff" opacity="0.4"/></g>`;
    case "onion":
      return `<g><line x1="${n(s * 0.1)}" y1="${n(-s * 1.6)}" x2="${n(-s * 0.1)}" y2="${n(s * 0.3)}" stroke="#C9A45D" stroke-width="${n(s * 0.12)}"/><circle r="${n(s * 0.72)}" fill="${color}"/><path d="M${n(-s * 0.5)},${n(-s * 0.3)} A${n(s * 0.72)} ${n(s * 0.72)} 0 0 1 ${n(s * 0.4)},${n(-s * 0.5)}" fill="none" stroke="${darken(color, 0.15)}" stroke-opacity="0.5" stroke-width="${n(s * 0.05)}"/><circle cx="${n(-s * 0.24)}" cy="${n(-s * 0.26)}" r="${n(s * 0.16)}" fill="#ffffff" opacity="0.5"/></g>`;
    case "goldLeaf": {
      const flakes: [number, number, number][] = [[-s * 0.5, -s * 0.2, 20], [s * 0.3, s * 0.3, -15], [s * 0.1, -s * 0.5, 40], [-s * 0.2, s * 0.5, -30]];
      return `<g>${flakes.map(([x, y, r], i) => `<rect x="${n(x)}" y="${n(y)}" width="${n(s * (0.3 + (i % 2) * 0.18))}" height="${n(s * 0.26)}" fill="${color}" opacity="${n(0.85 - i * 0.12)}" transform="rotate(${n(r)} ${n(x)} ${n(y)})"/>`).join("")}</g>`;
    }
    case "drops": {
      const pts: [number, number][] = [[-s * 0.5, 0], [s * 0.08, -s * 0.32], [s * 0.46, s * 0.22], [-s * 0.1, s * 0.34]];
      return `<g>${pts.map(([x, y]) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(s * 0.2)}" ry="${n(s * 0.26)}" fill="${color}" opacity="0.65"/>`).join("")}</g>`;
    }
    default:
      return "";
  }
}

export interface GarnishLayerOpts {
  specs: GarnishSpec[];
  rim: { cx: number; cy: number; rx: number; ry: number };
  cupTop: number;
  liquidTop: number;
  surfaceHW: number;
  layer: "back" | "front";
  /** clipPath id of the cup interior — keeps in-drink garnishes inside the glass */
  clipId?: string;
  liquidColor?: string;
  liquidShadow?: string;
}

/**
 * Garnishes laid out in two passes so they read as inside the glass:
 *  - back: foam, floating fruit/coffee/beans, dusting — clipped to the cup.
 *  - front: salt/sugar rim crust and tall sprigs/sticks resting on the lip.
 */
export function garnishLayer(opts: GarnishLayerOpts): string {
  const { specs, rim, cupTop, liquidTop, surfaceHW, layer, clipId } = opts;
  const liquidColor = opts.liquidColor ?? "#9A5826";
  const liquidShadow = opts.liquidShadow ?? "#3A1E0C";
  if (!specs.length) return "";
  const uid = nextUid();
  const surf = specs.filter((g) => g.placement === "surface");
  const tall = specs.filter((g) => g.placement === "tall");
  const rimG = specs.find((g) => g.placement === "rim");
  const foam = specs.find((g) => g.placement === "foam");
  const dust = specs.find((g) => g.placement === "dust");

  const sItem = Math.max(6, Math.min(16, surfaceHW * 0.38));
  const surfRy = surfaceHW * 0.14 + 1.5;
  const tallH = rim.cy - cupTop + 60;

  if (layer === "back") {
    const foamMarkup = foam
      ? `<g><ellipse cx="100" cy="${n(liquidTop - surfRy * 0.4)}" rx="${n(surfaceHW)}" ry="${n(surfRy * 1.5)}" fill="${foam.color}" opacity="0.92"/>${[-0.4, 0, 0.45].map((d) => `<circle cx="${n(100 + d * surfaceHW)}" cy="${n(liquidTop - surfRy * 0.7)}" r="${n(surfaceHW * 0.1)}" fill="#ffffff" opacity="0.6"/>`).join("")}</g>`
      : "";

    const surfMarkup = surf.map((g, i) => {
      const m = surf.length;
      // fan several floaters across the surface; stagger depth so overlaps read
      const gap = m > 1 ? Math.min(sItem * 1.7, (surfaceHW * 1.5) / (m - 1)) : 0;
      const x = 100 + (i - (m - 1) / 2) * gap;
      const y = liquidTop + sItem * 0.16 + (i % 2 ? sItem * 0.22 : 0);
      const wl = liquidTop - y;
      return `<g transform="translate(${n(x)} ${n(y)})"><ellipse cx="${n(sItem * 0.16)}" cy="${n(sItem * 0.62)}" rx="${n(sItem * 0.96)}" ry="${n(sItem * 0.34)}" fill="${liquidShadow}" opacity="0.32"/>${garnishShape(g.kind, g.color, sItem)}<ellipse cx="0" cy="0" rx="${n(sItem * 1.05)}" ry="${n(sItem * 1.05)}" fill="url(#submerge-${uid})"/><ellipse cx="0" cy="${n(wl)}" rx="${n(sItem * 0.86)}" ry="${n(Math.max(1, sItem * 0.16))}" fill="none" stroke="#fff7e6" stroke-opacity="0.5" stroke-width="0.8"/><ellipse cx="0" cy="${n(wl)}" rx="${n(sItem * 0.86)}" ry="${n(Math.max(1, sItem * 0.16))}" fill="#ffffff" opacity="0.08"/></g>`;
    }).join("");

    const dustMarkup = dust
      ? Array.from({ length: 14 }, (_, i) => {
          const x = 100 + (((i * 37) % 100) / 100) * surfaceHW - surfaceHW * 0.5;
          const y = liquidTop - 1 + (((i * 53) % 30) / 30) * surfRy - surfRy * 0.4;
          return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.6 + (i % 3) * 0.3)}" fill="${dust.color}" opacity="0.6"/>`;
        }).join("")
      : "";

    return `<g${clipId ? ` clip-path="url(#${clipId})"` : ""}>
      <defs>
        <linearGradient id="submerge-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${liquidColor}" stop-opacity="0"/>
          <stop offset="42%" stop-color="${liquidColor}" stop-opacity="0"/>
          <stop offset="78%" stop-color="${liquidColor}" stop-opacity="0.42"/>
          <stop offset="100%" stop-color="${liquidShadow}" stop-opacity="0.55"/>
        </linearGradient>
      </defs>
      ${foamMarkup}${surfMarkup}${dustMarkup}
    </g>`;
  }

  // front: rim crust + tall sprigs resting on / rising from the lip
  const rimMarkup = rimG
    ? Array.from({ length: 16 }, (_, i) => {
        const t = i / 15;
        const ang = Math.PI * (0.15 + 0.7 * t);
        const x = rim.cx + Math.cos(ang) * rim.rx * (i % 2 ? 1 : 0.94);
        const y = rim.cy + Math.sin(ang) * rim.ry * 1.1;
        return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.9 + (i % 3) * 0.4)}" fill="${rimG.color}" opacity="0.9"/>`;
      }).join("")
    : "";

  const tallMarkup = tall.map((g, i) => {
    const m = tall.length;
    // fan the sprigs/sticks across the mouth like a planted bunch
    const off = m === 1 ? 0.16 : i / (m - 1) - 0.5; // -0.5..0.5 (single leans to a wall)
    const ax = 100 + off * rim.rx * 1.2;
    // plant the stalk DOWN into the drink so soft herbs like mint sit inside the
    // glass / lean on the wall; rest on the lip only when the liquid is at the brim
    const restOnRim = liquidTop <= rim.cy + 6;
    const baseY = restOnRim ? rim.cy + 1 : liquidTop - 2;
    const rot = off * 26;
    const sTall = Math.max(7, Math.min(14, surfaceHW * 0.34));
    const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
    return `<g><ellipse cx="${n(ax + 1.5)}" cy="${n(baseY + 2.5)}" rx="${n(sTall * 0.8)}" ry="${n(Math.max(1.4, sTall * 0.24))}" fill="${liquidShadow}" opacity="0.28"/><g transform="translate(${n(ax)} ${n(baseY)}) rotate(${n(rot)})"><g transform="scale(${n(grow)})">${garnishShape(g.kind, g.color, sTall)}</g></g></g>`;
  }).join("");

  return `<g>${rimMarkup}${tallMarkup}</g>`;
}
