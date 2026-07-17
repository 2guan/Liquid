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
export function garnishShape(kind: GarnishKind, color: string, s: number, fruit?: string, variant?: string): string {
  switch (kind) {
    case "citrusWheel": {
      const pulp = fruit === "bloodOrange" ? "#C5402A" : fruit === "grapefruit" ? "#F07D67" : fruit === "lime" ? "#B9D95A" : lighten(color, 0.5);
      const peel = fruit === "lime" ? "#7EA83A" : fruit === "lemon" || fruit === "yuzu" ? "#E8C84A" : color;
      const segs = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return `<line x1="0" y1="0" x2="${n(Math.cos(a) * s * 0.72)}" y2="${n(Math.sin(a) * s * 0.48)}" stroke="${darken(peel, 0.14)}" stroke-opacity="0.36" stroke-width="${n(s * 0.035)}"/>`;
      }).join("");
      return `<g><ellipse cx="${n(s * 0.06)}" cy="${n(s * 0.12)}" rx="${n(s * 1.03)}" ry="${n(s * 0.72)}" fill="${darken(peel, 0.18)}" opacity="0.55"/><ellipse rx="${n(s * 1.02)}" ry="${n(s * 0.72)}" fill="${peel}"/><ellipse rx="${n(s * 0.84)}" ry="${n(s * 0.56)}" fill="${lighten(peel, 0.74)}"/><ellipse rx="${n(s * 0.72)}" ry="${n(s * 0.48)}" fill="${pulp}" opacity="0.9"/>${segs}<ellipse rx="${n(s * 0.16)}" ry="${n(s * 0.1)}" fill="${lighten(pulp, 0.38)}" opacity="0.85"/><path d="M${n(-s * 0.8)},${n(s * 0.2)} C${n(-s * 0.32)},${n(s * 0.55)} ${n(s * 0.45)},${n(s * 0.56)} ${n(s * 0.92)},${n(s * 0.16)}" fill="none" stroke="${darken(peel, 0.28)}" stroke-opacity="0.35" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/><ellipse cx="${n(-s * 0.34)}" cy="${n(-s * 0.3)}" rx="${n(s * 0.28)}" ry="${n(s * 0.1)}" fill="#ffffff" opacity="0.36" transform="rotate(-18 ${n(-s * 0.34)} ${n(-s * 0.3)})"/></g>`;
    }
    case "cucumberSlice": {
      const seeds = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return `<ellipse cx="${n(Math.cos(a) * s * 0.32)}" cy="${n(Math.sin(a) * s * 0.32)}" rx="${n(s * 0.07)}" ry="${n(s * 0.1)}" fill="${darken(color, 0.2)}" opacity="0.5"/>`;
      }).join("");
      return `<g><circle r="${n(s)}" fill="${darken(color, 0.12)}"/><circle r="${n(s * 0.84)}" fill="${lighten(color, 0.5)}"/>${seeds}<ellipse cx="${n(-s * 0.34)}" cy="${n(-s * 0.38)}" rx="${n(s * 0.2)}" ry="${n(s * 0.1)}" fill="#ffffff" opacity="0.35" transform="rotate(-30 ${n(-s * 0.34)} ${n(-s * 0.38)})"/></g>`;
    }
    case "citrusTwist":
      if (variant === "orangePeel") {
        return `<g><path d="M${n(-s * 0.95)},${n(-s * 0.55)} C${n(-s * 0.15)},${n(-s * 1.05)} ${n(s * 0.95)},${n(-s * 0.5)} ${n(s * 0.62)},${n(s * 0.38)} C${n(s * 0.34)},${n(s * 1.1)} ${n(-s * 0.65)},${n(s * 0.8)} ${n(-s * 0.4)},${n(s * 0.05)}" fill="none" stroke="${color}" stroke-width="${n(s * 0.42)}" stroke-linecap="round"/><path d="M${n(-s * 0.72)},${n(-s * 0.47)} C${n(-s * 0.1)},${n(-s * 0.72)} ${n(s * 0.6)},${n(-s * 0.36)} ${n(s * 0.42)},${n(s * 0.3)}" fill="none" stroke="${lighten(color, 0.45)}" stroke-width="${n(s * 0.12)}" stroke-linecap="round"/><path d="M${n(-s * 0.85)},${n(-s * 0.38)} C${n(-s * 0.18)},${n(-s * 0.82)} ${n(s * 0.84)},${n(-s * 0.42)} ${n(s * 0.55)},${n(s * 0.34)}" fill="none" stroke="${darken(color, 0.22)}" stroke-opacity="0.28" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/></g>`;
      }
      if (variant === "grapefruitPeel") {
        return `<g><path d="M${n(-s * 0.82)},${n(-s * 0.8)} C${n(s * 0.6)},${n(-s * 1)} ${n(s * 0.9)},${n(s * 0.2)} ${n(-s * 0.2)},${n(s * 0.92)}" fill="none" stroke="${color}" stroke-width="${n(s * 0.34)}" stroke-linecap="round"/><path d="M${n(-s * 0.78)},${n(-s * 0.78)} C${n(s * 0.52)},${n(-s * 0.86)} ${n(s * 0.7)},${n(s * 0.12)} ${n(-s * 0.16)},${n(s * 0.76)}" fill="none" stroke="#F6C4B6" stroke-width="${n(s * 0.13)}" stroke-linecap="round"/></g>`;
      }
      return `<g><path d="M${n(-s * 0.7)},${n(-s)} C${n(s * 0.7)},${n(-s)} ${n(s * 0.8)},${n(s * 0.6)} ${n(-s * 0.2)},${n(s)} C${n(-s * 0.9)},${n(s * 1.2)} ${n(-s)},${n(s * 0.2)} ${n(-s * 0.45)},0" fill="none" stroke="${color}" stroke-width="${n(s * 0.42)}" stroke-linecap="round"/><path d="M${n(-s * 0.7)},${n(-s)} C${n(s * 0.7)},${n(-s)} ${n(s * 0.8)},${n(s * 0.6)} ${n(-s * 0.2)},${n(s)}" fill="none" stroke="${lighten(color, 0.45)}" stroke-width="${n(s * 0.16)}" stroke-linecap="round"/></g>`;
    case "berry": {
      if (fruit === "grape") {
        const grapes: [number, number][] = [[-0.42, -0.25], [0.12, -0.36], [0.48, 0.04], [-0.15, 0.2], [0.32, 0.5]];
        return `<g><path d="M${n(-s * 0.1)},${n(-s * 0.88)} C${n(s * 0.2)},${n(-s * 0.6)} ${n(s * 0.28)},${n(-s * 0.36)} ${n(s * 0.12)},${n(-s * 0.2)}" fill="none" stroke="#6E7A3A" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>${grapes.map(([x, y], i) => `<g><circle cx="${n(x * s)}" cy="${n(y * s)}" r="${n(s * 0.34)}" fill="${i % 2 ? lighten(color, 0.08) : color}"/><circle cx="${n(x * s)}" cy="${n(y * s)}" r="${n(s * 0.34)}" fill="none" stroke="${darken(color, 0.28)}" stroke-opacity="0.36" stroke-width="${n(s * 0.04)}"/><circle cx="${n(x * s - s * 0.11)}" cy="${n(y * s - s * 0.13)}" r="${n(s * 0.07)}" fill="#ffffff" opacity="0.42"/></g>`).join("")}</g>`;
      }
      if (fruit === "strawberry") {
        const seeds: [number, number][] = [[-0.28, -0.12], [0.12, -0.1], [-0.12, 0.22], [0.28, 0.25], [0, 0.48]];
        return `<g><path d="M0,${n(s * 0.95)} C${n(-s * 0.95)},${n(s * 0.25)} ${n(-s * 0.78)},${n(-s * 0.78)} 0,${n(-s * 0.68)} C${n(s * 0.78)},${n(-s * 0.78)} ${n(s * 0.95)},${n(s * 0.25)} 0,${n(s * 0.95)} Z" fill="${color}" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.05)}"/><path d="M${n(-s * 0.42)},${n(-s * 0.62)} L${n(-s * 0.12)},${n(-s * 0.38)} L0,${n(-s * 0.72)} L${n(s * 0.14)},${n(-s * 0.38)} L${n(s * 0.46)},${n(-s * 0.62)}" fill="#5A8A3A" stroke="${darken("#5A8A3A", 0.2)}" stroke-width="${n(s * 0.035)}"/>${seeds.map(([x, y], i) => `<ellipse cx="${n(x * s)}" cy="${n(y * s)}" rx="${n(s * 0.045)}" ry="${n(s * 0.08)}" fill="#F4D38A" opacity="0.8" transform="rotate(${i % 2 ? -22 : 18} ${n(x * s)} ${n(y * s)})"/>`).join("")}<ellipse cx="${n(-s * 0.25)}" cy="${n(-s * 0.12)}" rx="${n(s * 0.18)}" ry="${n(s * 0.34)}" fill="#ffffff" opacity="0.24" transform="rotate(-28 ${n(-s * 0.25)} ${n(-s * 0.12)})"/></g>`;
      }
      if (fruit === "raspberry" || fruit === "blackberry") {
        const cells: [number, number][] = [[0, -0.42], [-0.34, -0.14], [0.34, -0.14], [-0.28, 0.28], [0.22, 0.3], [0, 0.02]];
        return `<g>${cells.map(([x, y], i) => `<circle cx="${n(x * s)}" cy="${n(y * s)}" r="${n(s * 0.28)}" fill="${i % 2 ? lighten(color, 0.1) : color}" stroke="${darken(color, 0.25)}" stroke-opacity="0.3" stroke-width="${n(s * 0.035)}"/>`).join("")}<circle cx="${n(-s * 0.15)}" cy="${n(-s * 0.28)}" r="${n(s * 0.08)}" fill="#ffffff" opacity="0.35"/></g>`;
      }
      if (fruit === "pomegranate") {
        const arils: [number, number][] = [[-0.42, -0.12], [-0.08, -0.28], [0.3, -0.08], [-0.24, 0.28], [0.2, 0.28], [0.5, 0.22]];
        return `<g>${arils.map(([x, y], i) => `<path d="M${n(x * s)},${n((y - 0.18) * s)} C${n((x + 0.22) * s)},${n((y - 0.06) * s)} ${n((x + 0.18) * s)},${n((y + 0.2) * s)} ${n(x * s)},${n((y + 0.24) * s)} C${n((x - 0.22) * s)},${n((y + 0.18) * s)} ${n((x - 0.18) * s)},${n((y - 0.08) * s)} ${n(x * s)},${n((y - 0.18) * s)} Z" fill="${i % 2 ? lighten(color, 0.12) : color}" opacity="0.9"/>`).join("")}</g>`;
      }
      const dots = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return `<ellipse cx="${n(Math.cos(a) * s * 0.28)}" cy="${n(Math.sin(a) * s * 0.2)}" rx="${n(s * 0.08)}" ry="${n(s * 0.05)}" fill="${darken(color, 0.22)}" opacity="0.4"/>`;
      }).join("");
      return `<g><ellipse rx="${n(s * 0.78)}" ry="${n(s * 0.7)}" fill="${color}"/><ellipse rx="${n(s * 0.78)}" ry="${n(s * 0.7)}" fill="none" stroke="${darken(color, 0.28)}" stroke-opacity="0.42" stroke-width="${n(s * 0.05)}"/>${dots}<path d="M${n(-s * 0.16)},${n(-s * 0.62)} C${n(s * 0.08)},${n(-s * 0.78)} ${n(s * 0.3)},${n(-s * 0.62)} ${n(s * 0.26)},${n(-s * 0.38)}" fill="none" stroke="${darken(color, 0.35)}" stroke-width="${n(s * 0.05)}" stroke-linecap="round"/><circle cx="${n(-s * 0.24)}" cy="${n(-s * 0.28)}" r="${n(s * 0.14)}" fill="#ffffff" opacity="0.48"/></g>`;
    }
    case "cherry":
      return `<g><path d="M${n(s * 0.2)},${n(-s * 1.7)} C${n(s * 0.1)},${n(-s * 0.9)} ${n(-s * 0.1)},${n(-s * 0.6)} 0,${n(-s * 0.55)}" fill="none" stroke="#6E5A2A" stroke-width="${n(s * 0.12)}" stroke-linecap="round"/><circle r="${n(s * 0.7)}" fill="${color}"/><circle r="${n(s * 0.7)}" fill="none" stroke="${darken(color, 0.3)}" stroke-opacity="0.5" stroke-width="${n(s * 0.06)}"/><circle cx="${n(-s * 0.26)}" cy="${n(-s * 0.26)}" r="${n(s * 0.16)}" fill="#ffffff" opacity="0.55"/></g>`;
    case "fruitSlice": {
      if (fruit === "watermelon") {
        return `<g><path d="M${n(-s * 1.02)},${n(s * 0.48)} Q0,${n(s * 1.06)} ${n(s * 1.02)},${n(s * 0.48)} L0,${n(-s * 0.82)} Z" fill="#E0566A" stroke="${darken("#E0566A", 0.24)}" stroke-width="${n(s * 0.05)}"/><path d="M${n(-s * 1.02)},${n(s * 0.48)} Q0,${n(s * 1.06)} ${n(s * 1.02)},${n(s * 0.48)}" fill="none" stroke="#6EA84A" stroke-width="${n(s * 0.24)}" stroke-linecap="round"/><path d="M${n(-s * 0.9)},${n(s * 0.42)} Q0,${n(s * 0.88)} ${n(s * 0.9)},${n(s * 0.42)}" fill="none" stroke="#DDE5A8" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>${[[-0.28, -0.05], [0.18, 0.08], [0, 0.35]].map(([x, y], i) => `<ellipse cx="${n(x * s)}" cy="${n(y * s)}" rx="${n(s * 0.045)}" ry="${n(s * 0.1)}" fill="#3A1B18" transform="rotate(${i % 2 ? 18 : -14} ${n(x * s)} ${n(y * s)})"/>`).join("")}</g>`;
      }
      if (fruit === "lychee") {
        return `<g><path d="M${n(-s * 0.8)},${n(-s * 0.12)} C${n(-s * 0.62)},${n(-s * 0.88)} ${n(s * 0.38)},${n(-s * 0.9)} ${n(s * 0.78)},${n(-s * 0.24)} C${n(s * 0.98)},${n(s * 0.42)} ${n(s * 0.24)},${n(s * 0.88)} ${n(-s * 0.42)},${n(s * 0.7)} C${n(-s * 0.95)},${n(s * 0.55)} ${n(-s * 1.05)},${n(s * 0.18)} ${n(-s * 0.8)},${n(-s * 0.12)} Z" fill="#F6E6DC" stroke="#E8C8B8" stroke-width="${n(s * 0.07)}"/><path d="M${n(-s * 0.42)},${n(-s * 0.16)} C${n(-s * 0.12)},${n(-s * 0.4)} ${n(s * 0.38)},${n(-s * 0.35)} ${n(s * 0.52)},${n(s * 0.02)} C${n(s * 0.36)},${n(s * 0.34)} ${n(-s * 0.04)},${n(s * 0.44)} ${n(-s * 0.32)},${n(s * 0.25)}" fill="none" stroke="#ffffff" stroke-opacity="0.52" stroke-width="${n(s * 0.12)}" stroke-linecap="round"/><ellipse cx="${n(s * 0.2)}" cy="${n(s * 0.18)}" rx="${n(s * 0.22)}" ry="${n(s * 0.16)}" fill="#7A342A" opacity="0.18"/></g>`;
      }
      if (fruit === "coconut") {
        return `<g>${[-0.52, 0, 0.52].map((x, i) => `<g transform="translate(${n(x * s)} ${n(i % 2 ? -s * 0.04 : s * 0.04)}) rotate(${i === 0 ? -12 : i === 2 ? 12 : 0})"><path d="M${n(-s * 0.14)},${n(-s * 0.82)} C${n(s * 0.18)},${n(-s * 0.34)} ${n(s * 0.2)},${n(s * 0.4)} ${n(-s * 0.08)},${n(s * 0.86)} C${n(-s * 0.28)},${n(s * 0.42)} ${n(-s * 0.32)},${n(-s * 0.32)} ${n(-s * 0.14)},${n(-s * 0.82)} Z" fill="#F4E8D4" stroke="#8A5A34" stroke-width="${n(s * 0.06)}"/><path d="M${n(-s * 0.11)},${n(-s * 0.72)} C${n(s * 0.04)},${n(-s * 0.2)} ${n(s * 0.03)},${n(s * 0.34)} ${n(-s * 0.08)},${n(s * 0.72)}" fill="none" stroke="#ffffff" stroke-opacity="0.48" stroke-width="${n(s * 0.06)}"/></g>`).join("")}</g>`;
      }
      if (fruit === "fig") {
        const seeds = Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2;
          const r = s * (0.16 + (i % 4) * 0.08);
          return `<circle cx="${n(Math.cos(a) * r * 0.9)}" cy="${n(Math.sin(a) * r * 0.6 + s * 0.08)}" r="${n(s * 0.025)}" fill="#F7D28C" opacity="0.9"/>`;
        }).join("");
        return `<g><path d="M0,${n(-s)} C${n(s * 0.9)},${n(-s * 0.52)} ${n(s * 0.72)},${n(s * 0.85)} 0,${n(s * 1.02)} C${n(-s * 0.72)},${n(s * 0.85)} ${n(-s * 0.9)},${n(-s * 0.52)} 0,${n(-s)} Z" fill="#6E3A2A"/><path d="M0,${n(-s * 0.72)} C${n(s * 0.62)},${n(-s * 0.34)} ${n(s * 0.46)},${n(s * 0.62)} 0,${n(s * 0.78)} C${n(-s * 0.46)},${n(s * 0.62)} ${n(-s * 0.62)},${n(-s * 0.34)} 0,${n(-s * 0.72)} Z" fill="#C45A65"/><ellipse cy="${n(s * 0.08)}" rx="${n(s * 0.3)}" ry="${n(s * 0.42)}" fill="#E8B46A" opacity="0.68"/>${seeds}<path d="M${n(-s * 0.42)},${n(-s * 0.48)} C${n(-s * 0.54)},${n(s * 0.05)} ${n(-s * 0.42)},${n(s * 0.46)} ${n(-s * 0.12)},${n(s * 0.68)}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/></g>`;
      }
      if (fruit === "guava") {
        const seeds: [number, number][] = [[-0.26, -0.05], [0.06, -0.16], [0.28, 0.1], [-0.08, 0.22], [0.1, 0.34]];
        return `<g><path d="M${n(-s * 0.9)},${n(-s * 0.42)} C${n(-s * 0.34)},${n(-s * 0.92)} ${n(s * 0.82)},${n(-s * 0.54)} ${n(s * 0.86)},${n(s * 0.12)} C${n(s * 0.76)},${n(s * 0.72)} ${n(-s * 0.46)},${n(s * 0.9)} ${n(-s * 0.88)},${n(s * 0.32)} Z" fill="#7EA84A" stroke="${darken("#7EA84A", 0.2)}" stroke-width="${n(s * 0.05)}"/><path d="M${n(-s * 0.68)},${n(-s * 0.3)} C${n(-s * 0.25)},${n(-s * 0.66)} ${n(s * 0.58)},${n(-s * 0.38)} ${n(s * 0.6)},${n(s * 0.08)} C${n(s * 0.5)},${n(s * 0.5)} ${n(-s * 0.34)},${n(s * 0.66)} ${n(-s * 0.62)},${n(s * 0.22)} Z" fill="#E98A7A"/>${seeds.map(([x, y]) => `<circle cx="${n(x * s)}" cy="${n(y * s)}" r="${n(s * 0.035)}" fill="#F3D79B"/>`).join("")}<ellipse cx="${n(-s * 0.22)}" cy="${n(-s * 0.28)}" rx="${n(s * 0.22)}" ry="${n(s * 0.08)}" fill="#ffffff" opacity="0.26" transform="rotate(-18 ${n(-s * 0.22)} ${n(-s * 0.28)})"/></g>`;
      }
      if (fruit === "pineapple") {
        const grid = [-0.4, 0, 0.4].map((x, i) => `<line x1="${n(x * s)}" y1="${n(-s * 0.55)}" x2="${n((x + 0.42) * s)}" y2="${n(s * 0.72)}" stroke="${darken(color, 0.18)}" stroke-opacity="0.36" stroke-width="${n(s * 0.035)}"/>`).join("");
        return `<g><path d="M${n(-s * 0.82)},${n(s * 0.76)} L${n(s * 0.88)},${n(s * 0.44)} L${n(s * 0.2)},${n(-s * 0.86)} L${n(-s * 0.9)},${n(-s * 0.35)} Z" fill="${color}" stroke="${darken(color, 0.22)}" stroke-width="${n(s * 0.05)}"/><path d="M${n(-s * 0.9)},${n(-s * 0.35)} L${n(-s * 0.82)},${n(s * 0.76)}" stroke="#7E8A3A" stroke-width="${n(s * 0.16)}" stroke-linecap="round"/>${grid}<line x1="${n(-s * 0.58)}" y1="${n(s * 0.58)}" x2="${n(s * 0.56)}" y2="${n(-s * 0.02)}" stroke="${darken(color, 0.18)}" stroke-opacity="0.3" stroke-width="${n(s * 0.035)}"/><ellipse cx="${n(-s * 0.2)}" cy="${n(-s * 0.28)}" rx="${n(s * 0.22)}" ry="${n(s * 0.08)}" fill="#ffffff" opacity="0.24" transform="rotate(-25 ${n(-s * 0.2)} ${n(-s * 0.28)})"/></g>`;
      }
      if (fruit === "apple" || fruit === "pear") {
        const skin = fruit === "apple" ? "#A8C24A" : "#C9D08A";
        const d = fruit === "pear"
          ? `M0,${n(-s)} C${n(s * 0.7)},${n(-s * 0.55)} ${n(s * 0.62)},${n(s * 0.7)} 0,${n(s)} C${n(-s * 0.62)},${n(s * 0.7)} ${n(-s * 0.7)},${n(-s * 0.55)} 0,${n(-s)} Z`
          : `M0,${n(-s * 0.9)} C${n(s * 0.82)},${n(-s * 0.72)} ${n(s * 0.82)},${n(s * 0.72)} 0,${n(s * 0.9)} C${n(-s * 0.82)},${n(s * 0.72)} ${n(-s * 0.82)},${n(-s * 0.72)} 0,${n(-s * 0.9)} Z`;
        return `<g><path d="${d}" fill="${lighten(skin, 0.55)}" stroke="${skin}" stroke-width="${n(s * 0.12)}"/><path d="M0,${n(-s * 0.7)} C${n(s * 0.18)},${n(-s * 0.12)} ${n(s * 0.18)},${n(s * 0.42)} 0,${n(s * 0.68)}" fill="none" stroke="#B78A4A" stroke-opacity="0.45" stroke-width="${n(s * 0.045)}"/><ellipse cx="${n(s * 0.15)}" cy="${n(s * 0.22)}" rx="${n(s * 0.05)}" ry="${n(s * 0.1)}" fill="#5A3320" transform="rotate(15 ${n(s * 0.15)} ${n(s * 0.22)})"/><ellipse cx="${n(-s * 0.22)}" cy="${n(-s * 0.28)}" rx="${n(s * 0.18)}" ry="${n(s * 0.08)}" fill="#ffffff" opacity="0.28" transform="rotate(-25 ${n(-s * 0.22)} ${n(-s * 0.28)})"/></g>`;
      }
      if (fruit === "peach" || fruit === "apricot" || fruit === "plum" || fruit === "mango" || fruit === "melon") {
        const flesh = fruit === "plum" ? "#B65A7A" : fruit === "melon" ? "#F2B878" : lighten(color, 0.28);
        return `<g><path d="M${n(-s * 0.9)},${n(s * 0.3)} C${n(-s * 0.8)},${n(-s * 0.65)} ${n(s * 0.62)},${n(-s * 0.92)} ${n(s * 0.86)},${n(s * 0.02)} C${n(s * 0.92)},${n(s * 0.68)} ${n(-s * 0.36)},${n(s * 0.9)} ${n(-s * 0.9)},${n(s * 0.3)} Z" fill="${flesh}" stroke="${color}" stroke-width="${n(s * 0.08)}"/><path d="M${n(-s * 0.5)},${n(s * 0.36)} C${n(-s * 0.16)},${n(s * 0.08)} ${n(s * 0.08)},${n(s * 0.08)} ${n(s * 0.34)},${n(s * 0.32)}" fill="none" stroke="${darken(color, 0.22)}" stroke-opacity="0.42" stroke-width="${n(s * 0.055)}" stroke-linecap="round"/><ellipse cx="${n(-s * 0.24)}" cy="${n(-s * 0.28)}" rx="${n(s * 0.22)}" ry="${n(s * 0.08)}" fill="#ffffff" opacity="0.26" transform="rotate(-20 ${n(-s * 0.24)} ${n(-s * 0.28)})"/></g>`;
      }
      return `<g><path d="M${n(-s * 0.88)},${n(s * 0.45)} C${n(-s * 0.72)},${n(-s * 0.44)} ${n(s * 0.54)},${n(-s * 0.78)} ${n(s * 0.86)},${n(s * 0.04)} C${n(s * 0.92)},${n(s * 0.64)} ${n(-s * 0.38)},${n(s * 0.9)} ${n(-s * 0.88)},${n(s * 0.45)} Z" fill="${lighten(color, 0.45)}" stroke="${color}" stroke-width="${n(s * 0.1)}" stroke-linejoin="round"/><path d="M${n(-s * 0.7)},${n(s * 0.46)} C${n(-s * 0.24)},${n(s * 0.7)} ${n(s * 0.48)},${n(s * 0.52)} ${n(s * 0.72)},${n(s * 0.08)}" fill="none" stroke="${darken(color, 0.14)}" stroke-width="${n(s * 0.11)}" stroke-linecap="round"/><ellipse cx="${n(-s * 0.36)}" cy="${n(-s * 0.18)}" rx="${n(s * 0.14)}" ry="${n(s * 0.24)}" fill="#ffffff" opacity="0.28" transform="rotate(40 ${n(-s * 0.36)} ${n(-s * 0.18)})"/></g>`;
    }
    case "mintSprig": {
      const leaf = (lx: number, ly: number, rot: number, sc: number) =>
        `<g transform="translate(${n(lx)} ${n(ly)}) rotate(${n(rot)}) scale(${n(sc)})"><path d="${variant === "verbena" ? `M0,0 C${n(s * 0.34)},${n(-s * 0.42)} ${n(s * 0.24)},${n(-s * 1.18)} 0,${n(-s * 1.55)} C${n(-s * 0.24)},${n(-s * 1.18)} ${n(-s * 0.34)},${n(-s * 0.42)} 0,0 Z` : variant === "lemonBalm" ? `M0,0 C${n(s * 0.62)},${n(-s * 0.26)} ${n(s * 0.62)},${n(-s * 0.84)} 0,${n(-s)} C${n(-s * 0.62)},${n(-s * 0.84)} ${n(-s * 0.62)},${n(-s * 0.26)} 0,0 Z` : `M0,0 C${n(s * 0.55)},${n(-s * 0.2)} ${n(s * 0.55)},${n(-s * 0.9)} 0,${n(-s * 1.15)} C${n(-s * 0.55)},${n(-s * 0.9)} ${n(-s * 0.55)},${n(-s * 0.2)} 0,0 Z`}" fill="${variant === "spearmint" ? lighten(color, 0.06) : color}"/><path d="M0,0 L0,${n(-s * 1.05)}" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.05)}"/>${variant === "spearmint" ? `<path d="M${n(-s * 0.24)},${n(-s * 0.36)} L${n(s * 0.24)},${n(-s * 0.52)} M${n(-s * 0.2)},${n(-s * 0.66)} L${n(s * 0.2)},${n(-s * 0.8)}" stroke="${darken(color, 0.16)}" stroke-opacity="0.45" stroke-width="${n(s * 0.035)}"/>` : ""}</g>`;
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
      if (variant === "tarragon") {
        const blades = Array.from({ length: 9 }, (_, i) => {
          const y = -s * 0.28 - i * s * 0.24;
          const side = i % 2 === 0 ? 1 : -1;
          return `<path d="M0,${n(y)} C${n(side * s * 0.34)},${n(y - s * 0.12)} ${n(side * s * 0.54)},${n(y - s * 0.44)} ${n(side * s * 0.16)},${n(y - s * 0.62)}" fill="none" stroke="${color}" stroke-width="${n(s * 0.09)}" stroke-linecap="round"/>`;
        }).join("");
        return `<g><path d="M0,0 C${n(s * 0.08)},${n(-s * 0.9)} ${n(-s * 0.05)},${n(-s * 1.8)} 0,${n(-s * 2.5)}" fill="none" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>${blades}</g>`;
      }
      const leaves = Array.from({ length: 11 }, (_, i) => {
        const y = -s * 0.3 - i * s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        return `<ellipse cx="${n(side * s * 0.14)}" cy="${n(y)}" rx="${n(s * 0.17)}" ry="${n(s * 0.09)}" fill="${i % 3 === 0 ? lighten(color, 0.12) : color}" transform="rotate(${n(side * 34)} ${n(side * s * 0.14)} ${n(y)})"/>`;
      }).join("");
      return `<g><path d="M0,0 C${n(s * 0.06)},${n(-s)} ${n(-s * 0.06)},${n(-s * 1.8)} ${n(s * 0.04)},${n(-s * 2.4)}" fill="none" stroke="${darken(color, 0.22)}" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/>${leaves}</g>`;
    }
    case "dillSprig": {
      if (variant === "fennel") {
        const umbels = Array.from({ length: 6 }, (_, i) => {
          const a = -80 + i * 32;
          const x = Math.cos((a * Math.PI) / 180) * s * 0.78;
          const y = -s * 2.05 + Math.sin((a * Math.PI) / 180) * s * 0.5;
          return `<g><line x1="0" y1="${n(-s * 1.35)}" x2="${n(x)}" y2="${n(y)}" stroke="${color}" stroke-width="${n(s * 0.045)}"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(s * 0.08)}" fill="${lighten(color, 0.16)}"/></g>`;
        }).join("");
        return `<g><path d="M0,0 C${n(s * 0.04)},${n(-s * 0.8)} ${n(-s * 0.02)},${n(-s * 1.4)} 0,${n(-s * 2.1)}" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.07)}" fill="none" stroke-linecap="round"/>${umbels}</g>`;
      }
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
      if (variant === "lemongrass") {
        return `<g>${[-0.42, -0.18, 0.08, 0.32].map((x, i) => `<path d="M${n(x * s)},${n(s * 0.9)} C${n((x + 0.06) * s)},${n(s * 0.1)} ${n((x + (i % 2 ? -0.28 : 0.28)) * s)},${n(-s * 0.55)} ${n((x + (i % 2 ? -0.18 : 0.18)) * s)},${n(-s * 1.28)}" fill="none" stroke="${i % 2 ? darken(color, 0.05) : color}" stroke-width="${n(s * 0.12)}" stroke-linecap="round"/>`).join("")}</g>`;
      }
      if (variant === "pandan") {
        return `<g>${[-0.34, 0.08, 0.42].map((x, i) => `<path d="M${n(x * s)},${n(s * 1)} C${n((x - 0.14) * s)},${n(s * 0.22)} ${n((x + (i === 1 ? 0.18 : -0.12)) * s)},${n(-s * 0.58)} ${n((x + (i === 2 ? 0.02 : -0.22)) * s)},${n(-s * 1.32)}" fill="none" stroke="${i === 1 ? lighten(color, 0.08) : color}" stroke-width="${n(s * 0.18)}" stroke-linecap="round"/>`).join("")}<path d="M${n(-s * 0.18)},${n(s * 0.78)} C${n(-s * 0.05)},${n(s * 0.08)} ${n(-s * 0.02)},${n(-s * 0.55)} ${n(-s * 0.14)},${n(-s * 1.08)}" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="${n(s * 0.06)}" stroke-linecap="round"/></g>`;
      }
      if (variant === "aloe") {
        return `<g><path d="M${n(-s * 0.52)},${n(s * 1.05)} C${n(-s * 0.16)},${n(s * 0.1)} ${n(-s * 0.12)},${n(-s * 0.78)} 0,${n(-s * 1.22)} C${n(s * 0.16)},${n(-s * 0.7)} ${n(s * 0.34)},${n(s * 0.24)} ${n(s * 0.5)},${n(s * 1.05)} Z" fill="${lighten(color, 0.2)}" stroke="${darken(color, 0.22)}" stroke-width="${n(s * 0.06)}"/><path d="M0,${n(-s)} C${n(s * 0.02)},${n(-s * 0.28)} ${n(s * 0.06)},${n(s * 0.42)} ${n(s * 0.18)},${n(s * 0.92)}" fill="none" stroke="#ffffff" stroke-opacity="0.32" stroke-width="${n(s * 0.08)}" stroke-linecap="round"/></g>`;
      }
      if (variant === "hops") {
        return `<g>${[0, 1, 2, 3].map((row) => `<path d="M${n(-s * (0.15 + row * 0.08))},${n(-s * 0.7 + row * s * 0.38)} C${n(-s * 0.78)},${n(-s * 0.44 + row * s * 0.36)} ${n(-s * 0.42)},${n(s * 0.02 + row * s * 0.22)} 0,${n(-s * 0.15 + row * s * 0.32)} C${n(s * 0.42)},${n(s * 0.02 + row * s * 0.22)} ${n(s * 0.78)},${n(-s * 0.44 + row * s * 0.36)} ${n(s * (0.15 + row * 0.08))},${n(-s * 0.7 + row * s * 0.38)} Z" fill="${row % 2 ? lighten(color, 0.1) : color}" opacity="0.92"/>`).join("")}</g>`;
      }
      if (variant === "cilantro") {
        return `<g><path d="M0,${n(s * 0.95)} C${n(-s * 0.12)},0 ${n(s * 0.08)},${n(-s * 0.52)} 0,${n(-s)}" fill="none" stroke="${darken(color, 0.22)}" stroke-width="${n(s * 0.08)}"/>${[-0.52, 0, 0.52].map((x, i) => `<circle cx="${n(x * s * 0.55)}" cy="${n(-s * (0.28 + i * 0.18))}" r="${n(s * 0.34)}" fill="${i === 1 ? lighten(color, 0.12) : color}"/>`).join("")}</g>`;
      }
      if (variant === "shiso") {
        const teeth = Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 ? s * 1.05 : s * 0.86;
          return `${n(Math.cos(a) * r)},${n(Math.sin(a) * r)}`;
        }).join(" ");
        return `<g><polygon points="${teeth}" fill="${color}" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.04)}"/><path d="M0,${n(s * 0.92)} L0,${n(-s * 0.86)} M0,0 L${n(-s * 0.55)},${n(-s * 0.36)} M0,0 L${n(s * 0.55)},${n(-s * 0.36)}" stroke="${darken(color, 0.24)}" stroke-opacity="0.55" stroke-width="${n(s * 0.055)}"/></g>`;
      }
      if (variant === "wormwood") {
        const bits = Array.from({ length: 9 }, (_, i) => {
          const y = s * 0.55 - i * s * 0.2;
          const side = i % 2 ? -1 : 1;
          return `<path d="M0,${n(y)} C${n(side * s * 0.24)},${n(y - s * 0.08)} ${n(side * s * 0.4)},${n(y - s * 0.26)} ${n(side * s * 0.18)},${n(y - s * 0.42)}" fill="none" stroke="${lighten(color, 0.08)}" stroke-width="${n(s * 0.07)}" stroke-linecap="round"/>`;
        }).join("");
        return `<g><path d="M0,${n(s * 0.95)} C${n(-s * 0.08)},${n(s * 0.2)} ${n(s * 0.08)},${n(-s * 0.6)} 0,${n(-s)}" fill="none" stroke="${darken(color, 0.2)}" stroke-width="${n(s * 0.07)}"/>${bits}</g>`;
      }
      return `<g><path d="M0,${n(s)} C${n(s * 0.9)},${n(s * 0.3)} ${n(s * 0.9)},${n(-s * 0.7)} 0,${n(-s)} C${n(-s * 0.9)},${n(-s * 0.7)} ${n(-s * 0.9)},${n(s * 0.3)} 0,${n(s)} Z" fill="${color}"/><path d="M0,${n(s)} L0,${n(-s)}" stroke="${darken(color, 0.28)}" stroke-width="${n(s * 0.06)}"/></g>`;
    case "flower": {
      if (variant === "chamomile") {
        return `<g>${Array.from({ length: 11 }, (_, i) => `<ellipse cx="0" cy="${n(-s * 0.58)}" rx="${n(s * 0.16)}" ry="${n(s * 0.48)}" fill="#F7F0DE" transform="rotate(${n((i / 11) * 360)})"/>`).join("")}<circle r="${n(s * 0.28)}" fill="#E0B85A"/><circle r="${n(s * 0.18)}" fill="#A8742A" opacity="0.35"/></g>`;
      }
      if (variant === "rose") {
        return `<g>${[0, 1, 2, 3, 4].map((i) => `<path d="M0,0 C${n(s * 0.55)},${n(-s * 0.18)} ${n(s * 0.45)},${n(-s * 0.78)} 0,${n(-s * 0.88)} C${n(-s * 0.45)},${n(-s * 0.78)} ${n(-s * 0.55)},${n(-s * 0.18)} 0,0 Z" fill="${i % 2 ? lighten(color, 0.08) : color}" opacity="0.92" transform="rotate(${i * 72}) scale(${n(1 - i * 0.05)})"/>`).join("")}<path d="M${n(-s * 0.32)},0 C${n(-s * 0.1)},${n(-s * 0.34)} ${n(s * 0.28)},${n(-s * 0.18)} ${n(s * 0.08)},${n(s * 0.12)}" fill="none" stroke="${darken(color, 0.24)}" stroke-opacity="0.45" stroke-width="${n(s * 0.06)}"/></g>`;
      }
      if (variant === "jasmine") {
        return `<g>${Array.from({ length: 5 }, (_, i) => `<path d="M0,0 C${n(s * 0.32)},${n(-s * 0.18)} ${n(s * 0.28)},${n(-s * 0.82)} 0,${n(-s * 1.02)} C${n(-s * 0.28)},${n(-s * 0.82)} ${n(-s * 0.32)},${n(-s * 0.18)} 0,0 Z" fill="#F4F0D8" transform="rotate(${i * 72 + 12})"/>`).join("")}<circle r="${n(s * 0.16)}" fill="#D8C86A"/></g>`;
      }
      if (variant === "osmanthus") {
        const clusters: [number, number][] = [[-0.45, -0.2], [0.25, -0.32], [0.42, 0.28], [-0.18, 0.38], [0, 0]];
        return `<g>${clusters.map(([x, y]) => `<g transform="translate(${n(x * s)} ${n(y * s)}) scale(0.55)">${Array.from({ length: 4 }, (_, j) => `<ellipse cx="0" cy="${n(-s * 0.26)}" rx="${n(s * 0.13)}" ry="${n(s * 0.26)}" fill="#E0B85A" transform="rotate(${j * 90})"/>`).join("")}</g>`).join("")}</g>`;
      }
      if (variant === "violet") {
        return `<g><ellipse cx="${n(-s * 0.28)}" cy="${n(-s * 0.18)}" rx="${n(s * 0.34)}" ry="${n(s * 0.45)}" fill="${color}" transform="rotate(-28 ${n(-s * 0.28)} ${n(-s * 0.18)})"/><ellipse cx="${n(s * 0.28)}" cy="${n(-s * 0.18)}" rx="${n(s * 0.34)}" ry="${n(s * 0.45)}" fill="${lighten(color, 0.08)}" transform="rotate(28 ${n(s * 0.28)} ${n(-s * 0.18)})"/><ellipse cy="${n(s * 0.2)}" rx="${n(s * 0.42)}" ry="${n(s * 0.35)}" fill="${darken(color, 0.06)}"/><circle r="${n(s * 0.12)}" fill="#E0B85A"/></g>`;
      }
      if (variant === "elderflower") {
        return `<g>${Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const x = Math.cos(a) * s * 0.46;
          const y = Math.sin(a) * s * 0.34;
          return `<g transform="translate(${n(x)} ${n(y)}) scale(0.45)">${Array.from({ length: 5 }, (_, j) => `<ellipse cx="0" cy="${n(-s * 0.3)}" rx="${n(s * 0.12)}" ry="${n(s * 0.28)}" fill="#F0EBCF" transform="rotate(${j * 72})"/>`).join("")}<circle r="${n(s * 0.1)}" fill="#D8C86A"/></g>`;
        }).join("")}</g>`;
      }
      const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * 360;
        return `<ellipse cx="0" cy="${n(-s * 0.55)}" rx="${n(s * 0.28)}" ry="${n(s * 0.55)}" fill="${color}" opacity="0.92" transform="rotate(${n(a)})"/>`;
      }).join("");
      return `<g>${petals}<circle r="${n(s * 0.26)}" fill="${lighten(color, 0.5)}"/></g>`;
    }
    case "cinnamonStick": {
      const body = `<path d="M${n(-s * 0.56)},${n(-s * 2.48)} C${n(-s * 0.72)},${n(-s * 1.82)} ${n(-s * 0.64)},${n(-s * 0.68)} ${n(-s * 0.48)},${n(s * 0.08)} C${n(-s * 0.22)},${n(s * 0.24)} ${n(s * 0.3)},${n(s * 0.16)} ${n(s * 0.52)},${n(-s * 0.08)} C${n(s * 0.42)},${n(-s * 0.82)} ${n(s * 0.58)},${n(-s * 1.74)} ${n(s * 0.46)},${n(-s * 2.46)} C${n(s * 0.18)},${n(-s * 2.34)} ${n(-s * 0.22)},${n(-s * 2.32)} ${n(-s * 0.56)},${n(-s * 2.48)} Z" fill="${color}"/>`;
      const rolledEdge = `<path d="M${n(-s * 0.5)},${n(-s * 2.42)} C${n(-s * 0.32)},${n(-s * 2.6)} ${n(s * 0.18)},${n(-s * 2.62)} ${n(s * 0.42)},${n(-s * 2.42)} C${n(s * 0.1)},${n(-s * 2.47)} ${n(-s * 0.22)},${n(-s * 2.42)} ${n(-s * 0.42)},${n(-s * 2.27)} Z" fill="${darken(color, 0.34)}" opacity="0.78"/>`;
      const innerCurl = `<path d="M${n(-s * 0.5)},${n(-s * 2.16)} C${n(-s * 0.62)},${n(-s * 1.48)} ${n(-s * 0.52)},${n(-s * 0.56)} ${n(-s * 0.34)},${n(-s * 0.02)} C${n(-s * 0.2)},${n(s * 0.1)} ${n(-s * 0.06)},${n(s * 0.1)} ${n(s * 0.08)},${n(-s * 0.02)} C${n(-s * 0.08)},${n(-s * 0.66)} ${n(-s * 0.14)},${n(-s * 1.5)} ${n(-s * 0.06)},${n(-s * 2.18)} Z" fill="${darken(color, 0.18)}" opacity="0.52"/>`;
      const highlight = `<path d="M${n(-s * 0.58)},${n(-s * 2.38)} C${n(-s * 0.22)},${n(-s * 2.22)} ${n(s * 0.22)},${n(-s * 2.22)} ${n(s * 0.5)},${n(-s * 2.4)} M${n(s * 0.26)},${n(-s * 2.28)} C${n(s * 0.1)},${n(-s * 1.42)} ${n(s * 0.16)},${n(-s * 0.56)} ${n(s * 0.3)},${n(-s * 0.1)}" fill="none" stroke="${lighten(color, 0.3)}" stroke-width="${n(s * 0.08)}" stroke-linecap="round" opacity="0.62"/>`;
      const grain = `<path d="M${n(-s * 0.23)},${n(-s * 2.22)} C${n(-s * 0.34)},${n(-s * 1.48)} ${n(-s * 0.28)},${n(-s * 0.82)} ${n(-s * 0.2)},${n(-s * 0.18)} M${n(s * 0.04)},${n(-s * 2.14)} C${n(-s * 0.04)},${n(-s * 1.42)} ${n(s * 0.04)},${n(-s * 0.72)} ${n(s * 0.08)},${n(-s * 0.16)} M${n(-s * 0.42)},${n(-s * 1.82)} C${n(-s * 0.1)},${n(-s * 1.96)} ${n(s * 0.24)},${n(-s * 1.9)} ${n(s * 0.43)},${n(-s * 1.74)} M${n(-s * 0.45)},${n(-s * 1.16)} C${n(-s * 0.1)},${n(-s * 1.28)} ${n(s * 0.26)},${n(-s * 1.18)} ${n(s * 0.43)},${n(-s * 1.02)} M${n(-s * 0.38)},${n(-s * 0.52)} C${n(-s * 0.06)},${n(-s * 0.62)} ${n(s * 0.24)},${n(-s * 0.54)} ${n(s * 0.38)},${n(-s * 0.42)}" fill="none" stroke="${darken(color, 0.25)}" stroke-width="${n(s * 0.04)}" stroke-linecap="round" opacity="0.55"/>`;
      return `<g transform="scale(0.76 1.18)">${body}${rolledEdge}${innerCurl}${highlight}${grain}</g>`;
    }
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
  surfaceHighlight?: string;
  /** no liquid — skip the waterline so botanicals just rest in the glass */
  dry?: boolean;
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
  const surfaceHighlight = opts.surfaceHighlight ?? "#fff8ea";
  const contactShadow = darken(liquidShadow, 0.42);
  const dry = opts.dry ?? false;
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
      const tintMaskId = `garnishTint-${uid}-${i}`;
      const wet = dry
        ? ""
        : `<defs><mask id="${tintMaskId}" maskUnits="userSpaceOnUse" x="${n(-sItem * 1.8)}" y="${n(-sItem * 3)}" width="${n(sItem * 3.6)}" height="${n(sItem * 5)}">${garnishShape(g.kind, "#ffffff", sItem, g.fruit, g.variant)}</mask></defs><rect x="${n(-sItem * 1.8)}" y="${n(wl)}" width="${n(sItem * 3.6)}" height="${n(sItem * 3)}" fill="${liquidColor}" opacity="0.18" mask="url(#${tintMaskId})"/><ellipse cx="0" cy="${n(wl)}" rx="${n(sItem * 0.86)}" ry="${n(Math.max(1, sItem * 0.16))}" fill="none" stroke="#fff8ea" stroke-opacity="0.28" stroke-width="0.65" filter="url(#garnishLine-${uid})"/><ellipse cx="0" cy="${n(wl)}" rx="${n(sItem * 0.86)}" ry="${n(Math.max(1, sItem * 0.16))}" fill="#ffffff" opacity="0.04" filter="url(#garnishLine-${uid})"/>`;
      return `<g transform="translate(${n(x)} ${n(y)})"><ellipse cx="${n(sItem * 0.16)}" cy="${n(sItem * 0.58)}" rx="${n(sItem * 0.72)}" ry="${n(sItem * 0.24)}" fill="${contactShadow}" opacity="0.32" filter="url(#garnishShadow-${uid})"/>${garnishShape(g.kind, g.color, sItem, g.fruit, g.variant)}${wet}</g>`;
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
        <filter id="garnishShadow-${uid}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="0.9"/></filter>
        <filter id="garnishLine-${uid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="0.35"/></filter>
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
    const sinksIntoLiquid = g.kind === "cinnamonStick" || g.kind === "vanillaPod" || g.kind === "chili";
    const off = m === 1 ? (sinksIntoLiquid ? 0.28 : 0.16) : i / (m - 1) - 0.5; // -0.5..0.5 (single leans to a wall)
    const ax = 100 + off * rim.rx * 1.08;
    // plant the stalk DOWN into the drink so soft herbs like mint sit inside the
    // glass / lean on the wall; rest on the lip only when the liquid is at the brim
    const restOnRim = liquidTop <= rim.cy + 6;
    const surfaceY = restOnRim ? rim.cy + 1 : liquidTop - 2;
    const rot = sinksIntoLiquid ? (m === 1 ? 22 : off * 38) : off * 26;
    const isCinnamon = g.kind === "cinnamonStick";
    const sTall = Math.max(7, Math.min(isCinnamon ? 17 : 14, surfaceHW * (isCinnamon ? 0.44 : 0.34)));
    const baseY = !restOnRim && sinksIntoLiquid ? liquidTop + Math.max(13, sTall * 0.82) : surfaceY;
    const isSubmerged = !restOnRim && sinksIntoLiquid && !dry;
    const submergeMaskId = `garnishSubmerge-${uid}-${i}`;
    const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
    const wetMask = isSubmerged
      ? `<defs><mask id="${submergeMaskId}" maskUnits="userSpaceOnUse" x="0" y="${n(liquidTop - 4)}" width="200" height="90"><g transform="translate(${n(ax)} ${n(baseY)}) rotate(${n(rot)})"><g transform="scale(${n(grow)})">${garnishShape(g.kind, "#ffffff", sTall, g.fruit, g.variant)}</g></g></mask></defs>`
      : "";
    const submergedTint = isSubmerged
      ? `<rect x="0" y="${n(liquidTop - 1)}" width="200" height="90" fill="${liquidColor}" opacity="0.52" mask="url(#${submergeMaskId})"/><ellipse cx="${n(ax + 0.7)}" cy="${n(liquidTop + sTall * 0.1)}" rx="${n(sTall * 0.92)}" ry="${n(Math.max(1.2, sTall * 0.2))}" fill="${liquidColor}" opacity="0.66" filter="url(#garnishShadow-${uid})"/><path d="M${n(ax - sTall * 0.9)},${n(liquidTop + sTall * 0.06)} C${n(ax - sTall * 0.38)},${n(liquidTop - sTall * 0.14)} ${n(ax + sTall * 0.44)},${n(liquidTop - sTall * 0.12)} ${n(ax + sTall * 0.95)},${n(liquidTop + sTall * 0.06)}" fill="none" stroke="${surfaceHighlight}" stroke-opacity="0.5" stroke-width="0.8" stroke-linecap="round" filter="url(#garnishShadow-${uid})"/><path d="M${n(ax - sTall * 0.54)},${n(liquidTop - sTall * 0.02)} C${n(ax - sTall * 0.12)},${n(liquidTop - sTall * 0.13)} ${n(ax + sTall * 0.36)},${n(liquidTop - sTall * 0.1)} ${n(ax + sTall * 0.62)},${n(liquidTop + sTall * 0.02)}" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.55" stroke-linecap="round"/>`
      : "";
    return `<g>${wetMask}<ellipse cx="${n(ax + 1.5)}" cy="${n(surfaceY + 2.3)}" rx="${n(sTall * 0.58)}" ry="${n(Math.max(1.1, sTall * 0.18))}" fill="${contactShadow}" opacity="0.28" filter="url(#garnishShadow-${uid})"/><g transform="translate(${n(ax)} ${n(baseY)}) rotate(${n(rot)})"><g transform="scale(${n(grow)})">${garnishShape(g.kind, g.color, sTall, g.fruit, g.variant)}</g></g>${submergedTint}</g>`;
  }).join("");

  return `<g><defs><filter id="garnishShadow-${uid}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="0.9"/></filter></defs>${rimMarkup}${tallMarkup}</g>`;
}
