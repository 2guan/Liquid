"use client";

import { useId } from "react";
import type { GarnishSpec, GarnishKind } from "@/lib/data/garnish";

/* ── small colour helpers ── */
function clampHex(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function mix(hex: string, target: number, amt: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const f = (c: number) => clampHex(c + (target - c) * amt).toString(16).padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}
const lighten = (hex: string, amt: number) => mix(hex, 255, amt);
const darken = (hex: string, amt: number) => mix(hex, 0, amt);

/**
 * The element a single garnish draws around its local origin. Tall kinds grow
 * *upward* (−y) from the origin (planted on the rim); surface kinds are centred.
 */
function Shape({ kind, color, s }: { kind: GarnishKind; color: string; s: number }) {
  switch (kind) {
    case "citrusWheel": {
      const segs = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <line key={i} x1="0" y1="0" x2={Math.cos(a) * s * 0.74} y2={Math.sin(a) * s * 0.74} stroke={color} strokeOpacity="0.5" strokeWidth={s * 0.05} />;
      });
      return (
        <g>
          <circle r={s} fill={color} />
          <circle r={s * 0.82} fill={lighten(color, 0.62)} />
          {segs}
          <circle r={s * 0.12} fill={lighten(color, 0.4)} />
          <ellipse cx={-s * 0.35} cy={-s * 0.4} rx={s * 0.22} ry={s * 0.12} fill="#ffffff" opacity="0.4" transform={`rotate(-30 ${-s * 0.35} ${-s * 0.4})`} />
        </g>
      );
    }
    case "cucumberSlice": {
      const seeds = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return <ellipse key={i} cx={Math.cos(a) * s * 0.32} cy={Math.sin(a) * s * 0.32} rx={s * 0.07} ry={s * 0.1} fill={darken(color, 0.2)} opacity="0.5" />;
      });
      return (
        <g>
          <circle r={s} fill={darken(color, 0.12)} />
          <circle r={s * 0.84} fill={lighten(color, 0.5)} />
          {seeds}
          <ellipse cx={-s * 0.34} cy={-s * 0.38} rx={s * 0.2} ry={s * 0.1} fill="#ffffff" opacity="0.35" transform={`rotate(-30 ${-s * 0.34} ${-s * 0.38})`} />
        </g>
      );
    }
    case "citrusTwist":
      return (
        <g>
          <path d={`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s} C${-s * 0.9},${s * 1.2} ${-s},${s * 0.2} ${-s * 0.45},${0}`} fill="none" stroke={color} strokeWidth={s * 0.42} strokeLinecap="round" />
          <path d={`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s}`} fill="none" stroke={lighten(color, 0.45)} strokeWidth={s * 0.16} strokeLinecap="round" />
        </g>
      );
    case "berry": {
      const dots = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * s * 0.4} cy={Math.sin(a) * s * 0.4} r={s * 0.18} fill={darken(color, 0.12)} opacity="0.55" />;
      });
      return (
        <g>
          <circle r={s * 0.78} fill={color} />
          {dots}
          <circle cx={-s * 0.24} cy={-s * 0.28} r={s * 0.16} fill="#ffffff" opacity="0.5" />
        </g>
      );
    }
    case "cherry":
      return (
        <g>
          <path d={`M${s * 0.2},${-s * 1.7} C${s * 0.1},${-s * 0.9} ${-s * 0.1},${-s * 0.6} 0,${-s * 0.55}`} fill="none" stroke="#6E5A2A" strokeWidth={s * 0.12} strokeLinecap="round" />
          <circle r={s * 0.7} fill={color} />
          <circle r={s * 0.7} fill="none" stroke={darken(color, 0.3)} strokeOpacity="0.5" strokeWidth={s * 0.06} />
          <circle cx={-s * 0.26} cy={-s * 0.26} r={s * 0.16} fill="#ffffff" opacity="0.55" />
        </g>
      );
    case "fruitSlice":
      return (
        <g>
          <path d={`M0,${s} A${s} ${s} 0 0 1 ${-s},0 L0,0 Z`} fill={lighten(color, 0.45)} stroke={color} strokeWidth={s * 0.12} strokeLinejoin="round" />
          <path d={`M0,${s} A${s} ${s} 0 0 1 ${-s},0`} fill="none" stroke={darken(color, 0.1)} strokeWidth={s * 0.22} strokeLinecap="round" />
          <ellipse cx={-s * 0.45} cy={s * 0.42} rx={s * 0.12} ry={s * 0.2} fill="#ffffff" opacity="0.3" transform={`rotate(40 ${-s * 0.45} ${s * 0.42})`} />
        </g>
      );
    case "mintSprig": {
      // a few pointed leaves up a short stem (grows upward)
      const leaf = (lx: number, ly: number, rot: number, sc: number) => (
        <g transform={`translate(${lx} ${ly}) rotate(${rot}) scale(${sc})`}>
          <path d={`M0,0 C${s * 0.55},${-s * 0.2} ${s * 0.55},${-s * 0.9} 0,${-s * 1.15} C${-s * 0.55},${-s * 0.9} ${-s * 0.55},${-s * 0.2} 0,0 Z`} fill={color} />
          <path d={`M0,0 L0,${-s * 1.05}`} stroke={darken(color, 0.25)} strokeWidth={s * 0.05} />
        </g>
      );
      return (
        <g>
          <path d={`M0,0 C${s * 0.1},${-s} 0,${-s * 1.8} ${-s * 0.1},${-s * 2.4}`} fill="none" stroke={darken(color, 0.2)} strokeWidth={s * 0.1} />
          {leaf(0, -s * 2.2, 8, 1)}
          {leaf(-s * 0.3, -s * 1.5, -32, 0.85)}
          {leaf(s * 0.32, -s * 1.4, 34, 0.85)}
          {leaf(-s * 0.3, -s * 0.85, -50, 0.7)}
          {leaf(s * 0.3, -s * 0.8, 52, 0.7)}
        </g>
      );
    }
    case "herbSprig": {
      // rosemary-like: a stem with many small needles
      const needles = Array.from({ length: 12 }, (_, i) => {
        const y = -i * s * 0.22 - s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        return <line key={i} x1="0" y1={y} x2={side * s * 0.5} y2={y - s * 0.28} stroke={color} strokeWidth={s * 0.08} strokeLinecap="round" />;
      });
      return (
        <g>
          <path d={`M0,0 L0,${-s * 2.8}`} stroke={darken(color, 0.2)} strokeWidth={s * 0.1} />
          {needles}
        </g>
      );
    }
    case "thymeSprig": {
      // a wiry stem with many tiny alternating leaves
      const leaves = Array.from({ length: 11 }, (_, i) => {
        const y = -s * 0.3 - i * s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <ellipse
            key={i}
            cx={side * s * 0.14}
            cy={y}
            rx={s * 0.17}
            ry={s * 0.09}
            fill={i % 3 === 0 ? lighten(color, 0.12) : color}
            transform={`rotate(${side * 34} ${side * s * 0.14} ${y})`}
          />
        );
      });
      return (
        <g>
          <path d={`M0,0 C${s * 0.06},${-s} ${-s * 0.06},${-s * 1.8} ${s * 0.04},${-s * 2.4}`} fill="none" stroke={darken(color, 0.22)} strokeWidth={s * 0.08} strokeLinecap="round" />
          {leaves}
        </g>
      );
    }
    case "dillSprig": {
      // feathery fronds of fine hairs up a thin stem
      const fronds = Array.from({ length: 7 }, (_, i) => {
        const y = -s * 0.45 - i * s * 0.28;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <g key={i}>
            {Array.from({ length: 4 }, (_, j) => (
              <line
                key={j}
                x1="0"
                y1={y}
                x2={side * (s * 0.18 + j * s * 0.12)}
                y2={y - s * 0.34 - j * s * 0.04}
                stroke={color}
                strokeWidth={s * 0.045}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      });
      return (
        <g>
          <path d={`M0,0 L0,${-s * 2.4}`} stroke={darken(color, 0.2)} strokeWidth={s * 0.07} strokeLinecap="round" />
          {fronds}
        </g>
      );
    }
    case "bayLeaf":
      // a single elongated, pointed leaf with side veins
      return (
        <g>
          <path d={`M0,${-s * 1.5} C${s * 0.52},${-s * 0.9} ${s * 0.5},${s * 0.8} 0,${s * 1.5} C${-s * 0.5},${s * 0.8} ${-s * 0.52},${-s * 0.9} 0,${-s * 1.5} Z`} fill={color} stroke={darken(color, 0.28)} strokeWidth={s * 0.05} strokeLinejoin="round" />
          <path d={`M0,${-s * 1.4} L0,${s * 1.4}`} stroke={darken(color, 0.32)} strokeWidth={s * 0.05} />
          {[-0.7, -0.3, 0.1, 0.5].map((t, i) => (
            <g key={i}>
              <line x1="0" y1={t * s} x2={s * 0.34} y2={t * s + s * 0.28} stroke={darken(color, 0.25)} strokeOpacity="0.5" strokeWidth={s * 0.035} />
              <line x1="0" y1={t * s} x2={-s * 0.34} y2={t * s + s * 0.28} stroke={darken(color, 0.25)} strokeOpacity="0.5" strokeWidth={s * 0.035} />
            </g>
          ))}
          <path d={`M${-s * 0.18},${-s * 1.1} C${-s * 0.3},${-s * 0.4} ${-s * 0.28},${s * 0.4} ${-s * 0.12},${s * 0.9}`} fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth={s * 0.08} strokeLinecap="round" />
        </g>
      );
    case "basilLeaf":
      // a broad, glossy, pointed leaf with curved veins
      return (
        <g>
          <path d={`M0,${-s * 1.35} C${s * 1.02},${-s * 0.8} ${s * 0.92},${s * 0.7} 0,${s * 1.15} C${-s * 0.92},${s * 0.7} ${-s * 1.02},${-s * 0.8} 0,${-s * 1.35} Z`} fill={color} stroke={darken(color, 0.24)} strokeWidth={s * 0.05} strokeLinejoin="round" />
          <path d={`M0,${-s * 1.2} L0,${s * 1.05}`} stroke={darken(color, 0.3)} strokeWidth={s * 0.055} />
          {[-0.55, -0.15, 0.25].map((t, i) => (
            <g key={i}>
              <path d={`M0,${t * s} Q${s * 0.45},${t * s + s * 0.1} ${s * 0.78},${t * s + s * 0.45}`} fill="none" stroke={darken(color, 0.22)} strokeOpacity="0.5" strokeWidth={s * 0.04} />
              <path d={`M0,${t * s} Q${-s * 0.45},${t * s + s * 0.1} ${-s * 0.78},${t * s + s * 0.45}`} fill="none" stroke={darken(color, 0.22)} strokeOpacity="0.5" strokeWidth={s * 0.04} />
            </g>
          ))}
          <ellipse cx={-s * 0.34} cy={-s * 0.34} rx={s * 0.3} ry={s * 0.5} fill="#ffffff" opacity="0.16" transform={`rotate(-24 ${-s * 0.34} ${-s * 0.34})`} />
        </g>
      );
    case "sageLeaf": {
      // a soft, velvety, grey-green elongated leaf with stippled texture
      const stipple = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * s * 0.26} cy={Math.sin(a) * s * 0.7} r={s * 0.05} fill={darken(color, 0.14)} opacity="0.4" />;
      });
      return (
        <g>
          <path d={`M0,${-s * 1.45} C${s * 0.46},${-s * 0.9} ${s * 0.5},${s * 0.85} 0,${s * 1.3} C${-s * 0.5},${s * 0.85} ${-s * 0.46},${-s * 0.9} 0,${-s * 1.45} Z`} fill={lighten(color, 0.1)} stroke={darken(color, 0.2)} strokeWidth={s * 0.05} strokeLinejoin="round" />
          <path d={`M0,${-s * 1.35} L0,${s * 1.2}`} stroke={darken(color, 0.18)} strokeOpacity="0.6" strokeWidth={s * 0.05} />
          {stipple}
        </g>
      );
    }
    case "lavender":
      return (
        <g>
          <path d={`M0,0 L0,${-s * 2.2}`} stroke="#6E7A4A" strokeWidth={s * 0.1} />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={(i % 2 === 0 ? 1 : -1) * s * 0.16} cy={-s * 2.1 + i * s * 0.22} rx={s * 0.2} ry={s * 0.16} fill={color} opacity="0.9" />
          ))}
        </g>
      );
    case "leaf":
      return (
        <g>
          <path d={`M0,${s} C${s * 0.9},${s * 0.3} ${s * 0.9},${-s * 0.7} 0,${-s} C${-s * 0.9},${-s * 0.7} ${-s * 0.9},${s * 0.3} 0,${s} Z`} fill={color} />
          <path d={`M0,${s} L0,${-s}`} stroke={darken(color, 0.28)} strokeWidth={s * 0.06} />
        </g>
      );
    case "flower": {
      const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * 360;
        return <ellipse key={i} cx="0" cy={-s * 0.55} rx={s * 0.28} ry={s * 0.55} fill={color} opacity="0.92" transform={`rotate(${a})`} />;
      });
      return (
        <g>
          {petals}
          <circle r={s * 0.26} fill={lighten(color, 0.5)} />
        </g>
      );
    }
    case "cinnamonStick":
      return (
        <g>
          <rect x={-s * 0.32} y={-s * 2.6} width={s * 0.64} height={s * 2.6} rx={s * 0.3} fill={color} />
          <rect x={-s * 0.32} y={-s * 2.6} width={s * 0.26} height={s * 2.6} rx={s * 0.13} fill={darken(color, 0.25)} />
          <rect x={s * 0.06} y={-s * 2.6} width={s * 0.16} height={s * 2.6} rx={s * 0.08} fill={lighten(color, 0.25)} opacity="0.7" />
        </g>
      );
    case "clove": {
      const one = (x: number, y: number, rot: number) => (
        <g transform={`translate(${x} ${y}) rotate(${rot})`}>
          <line x1="0" y1="0" x2="0" y2={s * 0.9} stroke={color} strokeWidth={s * 0.14} strokeLinecap="round" />
          <circle cx="0" cy={-s * 0.05} r={s * 0.28} fill={lighten(color, 0.2)} />
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1="0" y1={-s * 0.05} x2={Math.cos((i / 4) * 6.28) * s * 0.26} y2={-s * 0.05 + Math.sin((i / 4) * 6.28) * s * 0.26} stroke={darken(color, 0.2)} strokeWidth={s * 0.07} strokeLinecap="round" />
          ))}
        </g>
      );
      return (
        <g>
          {one(-s * 0.5, -s * 0.4, -20)}
          {one(s * 0.5, -s * 0.3, 22)}
        </g>
      );
    }
    case "starAnise": {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return `${Math.cos(a) * s},${Math.sin(a) * s}`;
      });
      const inner = Array.from({ length: 8 }, (_, i) => {
        const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
        return `${Math.cos(a) * s * 0.4},${Math.sin(a) * s * 0.4}`;
      });
      const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p} L${inner[i]}`).join(" ") + " Z";
      return (
        <g>
          <path d={d} fill={color} stroke={darken(color, 0.3)} strokeWidth={s * 0.04} strokeLinejoin="round" />
          {pts.map((_, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={Math.cos(a) * s * 0.62} cy={Math.sin(a) * s * 0.62} r={s * 0.13} fill={lighten(color, 0.4)} />;
          })}
        </g>
      );
    }
    case "seeds":
      return (
        <g>
          {[[-s * 0.5, 0], [s * 0.2, -s * 0.4], [s * 0.5, s * 0.3], [-s * 0.2, s * 0.4], [0, -s * 0.05], [-s * 0.6, s * 0.5]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={s * 0.22} fill={i % 2 ? lighten(color, 0.15) : color} />
          ))}
        </g>
      );
    case "gingerSlice":
      return (
        <g>
          <path d={`M${-s * 0.9},${-s * 0.2} C${-s * 0.6},${-s} ${s * 0.8},${-s * 0.9} ${s},${-s * 0.1} C${s * 1.1},${s * 0.7} ${-s * 0.3},${s} ${-s * 0.9},${-s * 0.2} Z`} fill={lighten(color, 0.2)} stroke={darken(color, 0.18)} strokeWidth={s * 0.07} />
          {Array.from({ length: 3 }, (_, i) => (
            <line key={i} x1={-s * 0.5 + i * s * 0.4} y1={-s * 0.5} x2={-s * 0.4 + i * s * 0.4} y2={s * 0.5} stroke={darken(color, 0.15)} strokeOpacity="0.4" strokeWidth={s * 0.05} />
          ))}
        </g>
      );
    case "chili":
      return (
        <g>
          <path d={`M0,${-s * 2.4} C${s * 0.1},${-s * 2.2} ${s * 0.55},${-s} ${s * 0.3},${-s * 0.2} C${s * 0.1},${s * 0.3} ${-s * 0.4},${s * 0.1} ${-s * 0.2},${-s * 0.8} C${-s * 0.05},${-s * 1.6} ${-s * 0.15},${-s * 2.2} 0,${-s * 2.4} Z`} fill={color} />
          <path d={`M0,${-s * 2.4} C${s * 0.05},${-s * 1.6} ${s * 0.1},${-s} ${s * 0.15},${-s * 0.5}`} fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth={s * 0.1} strokeLinecap="round" />
          <path d={`M0,${-s * 2.4} C${-s * 0.2},${-s * 2.6} ${-s * 0.5},${-s * 2.5} ${-s * 0.6},${-s * 2.3}`} fill="none" stroke="#5A7A3A" strokeWidth={s * 0.16} strokeLinecap="round" />
        </g>
      );
    case "vanillaPod":
      return (
        <g>
          <path d={`M0,0 C${s * 0.3},${-s} ${-s * 0.2},${-s * 1.9} ${s * 0.1},${-s * 2.8}`} fill="none" stroke={color} strokeWidth={s * 0.34} strokeLinecap="round" />
          <path d={`M0,0 C${s * 0.3},${-s} ${-s * 0.2},${-s * 1.9} ${s * 0.1},${-s * 2.8}`} fill="none" stroke={lighten(color, 0.25)} strokeWidth={s * 0.1} strokeLinecap="round" />
        </g>
      );
    case "coffeeBeans": {
      const bean = (x: number, y: number, rot: number) => (
        <g transform={`translate(${x} ${y}) rotate(${rot})`}>
          <ellipse rx={s * 0.42} ry={s * 0.6} fill={color} />
          <path d={`M0,${-s * 0.5} C${s * 0.12},${-s * 0.2} ${s * 0.12},${s * 0.2} 0,${s * 0.5}`} fill="none" stroke={darken(color, 0.4)} strokeWidth={s * 0.09} />
          <ellipse cx={-s * 0.14} cy={-s * 0.18} rx={s * 0.1} ry={s * 0.16} fill="#ffffff" opacity="0.25" />
        </g>
      );
      return (
        <g>
          {bean(-s * 0.55, s * 0.2, -18)}
          {bean(s * 0.5, -s * 0.1, 16)}
          {bean(0, s * 0.55, 4)}
        </g>
      );
    }
    case "olive":
      return (
        <g>
          <line x1={s * 0.1} y1={-s * 1.6} x2={-s * 0.1} y2={s * 0.4} stroke="#C9A45D" strokeWidth={s * 0.12} />
          <ellipse rx={s * 0.6} ry={s * 0.8} fill={color} />
          <ellipse rx={s * 0.6} ry={s * 0.8} fill="none" stroke={darken(color, 0.25)} strokeOpacity="0.5" strokeWidth={s * 0.06} />
          <circle cx="0" cy={s * 0.35} r={s * 0.2} fill="#C5402A" />
          <ellipse cx={-s * 0.2} cy={-s * 0.3} rx={s * 0.12} ry={s * 0.2} fill="#ffffff" opacity="0.4" />
        </g>
      );
    case "onion":
      return (
        <g>
          <line x1={s * 0.1} y1={-s * 1.6} x2={-s * 0.1} y2={s * 0.3} stroke="#C9A45D" strokeWidth={s * 0.12} />
          <circle r={s * 0.72} fill={color} />
          <path d={`M${-s * 0.5},${-s * 0.3} A${s * 0.72} ${s * 0.72} 0 0 1 ${s * 0.4},${-s * 0.5}`} fill="none" stroke={darken(color, 0.15)} strokeOpacity="0.5" strokeWidth={s * 0.05} />
          <circle cx={-s * 0.24} cy={-s * 0.26} r={s * 0.16} fill="#ffffff" opacity="0.5" />
        </g>
      );
    case "goldLeaf":
      return (
        <g>
          {[[-s * 0.5, -s * 0.2, 20], [s * 0.3, s * 0.3, -15], [s * 0.1, -s * 0.5, 40], [-s * 0.2, s * 0.5, -30]].map(([x, y, r], i) => (
            <rect key={i} x={x} y={y} width={s * (0.3 + (i % 2) * 0.18)} height={s * 0.26} fill={color} opacity={0.85 - i * 0.12} transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
    case "drops":
      // a few aromatic-bitters dashes on the surface
      return (
        <g>
          {[[-s * 0.5, 0], [s * 0.08, -s * 0.32], [s * 0.46, s * 0.22], [-s * 0.1, s * 0.34]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={s * 0.2} ry={s * 0.26} fill={color} opacity="0.65" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

interface GarnishLayerProps {
  specs: GarnishSpec[];
  rim: { cx: number; cy: number; rx: number; ry: number };
  cupTop: number;
  liquidTop: number;
  surfaceHW: number;
  /** "back" = the in-drink items (clipped inside the glass, behind the front
   *  wall); "front" = the rim crust + sprigs that sit on/above the lip. */
  layer: "back" | "front";
  /** clipPath id of the cup interior — keeps in-drink garnishes inside the glass */
  clipId?: string;
  /** the drink's body / shadow colours — tint the submerged part of floaters */
  liquidColor?: string;
  liquidShadow?: string;
  /** no liquid in the glass — skip the waterline / submerge wash so botanicals
   *  just rest in the glass rather than reading as floating on nothing */
  dry?: boolean;
}

/**
 * Garnishes laid out in two passes so they read as *inside* the glass:
 *  - back: foam, floating fruit/coffee/beans, dusting — clipped to the cup and
 *    drawn before the front glass wall, so you see them through the glass.
 *  - front: salt/sugar rim crust and tall sprigs/sticks resting on the lip.
 */
export function GarnishLayer({ specs, rim, cupTop, liquidTop, surfaceHW, layer, clipId, liquidColor = "#9A5826", liquidShadow = "#3A1E0C", dry = false }: GarnishLayerProps) {
  const uid = useId().replace(/:/g, "");
  if (!specs.length) return null;
  const surf = specs.filter((g) => g.placement === "surface");
  const tall = specs.filter((g) => g.placement === "tall");
  const rimG = specs.find((g) => g.placement === "rim");
  const foam = specs.find((g) => g.placement === "foam");
  const dust = specs.find((g) => g.placement === "dust");

  const sItem = Math.max(6, Math.min(16, surfaceHW * 0.38));
  const surfRy = surfaceHW * 0.14 + 1.5;
  const tallH = rim.cy - cupTop + 60;

  if (layer === "back") {
    // in-drink items, kept inside the glass by the cup clip
    return (
      <g clipPath={clipId ? `url(#${clipId})` : undefined}>
        <defs>
          {/* the drink's colour washes UP over the submerged part of a floater */}
          <linearGradient id={`submerge-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0" />
            <stop offset="42%" stopColor={liquidColor} stopOpacity="0" />
            <stop offset="78%" stopColor={liquidColor} stopOpacity="0.42" />
            <stop offset="100%" stopColor={liquidShadow} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* foam cap on the surface */}
        {foam && (
          <g>
            <ellipse cx="100" cy={liquidTop - surfRy * 0.4} rx={surfaceHW} ry={surfRy * 1.5} fill={foam.color} opacity="0.92" />
            {[-0.4, 0, 0.45].map((d, i) => (
              <circle key={i} cx={100 + d * surfaceHW} cy={liquidTop - surfRy * 0.7} r={surfaceHW * 0.1} fill="#ffffff" opacity="0.6" />
            ))}
          </g>
        )}

        {/* floating fruit / cherries / coffee beans — sitting *in* the drink */}
        {surf.map((g, i) => {
          const m = surf.length;
          // fan several floaters across the surface instead of stacking them;
          // stagger depth a touch so any overlap reads as front/back, not a clash
          const gap = m > 1 ? Math.min(sItem * 1.7, (surfaceHW * 1.5) / (m - 1)) : 0;
          const x = 100 + (i - (m - 1) / 2) * gap;
          const y = liquidTop + sItem * 0.16 + (i % 2 ? sItem * 0.22 : 0);
          const wl = liquidTop - y; // waterline in the floater's local coords
          return (
            <g key={`s${i}`} transform={`translate(${x} ${y})`}>
              {/* soft contact shadow cast down into the drink */}
              <ellipse cx={sItem * 0.16} cy={sItem * 0.62} rx={sItem * 0.96} ry={sItem * 0.34} fill={liquidShadow} opacity="0.32" />
              {/* the garnish itself */}
              <Shape kind={g.kind} color={g.color} s={sItem} />
              {/* liquid-only finishing: submerge wash + waterline meniscus */}
              {!dry && <ellipse cx="0" cy="0" rx={sItem * 1.05} ry={sItem * 1.05} fill={`url(#submerge-${uid})`} />}
              {!dry && <ellipse cx="0" cy={wl} rx={sItem * 0.86} ry={Math.max(1, sItem * 0.16)} fill="none" stroke="#fff7e6" strokeOpacity="0.5" strokeWidth="0.8" />}
              {!dry && <ellipse cx="0" cy={wl} rx={sItem * 0.86} ry={Math.max(1, sItem * 0.16)} fill="#ffffff" opacity="0.08" />}
            </g>
          );
        })}

        {/* dusting of powder floating on the surface */}
        {dust &&
          Array.from({ length: 14 }, (_, i) => {
            const x = 100 + (((i * 37) % 100) / 100) * surfaceHW - surfaceHW * 0.5;
            const y = liquidTop - 1 + (((i * 53) % 30) / 30) * surfRy - surfRy * 0.4;
            return <circle key={`d${i}`} cx={x} cy={y} r={0.6 + (i % 3) * 0.3} fill={dust.color} opacity="0.6" />;
          })}
      </g>
    );
  }

  // front: rim crust + tall sprigs resting on / rising from the lip
  return (
    <g>
      {rimG &&
        Array.from({ length: 16 }, (_, i) => {
          const t = i / 15;
          const ang = Math.PI * (0.15 + 0.7 * t); // front (lower) arc
          const x = rim.cx + Math.cos(ang) * rim.rx * (i % 2 ? 1 : 0.94);
          const y = rim.cy + Math.sin(ang) * rim.ry * 1.1;
          return <circle key={i} cx={x} cy={y} r={0.9 + (i % 3) * 0.4} fill={rimG.color} opacity="0.9" />;
        })}

      {tall.map((g, i) => {
        const m = tall.length;
        // fan the sprigs/sticks across the mouth like a planted bunch, spread
        // toward the inner walls and fanned outward.
        const off = m === 1 ? 0.16 : i / (m - 1) - 0.5; // -0.5..0.5 (single leans to a wall)
        const ax = 100 + off * rim.rx * 1.2;
        // plant the stalk DOWN into the drink (base at the liquid surface) so soft
        // herbs like mint sit inside the glass / lean on the wall, half-submerged;
        // only rest on the lip when the liquid is right up at the brim (or empty,
        // where liquidTop sits at the cup base → it stands from the bottom).
        const restOnRim = liquidTop <= rim.cy + 6;
        const baseY = restOnRim ? rim.cy + 1 : liquidTop - 2;
        const rot = off * 26;
        const sTall = Math.max(7, Math.min(14, surfaceHW * 0.34));
        const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
        return (
          <g key={`t${i}`}>
            {/* shadow where the stalk meets the surface / lip */}
            <ellipse cx={ax + 1.5} cy={baseY + 2.5} rx={sTall * 0.8} ry={Math.max(1.4, sTall * 0.24)} fill={liquidShadow} opacity="0.28" />
            <g transform={`translate(${ax} ${baseY}) rotate(${rot})`}>
              <g transform={`scale(${grow})`}>
                <Shape kind={g.kind} color={g.color} s={sTall} />
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
