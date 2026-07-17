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
function Shape({ kind, color, s, fruit, variant }: { kind: GarnishKind; color: string; s: number; fruit?: string; variant?: string }) {
  switch (kind) {
    case "citrusWheel": {
      const pulp = fruit === "bloodOrange" ? "#C5402A" : fruit === "grapefruit" ? "#F07D67" : fruit === "lime" ? "#B9D95A" : lighten(color, 0.5);
      const peel = fruit === "lime" ? "#7EA83A" : fruit === "lemon" || fruit === "yuzu" ? "#E8C84A" : color;
      const segs = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <line key={i} x1="0" y1="0" x2={Math.cos(a) * s * 0.72} y2={Math.sin(a) * s * 0.48} stroke={darken(peel, 0.14)} strokeOpacity="0.36" strokeWidth={s * 0.035} />;
      });
      return (
        <g>
          <ellipse cx={s * 0.06} cy={s * 0.12} rx={s * 1.03} ry={s * 0.72} fill={darken(peel, 0.18)} opacity="0.55" />
          <ellipse rx={s * 1.02} ry={s * 0.72} fill={peel} />
          <ellipse rx={s * 0.84} ry={s * 0.56} fill={lighten(peel, 0.74)} />
          <ellipse rx={s * 0.72} ry={s * 0.48} fill={pulp} opacity="0.9" />
          {segs}
          <ellipse rx={s * 0.16} ry={s * 0.1} fill={lighten(pulp, 0.38)} opacity="0.85" />
          <path d={`M${-s * 0.8},${s * 0.2} C${-s * 0.32},${s * 0.55} ${s * 0.45},${s * 0.56} ${s * 0.92},${s * 0.16}`} fill="none" stroke={darken(peel, 0.28)} strokeOpacity="0.35" strokeWidth={s * 0.08} strokeLinecap="round" />
          <ellipse cx={-s * 0.34} cy={-s * 0.3} rx={s * 0.28} ry={s * 0.1} fill="#ffffff" opacity="0.36" transform={`rotate(-18 ${-s * 0.34} ${-s * 0.3})`} />
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
      if (variant === "orangePeel") {
        return (
          <g>
            <path d={`M${-s * 0.95},${-s * 0.55} C${-s * 0.15},${-s * 1.05} ${s * 0.95},${-s * 0.5} ${s * 0.62},${s * 0.38} C${s * 0.34},${s * 1.1} ${-s * 0.65},${s * 0.8} ${-s * 0.4},${s * 0.05}`} fill="none" stroke={color} strokeWidth={s * 0.42} strokeLinecap="round" />
            <path d={`M${-s * 0.72},${-s * 0.47} C${-s * 0.1},${-s * 0.72} ${s * 0.6},${-s * 0.36} ${s * 0.42},${s * 0.3}`} fill="none" stroke={lighten(color, 0.45)} strokeWidth={s * 0.12} strokeLinecap="round" />
            <path d={`M${-s * 0.85},${-s * 0.38} C${-s * 0.18},${-s * 0.82} ${s * 0.84},${-s * 0.42} ${s * 0.55},${s * 0.34}`} fill="none" stroke={darken(color, 0.22)} strokeOpacity="0.28" strokeWidth={s * 0.08} strokeLinecap="round" />
          </g>
        );
      }
      if (variant === "grapefruitPeel") {
        return (
          <g>
            <path d={`M${-s * 0.82},${-s * 0.8} C${s * 0.6},${-s * 1.0} ${s * 0.9},${s * 0.2} ${-s * 0.2},${s * 0.92}`} fill="none" stroke={color} strokeWidth={s * 0.34} strokeLinecap="round" />
            <path d={`M${-s * 0.78},${-s * 0.78} C${s * 0.52},${-s * 0.86} ${s * 0.7},${s * 0.12} ${-s * 0.16},${s * 0.76}`} fill="none" stroke="#F6C4B6" strokeWidth={s * 0.13} strokeLinecap="round" />
          </g>
        );
      }
      return (
        <g>
          <path d={`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s} C${-s * 0.9},${s * 1.2} ${-s},${s * 0.2} ${-s * 0.45},${0}`} fill="none" stroke={color} strokeWidth={s * 0.42} strokeLinecap="round" />
          <path d={`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s}`} fill="none" stroke={lighten(color, 0.45)} strokeWidth={s * 0.16} strokeLinecap="round" />
        </g>
      );
    case "berry": {
      if (fruit === "grape") {
        const grapes = [[-0.42, -0.25], [0.12, -0.36], [0.48, 0.04], [-0.15, 0.2], [0.32, 0.5]] as const;
        return (
          <g>
            <path d={`M${-s * 0.1},${-s * 0.88} C${s * 0.2},${-s * 0.6} ${s * 0.28},${-s * 0.36} ${s * 0.12},${-s * 0.2}`} fill="none" stroke="#6E7A3A" strokeWidth={s * 0.08} strokeLinecap="round" />
            {grapes.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x * s} cy={y * s} r={s * 0.34} fill={i % 2 ? lighten(color, 0.08) : color} />
                <circle cx={x * s} cy={y * s} r={s * 0.34} fill="none" stroke={darken(color, 0.28)} strokeOpacity="0.36" strokeWidth={s * 0.04} />
                <circle cx={x * s - s * 0.11} cy={y * s - s * 0.13} r={s * 0.07} fill="#ffffff" opacity="0.42" />
              </g>
            ))}
          </g>
        );
      }
      if (fruit === "strawberry") {
        const seeds = [[-0.28, -0.12], [0.12, -0.1], [-0.12, 0.22], [0.28, 0.25], [0, 0.48]] as const;
        return (
          <g>
            <path d={`M0,${s * 0.95} C${-s * 0.95},${s * 0.25} ${-s * 0.78},${-s * 0.78} 0,${-s * 0.68} C${s * 0.78},${-s * 0.78} ${s * 0.95},${s * 0.25} 0,${s * 0.95} Z`} fill={color} stroke={darken(color, 0.25)} strokeWidth={s * 0.05} />
            <path d={`M${-s * 0.42},${-s * 0.62} L${-s * 0.12},${-s * 0.38} L0,${-s * 0.72} L${s * 0.14},${-s * 0.38} L${s * 0.46},${-s * 0.62}`} fill="#5A8A3A" stroke={darken("#5A8A3A", 0.2)} strokeWidth={s * 0.035} />
            {seeds.map(([x, y], i) => <ellipse key={i} cx={x * s} cy={y * s} rx={s * 0.045} ry={s * 0.08} fill="#F4D38A" opacity="0.8" transform={`rotate(${i % 2 ? -22 : 18} ${x * s} ${y * s})`} />)}
            <ellipse cx={-s * 0.25} cy={-s * 0.12} rx={s * 0.18} ry={s * 0.34} fill="#ffffff" opacity="0.24" transform={`rotate(-28 ${-s * 0.25} ${-s * 0.12})`} />
          </g>
        );
      }
      if (fruit === "raspberry" || fruit === "blackberry") {
        const cells = [[0, -0.42], [-0.34, -0.14], [0.34, -0.14], [-0.28, 0.28], [0.22, 0.3], [0, 0.02]] as const;
        return (
          <g>
            {cells.map(([x, y], i) => (
              <circle key={i} cx={x * s} cy={y * s} r={s * 0.28} fill={i % 2 ? lighten(color, 0.1) : color} stroke={darken(color, 0.25)} strokeOpacity="0.3" strokeWidth={s * 0.035} />
            ))}
            <circle cx={-s * 0.15} cy={-s * 0.28} r={s * 0.08} fill="#ffffff" opacity="0.35" />
          </g>
        );
      }
      if (fruit === "pomegranate") {
        const arils = [[-0.42, -0.12], [-0.08, -0.28], [0.3, -0.08], [-0.24, 0.28], [0.2, 0.28], [0.5, 0.22]] as const;
        return <g>{arils.map(([x, y], i) => <path key={i} d={`M${x * s},${(y - 0.18) * s} C${(x + 0.22) * s},${(y - 0.06) * s} ${(x + 0.18) * s},${(y + 0.2) * s} ${x * s},${(y + 0.24) * s} C${(x - 0.22) * s},${(y + 0.18) * s} ${(x - 0.18) * s},${(y - 0.08) * s} ${x * s},${(y - 0.18) * s} Z`} fill={i % 2 ? lighten(color, 0.12) : color} opacity="0.9" />)}</g>;
      }
      const dots = Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return <ellipse key={i} cx={Math.cos(a) * s * 0.28} cy={Math.sin(a) * s * 0.2} rx={s * 0.08} ry={s * 0.05} fill={darken(color, 0.22)} opacity="0.4" />;
      });
      return (
        <g>
          <ellipse rx={s * 0.78} ry={s * 0.7} fill={color} />
          <ellipse rx={s * 0.78} ry={s * 0.7} fill="none" stroke={darken(color, 0.28)} strokeOpacity="0.42" strokeWidth={s * 0.05} />
          {dots}
          <path d={`M${-s * 0.16},${-s * 0.62} C${s * 0.08},${-s * 0.78} ${s * 0.3},${-s * 0.62} ${s * 0.26},${-s * 0.38}`} fill="none" stroke={darken(color, 0.35)} strokeWidth={s * 0.05} strokeLinecap="round" />
          <circle cx={-s * 0.24} cy={-s * 0.28} r={s * 0.14} fill="#ffffff" opacity="0.48" />
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
    case "fruitSlice": {
      if (fruit === "watermelon") {
        return (
          <g>
            <path d={`M${-s * 1.02},${s * 0.48} Q0,${s * 1.06} ${s * 1.02},${s * 0.48} L0,${-s * 0.82} Z`} fill="#E0566A" stroke={darken("#E0566A", 0.24)} strokeWidth={s * 0.05} />
            <path d={`M${-s * 1.02},${s * 0.48} Q0,${s * 1.06} ${s * 1.02},${s * 0.48}`} fill="none" stroke="#6EA84A" strokeWidth={s * 0.24} strokeLinecap="round" />
            <path d={`M${-s * 0.9},${s * 0.42} Q0,${s * 0.88} ${s * 0.9},${s * 0.42}`} fill="none" stroke="#DDE5A8" strokeWidth={s * 0.08} strokeLinecap="round" />
            {[[-0.28, -0.05], [0.18, 0.08], [0, 0.35]].map(([x, y], i) => <ellipse key={i} cx={x * s} cy={y * s} rx={s * 0.045} ry={s * 0.1} fill="#3A1B18" transform={`rotate(${i % 2 ? 18 : -14} ${x * s} ${y * s})`} />)}
          </g>
        );
      }
      if (fruit === "lychee") {
        return (
          <g>
            <path d={`M${-s * 0.8},${-s * 0.12} C${-s * 0.62},${-s * 0.88} ${s * 0.38},${-s * 0.9} ${s * 0.78},${-s * 0.24} C${s * 0.98},${s * 0.42} ${s * 0.24},${s * 0.88} ${-s * 0.42},${s * 0.7} C${-s * 0.95},${s * 0.55} ${-s * 1.05},${s * 0.18} ${-s * 0.8},${-s * 0.12} Z`} fill="#F6E6DC" stroke="#E8C8B8" strokeWidth={s * 0.07} />
            <path d={`M${-s * 0.42},${-s * 0.16} C${-s * 0.12},${-s * 0.4} ${s * 0.38},${-s * 0.35} ${s * 0.52},${s * 0.02} C${s * 0.36},${s * 0.34} ${-s * 0.04},${s * 0.44} ${-s * 0.32},${s * 0.25}`} fill="none" stroke="#ffffff" strokeOpacity="0.52" strokeWidth={s * 0.12} strokeLinecap="round" />
            <ellipse cx={s * 0.2} cy={s * 0.18} rx={s * 0.22} ry={s * 0.16} fill="#7A342A" opacity="0.18" />
          </g>
        );
      }
      if (fruit === "coconut") {
        const strips = [-0.52, 0, 0.52].map((x, i) => (
          <g key={i} transform={`translate(${x * s} ${i % 2 ? -s * 0.04 : s * 0.04}) rotate(${i === 0 ? -12 : i === 2 ? 12 : 0})`}>
            <path d={`M${-s * 0.14},${-s * 0.82} C${s * 0.18},${-s * 0.34} ${s * 0.2},${s * 0.4} ${-s * 0.08},${s * 0.86} C${-s * 0.28},${s * 0.42} ${-s * 0.32},${-s * 0.32} ${-s * 0.14},${-s * 0.82} Z`} fill="#F4E8D4" stroke="#8A5A34" strokeWidth={s * 0.06} />
            <path d={`M${-s * 0.11},${-s * 0.72} C${s * 0.04},${-s * 0.2} ${s * 0.03},${s * 0.34} ${-s * 0.08},${s * 0.72}`} fill="none" stroke="#ffffff" strokeOpacity="0.48" strokeWidth={s * 0.06} />
          </g>
        ));
        return <g>{strips}</g>;
      }
      if (fruit === "fig") {
        const seeds = Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2;
          const r = s * (0.16 + (i % 4) * 0.08);
          return <circle key={i} cx={Math.cos(a) * r * 0.9} cy={Math.sin(a) * r * 0.6 + s * 0.08} r={s * 0.025} fill="#F7D28C" opacity="0.9" />;
        });
        return (
          <g>
            <path d={`M0,${-s} C${s * 0.9},${-s * 0.52} ${s * 0.72},${s * 0.85} 0,${s * 1.02} C${-s * 0.72},${s * 0.85} ${-s * 0.9},${-s * 0.52} 0,${-s} Z`} fill="#6E3A2A" />
            <path d={`M0,${-s * 0.72} C${s * 0.62},${-s * 0.34} ${s * 0.46},${s * 0.62} 0,${s * 0.78} C${-s * 0.46},${s * 0.62} ${-s * 0.62},${-s * 0.34} 0,${-s * 0.72} Z`} fill="#C45A65" />
            <ellipse cy={s * 0.08} rx={s * 0.3} ry={s * 0.42} fill="#E8B46A" opacity="0.68" />
            {seeds}
            <path d={`M${-s * 0.42},${-s * 0.48} C${-s * 0.54},${s * 0.05} ${-s * 0.42},${s * 0.46} ${-s * 0.12},${s * 0.68}`} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth={s * 0.08} strokeLinecap="round" />
          </g>
        );
      }
      if (fruit === "guava") {
        const seeds = [[-0.26, -0.05], [0.06, -0.16], [0.28, 0.1], [-0.08, 0.22], [0.1, 0.34]] as const;
        return (
          <g>
            <path d={`M${-s * 0.9},${-s * 0.42} C${-s * 0.34},${-s * 0.92} ${s * 0.82},${-s * 0.54} ${s * 0.86},${s * 0.12} C${s * 0.76},${s * 0.72} ${-s * 0.46},${s * 0.9} ${-s * 0.88},${s * 0.32} Z`} fill="#7EA84A" stroke={darken("#7EA84A", 0.2)} strokeWidth={s * 0.05} />
            <path d={`M${-s * 0.68},${-s * 0.3} C${-s * 0.25},${-s * 0.66} ${s * 0.58},${-s * 0.38} ${s * 0.6},${s * 0.08} C${s * 0.5},${s * 0.5} ${-s * 0.34},${s * 0.66} ${-s * 0.62},${s * 0.22} Z`} fill="#E98A7A" />
            {seeds.map(([x, y], i) => <circle key={i} cx={x * s} cy={y * s} r={s * 0.035} fill="#F3D79B" />)}
            <ellipse cx={-s * 0.22} cy={-s * 0.28} rx={s * 0.22} ry={s * 0.08} fill="#ffffff" opacity="0.26" transform={`rotate(-18 ${-s * 0.22} ${-s * 0.28})`} />
          </g>
        );
      }
      if (fruit === "pineapple") {
        const grid = [-0.4, 0, 0.4].map((x, i) => <line key={`a${i}`} x1={x * s} y1={-s * 0.55} x2={(x + 0.42) * s} y2={s * 0.72} stroke={darken(color, 0.18)} strokeOpacity="0.36" strokeWidth={s * 0.035} />);
        return (
          <g>
            <path d={`M${-s * 0.82},${s * 0.76} L${s * 0.88},${s * 0.44} L${s * 0.2},${-s * 0.86} L${-s * 0.9},${-s * 0.35} Z`} fill={color} stroke={darken(color, 0.22)} strokeWidth={s * 0.05} />
            <path d={`M${-s * 0.9},${-s * 0.35} L${-s * 0.82},${s * 0.76}`} stroke="#7E8A3A" strokeWidth={s * 0.16} strokeLinecap="round" />
            {grid}
            <line x1={-s * 0.58} y1={s * 0.58} x2={s * 0.56} y2={-s * 0.02} stroke={darken(color, 0.18)} strokeOpacity="0.3" strokeWidth={s * 0.035} />
            <ellipse cx={-s * 0.2} cy={-s * 0.28} rx={s * 0.22} ry={s * 0.08} fill="#ffffff" opacity="0.24" transform={`rotate(-25 ${-s * 0.2} ${-s * 0.28})`} />
          </g>
        );
      }
      if (fruit === "apple" || fruit === "pear") {
        const skin = fruit === "apple" ? "#A8C24A" : "#C9D08A";
        return (
          <g>
            <path d={fruit === "pear"
              ? `M0,${-s} C${s * 0.7},${-s * 0.55} ${s * 0.62},${s * 0.7} 0,${s} C${-s * 0.62},${s * 0.7} ${-s * 0.7},${-s * 0.55} 0,${-s} Z`
              : `M0,${-s * 0.9} C${s * 0.82},${-s * 0.72} ${s * 0.82},${s * 0.72} 0,${s * 0.9} C${-s * 0.82},${s * 0.72} ${-s * 0.82},${-s * 0.72} 0,${-s * 0.9} Z`}
              fill={lighten(skin, 0.55)} stroke={skin} strokeWidth={s * 0.12} />
            <path d={`M0,${-s * 0.7} C${s * 0.18},${-s * 0.12} ${s * 0.18},${s * 0.42} 0,${s * 0.68}`} fill="none" stroke="#B78A4A" strokeOpacity="0.45" strokeWidth={s * 0.045} />
            <ellipse cx={s * 0.15} cy={s * 0.22} rx={s * 0.05} ry={s * 0.1} fill="#5A3320" transform={`rotate(15 ${s * 0.15} ${s * 0.22})`} />
            <ellipse cx={-s * 0.22} cy={-s * 0.28} rx={s * 0.18} ry={s * 0.08} fill="#ffffff" opacity="0.28" transform={`rotate(-25 ${-s * 0.22} ${-s * 0.28})`} />
          </g>
        );
      }
      const cut = fruit === "peach" || fruit === "apricot" || fruit === "plum" || fruit === "mango" || fruit === "melon";
      if (cut) {
        const flesh = fruit === "plum" ? "#B65A7A" : fruit === "melon" ? "#F2B878" : lighten(color, 0.28);
        return (
          <g>
            <path d={`M${-s * 0.9},${s * 0.3} C${-s * 0.8},${-s * 0.65} ${s * 0.62},${-s * 0.92} ${s * 0.86},${s * 0.02} C${s * 0.92},${s * 0.68} ${-s * 0.36},${s * 0.9} ${-s * 0.9},${s * 0.3} Z`} fill={flesh} stroke={color} strokeWidth={s * 0.08} />
            <path d={`M${-s * 0.5},${s * 0.36} C${-s * 0.16},${s * 0.08} ${s * 0.08},${s * 0.08} ${s * 0.34},${s * 0.32}`} fill="none" stroke={darken(color, 0.22)} strokeOpacity="0.42" strokeWidth={s * 0.055} strokeLinecap="round" />
            <ellipse cx={-s * 0.24} cy={-s * 0.28} rx={s * 0.22} ry={s * 0.08} fill="#ffffff" opacity="0.26" transform={`rotate(-20 ${-s * 0.24} ${-s * 0.28})`} />
          </g>
        );
      }
      return (
        <g>
          <path d={`M${-s * 0.88},${s * 0.45} C${-s * 0.72},${-s * 0.44} ${s * 0.54},${-s * 0.78} ${s * 0.86},${s * 0.04} C${s * 0.92},${s * 0.64} ${-s * 0.38},${s * 0.9} ${-s * 0.88},${s * 0.45} Z`} fill={lighten(color, 0.45)} stroke={color} strokeWidth={s * 0.1} strokeLinejoin="round" />
          <path d={`M${-s * 0.7},${s * 0.46} C${-s * 0.24},${s * 0.7} ${s * 0.48},${s * 0.52} ${s * 0.72},${s * 0.08}`} fill="none" stroke={darken(color, 0.14)} strokeWidth={s * 0.11} strokeLinecap="round" />
          <ellipse cx={-s * 0.36} cy={-s * 0.18} rx={s * 0.14} ry={s * 0.24} fill="#ffffff" opacity="0.28" transform={`rotate(40 ${-s * 0.36} ${-s * 0.18})`} />
        </g>
      );
    }
    case "mintSprig": {
      // a few pointed leaves up a short stem (grows upward)
      const leaf = (lx: number, ly: number, rot: number, sc: number) => (
        <g transform={`translate(${lx} ${ly}) rotate(${rot}) scale(${sc})`}>
          <path
            d={variant === "verbena"
              ? `M0,0 C${s * 0.34},${-s * 0.42} ${s * 0.24},${-s * 1.18} 0,${-s * 1.55} C${-s * 0.24},${-s * 1.18} ${-s * 0.34},${-s * 0.42} 0,0 Z`
              : variant === "lemonBalm"
                ? `M0,0 C${s * 0.62},${-s * 0.26} ${s * 0.62},${-s * 0.84} 0,${-s * 1.0} C${-s * 0.62},${-s * 0.84} ${-s * 0.62},${-s * 0.26} 0,0 Z`
                : `M0,0 C${s * 0.55},${-s * 0.2} ${s * 0.55},${-s * 0.9} 0,${-s * 1.15} C${-s * 0.55},${-s * 0.9} ${-s * 0.55},${-s * 0.2} 0,0 Z`}
            fill={variant === "spearmint" ? lighten(color, 0.06) : color}
          />
          <path d={`M0,0 L0,${-s * 1.05}`} stroke={darken(color, 0.25)} strokeWidth={s * 0.05} />
          {variant === "spearmint" && <path d={`M${-s * 0.24},${-s * 0.36} L${s * 0.24},${-s * 0.52} M${-s * 0.2},${-s * 0.66} L${s * 0.2},${-s * 0.8}`} stroke={darken(color, 0.16)} strokeOpacity="0.45" strokeWidth={s * 0.035} />}
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
      if (variant === "tarragon") {
        const blades = Array.from({ length: 9 }, (_, i) => {
          const y = -s * 0.28 - i * s * 0.24;
          const side = i % 2 === 0 ? 1 : -1;
          return <path key={i} d={`M0,${y} C${side * s * 0.34},${y - s * 0.12} ${side * s * 0.54},${y - s * 0.44} ${side * s * 0.16},${y - s * 0.62}`} fill="none" stroke={color} strokeWidth={s * 0.09} strokeLinecap="round" />;
        });
        return (
          <g>
            <path d={`M0,0 C${s * 0.08},${-s * 0.9} ${-s * 0.05},${-s * 1.8} 0,${-s * 2.5}`} fill="none" stroke={darken(color, 0.25)} strokeWidth={s * 0.08} strokeLinecap="round" />
            {blades}
          </g>
        );
      }
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
      if (variant === "fennel") {
        const umbels = Array.from({ length: 6 }, (_, i) => {
          const a = -80 + i * 32;
          const x = Math.cos((a * Math.PI) / 180) * s * 0.78;
          const y = -s * 2.05 + Math.sin((a * Math.PI) / 180) * s * 0.5;
          return <g key={i}><line x1="0" y1={-s * 1.35} x2={x} y2={y} stroke={color} strokeWidth={s * 0.045} /><circle cx={x} cy={y} r={s * 0.08} fill={lighten(color, 0.16)} /></g>;
        });
        return (
          <g>
            <path d={`M0,0 C${s * 0.04},${-s * 0.8} ${-s * 0.02},${-s * 1.4} 0,${-s * 2.1}`} stroke={darken(color, 0.2)} strokeWidth={s * 0.07} fill="none" strokeLinecap="round" />
            {umbels}
          </g>
        );
      }
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
      if (variant === "lemongrass") {
        return (
          <g>
            {[-0.42, -0.18, 0.08, 0.32].map((x, i) => (
              <path key={i} d={`M${x * s},${s * 0.9} C${(x + 0.06) * s},${s * 0.1} ${(x + (i % 2 ? -0.28 : 0.28)) * s},${-s * 0.55} ${(x + (i % 2 ? -0.18 : 0.18)) * s},${-s * 1.28}`} fill="none" stroke={i % 2 ? darken(color, 0.05) : color} strokeWidth={s * 0.12} strokeLinecap="round" />
            ))}
          </g>
        );
      }
      if (variant === "pandan") {
        return (
          <g>
            {[-0.34, 0.08, 0.42].map((x, i) => (
              <path key={i} d={`M${x * s},${s * 1.0} C${(x - 0.14) * s},${s * 0.22} ${(x + (i === 1 ? 0.18 : -0.12)) * s},${-s * 0.58} ${(x + (i === 2 ? 0.02 : -0.22)) * s},${-s * 1.32}`} fill="none" stroke={i === 1 ? lighten(color, 0.08) : color} strokeWidth={s * 0.18} strokeLinecap="round" />
            ))}
            <path d={`M${-s * 0.18},${s * 0.78} C${-s * 0.05},${s * 0.08} ${-s * 0.02},${-s * 0.55} ${-s * 0.14},${-s * 1.08}`} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth={s * 0.06} strokeLinecap="round" />
          </g>
        );
      }
      if (variant === "aloe") {
        return (
          <g>
            <path d={`M${-s * 0.52},${s * 1.05} C${-s * 0.16},${s * 0.1} ${-s * 0.12},${-s * 0.78} 0,${-s * 1.22} C${s * 0.16},${-s * 0.7} ${s * 0.34},${s * 0.24} ${s * 0.5},${s * 1.05} Z`} fill={lighten(color, 0.2)} stroke={darken(color, 0.22)} strokeWidth={s * 0.06} />
            <path d={`M0,${-s * 1.0} C${s * 0.02},${-s * 0.28} ${s * 0.06},${s * 0.42} ${s * 0.18},${s * 0.92}`} fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth={s * 0.08} strokeLinecap="round" />
          </g>
        );
      }
      if (variant === "hops") {
        return (
          <g>
            {[0, 1, 2, 3].map((row) => (
              <g key={row}>
                <path d={`M${-s * (0.15 + row * 0.08)},${-s * 0.7 + row * s * 0.38} C${-s * 0.78},${-s * 0.44 + row * s * 0.36} ${-s * 0.42},${s * 0.02 + row * s * 0.22} 0,${-s * 0.15 + row * s * 0.32} C${s * 0.42},${s * 0.02 + row * s * 0.22} ${s * 0.78},${-s * 0.44 + row * s * 0.36} ${s * (0.15 + row * 0.08)},${-s * 0.7 + row * s * 0.38} Z`} fill={row % 2 ? lighten(color, 0.1) : color} opacity={0.92} />
              </g>
            ))}
          </g>
        );
      }
      if (variant === "cilantro") {
        return (
          <g>
            <path d={`M0,${s * 0.95} C${-s * 0.12},0 ${s * 0.08},${-s * 0.52} 0,${-s}`} fill="none" stroke={darken(color, 0.22)} strokeWidth={s * 0.08} />
            {[-0.52, 0, 0.52].map((x, i) => <circle key={i} cx={x * s * 0.55} cy={-s * (0.28 + i * 0.18)} r={s * 0.34} fill={i === 1 ? lighten(color, 0.12) : color} />)}
          </g>
        );
      }
      if (variant === "shiso") {
        const teeth = Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 ? s * 1.05 : s * 0.86;
          return `${Math.cos(a) * r},${Math.sin(a) * r}`;
        }).join(" ");
        return (
          <g>
            <polygon points={teeth} fill={color} stroke={darken(color, 0.25)} strokeWidth={s * 0.04} />
            <path d={`M0,${s * 0.92} L0,${-s * 0.86} M0,0 L${-s * 0.55},${-s * 0.36} M0,0 L${s * 0.55},${-s * 0.36}`} stroke={darken(color, 0.24)} strokeOpacity="0.55" strokeWidth={s * 0.055} />
          </g>
        );
      }
      if (variant === "wormwood") {
        return (
          <g>
            <path d={`M0,${s * 0.95} C${-s * 0.08},${s * 0.2} ${s * 0.08},${-s * 0.6} 0,${-s}`} fill="none" stroke={darken(color, 0.2)} strokeWidth={s * 0.07} />
            {Array.from({ length: 9 }, (_, i) => {
              const y = s * 0.55 - i * s * 0.2;
              const side = i % 2 ? -1 : 1;
              return <path key={i} d={`M0,${y} C${side * s * 0.24},${y - s * 0.08} ${side * s * 0.4},${y - s * 0.26} ${side * s * 0.18},${y - s * 0.42}`} fill="none" stroke={lighten(color, 0.08)} strokeWidth={s * 0.07} strokeLinecap="round" />;
            })}
          </g>
        );
      }
      return (
        <g>
          <path d={`M0,${s} C${s * 0.9},${s * 0.3} ${s * 0.9},${-s * 0.7} 0,${-s} C${-s * 0.9},${-s * 0.7} ${-s * 0.9},${s * 0.3} 0,${s} Z`} fill={color} />
          <path d={`M0,${s} L0,${-s}`} stroke={darken(color, 0.28)} strokeWidth={s * 0.06} />
        </g>
      );
    case "flower": {
      if (variant === "chamomile") {
        return (
          <g>
            {Array.from({ length: 11 }, (_, i) => <ellipse key={i} cx="0" cy={-s * 0.58} rx={s * 0.16} ry={s * 0.48} fill="#F7F0DE" transform={`rotate(${(i / 11) * 360})`} />)}
            <circle r={s * 0.28} fill="#E0B85A" />
            <circle r={s * 0.18} fill="#A8742A" opacity="0.35" />
          </g>
        );
      }
      if (variant === "rose") {
        return (
          <g>
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M0,0 C${s * 0.55},${-s * 0.18} ${s * 0.45},${-s * 0.78} 0,${-s * 0.88} C${-s * 0.45},${-s * 0.78} ${-s * 0.55},${-s * 0.18} 0,0 Z`} fill={i % 2 ? lighten(color, 0.08) : color} opacity={0.92} transform={`rotate(${i * 72}) scale(${1 - i * 0.05})`} />)}
            <path d={`M${-s * 0.32},0 C${-s * 0.1},${-s * 0.34} ${s * 0.28},${-s * 0.18} ${s * 0.08},${s * 0.12}`} fill="none" stroke={darken(color, 0.24)} strokeOpacity="0.45" strokeWidth={s * 0.06} />
          </g>
        );
      }
      if (variant === "jasmine") {
        return (
          <g>
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M0,0 C${s * 0.32},${-s * 0.18} ${s * 0.28},${-s * 0.82} 0,${-s * 1.02} C${-s * 0.28},${-s * 0.82} ${-s * 0.32},${-s * 0.18} 0,0 Z`} fill="#F4F0D8" transform={`rotate(${i * 72 + 12})`} />)}
            <circle r={s * 0.16} fill="#D8C86A" />
          </g>
        );
      }
      if (variant === "osmanthus") {
        return (
          <g>
            {[[-0.45, -0.2], [0.25, -0.32], [0.42, 0.28], [-0.18, 0.38], [0, 0]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x * s} ${y * s}) scale(0.55)`}>
                {Array.from({ length: 4 }, (_, j) => <ellipse key={j} cx="0" cy={-s * 0.26} rx={s * 0.13} ry={s * 0.26} fill="#E0B85A" transform={`rotate(${j * 90})`} />)}
              </g>
            ))}
          </g>
        );
      }
      if (variant === "violet") {
        return (
          <g>
            <ellipse cx={-s * 0.28} cy={-s * 0.18} rx={s * 0.34} ry={s * 0.45} fill={color} transform={`rotate(-28 ${-s * 0.28} ${-s * 0.18})`} />
            <ellipse cx={s * 0.28} cy={-s * 0.18} rx={s * 0.34} ry={s * 0.45} fill={lighten(color, 0.08)} transform={`rotate(28 ${s * 0.28} ${-s * 0.18})`} />
            <ellipse cy={s * 0.2} rx={s * 0.42} ry={s * 0.35} fill={darken(color, 0.06)} />
            <circle r={s * 0.12} fill="#E0B85A" />
          </g>
        );
      }
      if (variant === "elderflower") {
        return (
          <g>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2;
              const x = Math.cos(a) * s * 0.46;
              const y = Math.sin(a) * s * 0.34;
              return <g key={i} transform={`translate(${x} ${y}) scale(0.45)`}>{Array.from({ length: 5 }, (_, j) => <ellipse key={j} cx="0" cy={-s * 0.3} rx={s * 0.12} ry={s * 0.28} fill="#F0EBCF" transform={`rotate(${j * 72})`} />)}<circle r={s * 0.1} fill="#D8C86A" /></g>;
            })}
          </g>
        );
      }
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
        <g transform="scale(0.76 1.18)">
          <path
            d={`M${-s * 0.56},${-s * 2.48} C${-s * 0.72},${-s * 1.82} ${-s * 0.64},${-s * 0.68} ${-s * 0.48},${s * 0.08} C${-s * 0.22},${s * 0.24} ${s * 0.3},${s * 0.16} ${s * 0.52},${-s * 0.08} C${s * 0.42},${-s * 0.82} ${s * 0.58},${-s * 1.74} ${s * 0.46},${-s * 2.46} C${s * 0.18},${-s * 2.34} ${-s * 0.22},${-s * 2.32} ${-s * 0.56},${-s * 2.48} Z`}
            fill={color}
          />
          <path d={`M${-s * 0.5},${-s * 2.42} C${-s * 0.32},${-s * 2.6} ${s * 0.18},${-s * 2.62} ${s * 0.42},${-s * 2.42} C${s * 0.1},${-s * 2.47} ${-s * 0.22},${-s * 2.42} ${-s * 0.42},${-s * 2.27} Z`} fill={darken(color, 0.34)} opacity="0.78" />
          <path d={`M${-s * 0.58},${-s * 2.38} C${-s * 0.22},${-s * 2.22} ${s * 0.22},${-s * 2.22} ${s * 0.5},${-s * 2.4}`} fill="none" stroke={lighten(color, 0.28)} strokeWidth={s * 0.07} strokeLinecap="round" opacity="0.55" />
          <path d={`M${-s * 0.5},${-s * 2.16} C${-s * 0.62},${-s * 1.48} ${-s * 0.52},${-s * 0.56} ${-s * 0.34},${-s * 0.02} C${-s * 0.2},${s * 0.1} ${-s * 0.06},${s * 0.1} ${s * 0.08},${-s * 0.02} C${-s * 0.08},${-s * 0.66} ${-s * 0.14},${-s * 1.5} ${-s * 0.06},${-s * 2.18} Z`} fill={darken(color, 0.18)} opacity="0.52" />
          <path d={`M${s * 0.26},${-s * 2.28} C${s * 0.1},${-s * 1.42} ${s * 0.16},${-s * 0.56} ${s * 0.3},${-s * 0.1}`} fill="none" stroke={lighten(color, 0.3)} strokeWidth={s * 0.085} strokeLinecap="round" opacity="0.68" />
          <path d={`M${-s * 0.23},${-s * 2.22} C${-s * 0.34},${-s * 1.48} ${-s * 0.28},${-s * 0.82} ${-s * 0.2},${-s * 0.18} M${s * 0.04},${-s * 2.14} C${-s * 0.04},${-s * 1.42} ${s * 0.04},${-s * 0.72} ${s * 0.08},${-s * 0.16}`} fill="none" stroke={darken(color, 0.18)} strokeWidth={s * 0.045} strokeLinecap="round" opacity="0.62" />
          <path d={`M${-s * 0.42},${-s * 1.82} C${-s * 0.1},${-s * 1.96} ${s * 0.24},${-s * 1.9} ${s * 0.43},${-s * 1.74} M${-s * 0.45},${-s * 1.16} C${-s * 0.1},${-s * 1.28} ${s * 0.26},${-s * 1.18} ${s * 0.43},${-s * 1.02} M${-s * 0.38},${-s * 0.52} C${-s * 0.06},${-s * 0.62} ${s * 0.24},${-s * 0.54} ${s * 0.38},${-s * 0.42}`} fill="none" stroke={darken(color, 0.28)} strokeWidth={s * 0.04} strokeLinecap="round" opacity="0.5" />
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
  /** the drink's body / shadow colours — tint only the submerged part of floaters */
  liquidColor?: string;
  liquidShadow?: string;
  surfaceHighlight?: string;
  /** no liquid in the glass — skip the waterline so botanicals
   *  just rest in the glass rather than reading as floating on nothing */
  dry?: boolean;
}

/**
 * Garnishes laid out in two passes so they read as *inside* the glass:
 *  - back: foam, floating fruit/coffee/beans, dusting — clipped to the cup and
 *    drawn before the front glass wall, so you see them through the glass.
 *  - front: salt/sugar rim crust and tall sprigs/sticks resting on the lip.
 */
export function GarnishLayer({ specs, rim, cupTop, liquidTop, surfaceHW, layer, clipId, liquidColor = "#9A5826", liquidShadow = "#3A1E0C", surfaceHighlight = "#fff8ea", dry = false }: GarnishLayerProps) {
  const uid = useId().replace(/:/g, "");
  if (!specs.length) return null;
  const contactShadow = darken(liquidShadow, 0.42);
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
          <filter id={`garnishShadow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>
          <filter id={`garnishLine-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.35" />
          </filter>
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
          const tintMaskId = `garnishTint-${uid}-${i}`;
          return (
            <g key={`s${i}`} transform={`translate(${x} ${y})`}>
              {!dry && (
                <defs>
                  <mask id={tintMaskId} maskUnits="userSpaceOnUse" x={-sItem * 1.8} y={-sItem * 3} width={sItem * 3.6} height={sItem * 5}>
                    <Shape kind={g.kind} color="#ffffff" s={sItem} fruit={g.fruit} variant={g.variant} />
                  </mask>
                </defs>
              )}
              {/* soft contact shadow cast down into the drink */}
              <ellipse cx={sItem * 0.16} cy={sItem * 0.58} rx={sItem * 0.72} ry={sItem * 0.24} fill={contactShadow} opacity="0.32" filter={`url(#garnishShadow-${uid})`} />
              {/* the garnish itself */}
              <Shape kind={g.kind} color={g.color} s={sItem} fruit={g.fruit} variant={g.variant} />
              {/* liquid-only finishing: tint only the submerged part inside the garnish shape */}
              {!dry && <rect x={-sItem * 1.8} y={wl} width={sItem * 3.6} height={sItem * 3} fill={liquidColor} opacity="0.18" mask={`url(#${tintMaskId})`} />}
              {!dry && <ellipse cx="0" cy={wl} rx={sItem * 0.86} ry={Math.max(1, sItem * 0.16)} fill="none" stroke="#fff8ea" strokeOpacity="0.28" strokeWidth="0.65" filter={`url(#garnishLine-${uid})`} />}
              {!dry && <ellipse cx="0" cy={wl} rx={sItem * 0.86} ry={Math.max(1, sItem * 0.16)} fill="#ffffff" opacity="0.04" filter={`url(#garnishLine-${uid})`} />}
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
      <defs>
        <filter id={`garnishShadow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
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
        const sinksIntoLiquid = g.kind === "cinnamonStick" || g.kind === "vanillaPod" || g.kind === "chili";
        const off = m === 1 ? (sinksIntoLiquid ? 0.28 : 0.16) : i / (m - 1) - 0.5; // -0.5..0.5 (single leans to a wall)
        const ax = 100 + off * rim.rx * 1.08;
        // plant the stalk DOWN into the drink (base at the liquid surface) so soft
        // herbs like mint sit inside the glass / lean on the wall, half-submerged;
        // only rest on the lip when the liquid is right up at the brim (or empty,
        // where liquidTop sits at the cup base → it stands from the bottom).
        const restOnRim = liquidTop <= rim.cy + 6;
        const surfaceY = restOnRim ? rim.cy + 1 : liquidTop - 2;
        const rot = sinksIntoLiquid ? (m === 1 ? 22 : off * 38) : off * 26;
        const isCinnamon = g.kind === "cinnamonStick";
        const sTall = Math.max(7, Math.min(isCinnamon ? 17 : 14, surfaceHW * (isCinnamon ? 0.44 : 0.34)));
        const baseY = !restOnRim && sinksIntoLiquid ? liquidTop + Math.max(13, sTall * 0.82) : surfaceY;
        const isSubmerged = !restOnRim && sinksIntoLiquid && !dry;
        const submergeMaskId = `garnishSubmerge-${uid}-${i}`;
        const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
        return (
          <g key={`t${i}`}>
            {isSubmerged && (
              <defs>
                <mask id={submergeMaskId} maskUnits="userSpaceOnUse" x="0" y={liquidTop - 4} width="200" height="90">
                  <g transform={`translate(${ax} ${baseY}) rotate(${rot})`}>
                    <g transform={`scale(${grow})`}>
                      <Shape kind={g.kind} color="#ffffff" s={sTall} fruit={g.fruit} variant={g.variant} />
                    </g>
                  </g>
                </mask>
              </defs>
            )}
            {/* shadow where the stalk meets the surface / lip */}
            <ellipse cx={ax + 1.5} cy={surfaceY + 2.3} rx={sTall * 0.58} ry={Math.max(1.1, sTall * 0.18)} fill={contactShadow} opacity="0.28" filter={`url(#garnishShadow-${uid})`} />
            <g transform={`translate(${ax} ${baseY}) rotate(${rot})`}>
              <g transform={`scale(${grow})`}>
                <Shape kind={g.kind} color={g.color} s={sTall} fruit={g.fruit} variant={g.variant} />
              </g>
            </g>
            {isSubmerged && (
              <>
                <rect x="0" y={liquidTop - 1} width="200" height="90" fill={liquidColor} opacity="0.52" mask={`url(#${submergeMaskId})`} />
                <ellipse cx={ax + 0.7} cy={liquidTop + sTall * 0.1} rx={sTall * 0.92} ry={Math.max(1.2, sTall * 0.2)} fill={liquidColor} opacity="0.66" filter={`url(#garnishShadow-${uid})`} />
                <path
                  d={`M${ax - sTall * 0.9},${liquidTop + sTall * 0.06} C${ax - sTall * 0.38},${liquidTop - sTall * 0.14} ${ax + sTall * 0.44},${liquidTop - sTall * 0.12} ${ax + sTall * 0.95},${liquidTop + sTall * 0.06}`}
                  fill="none"
                  stroke={surfaceHighlight}
                  strokeOpacity="0.5"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  filter={`url(#garnishShadow-${uid})`}
                />
                <path
                  d={`M${ax - sTall * 0.54},${liquidTop - sTall * 0.02} C${ax - sTall * 0.12},${liquidTop - sTall * 0.13} ${ax + sTall * 0.36},${liquidTop - sTall * 0.1} ${ax + sTall * 0.62},${liquidTop + sTall * 0.02}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.18"
                  strokeWidth="0.55"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
