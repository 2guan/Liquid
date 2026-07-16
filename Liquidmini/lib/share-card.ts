/**
 * Share card — a faithful canvas port of the web build's src/lib/share.ts,
 * drawn onto a WeChat 2D canvas. Same layout, same glass/ice/garnish painting,
 * same gold frames / dividers / QR. Two adaptations for the mini-program:
 *   - WeChat's 2D canvas has no reliable Path2D(svgString); SVG path data is
 *     replayed onto the current path by `trace()` (M/L/H/V/C/S/Q/T/A/Z).
 *   - The QR matrix for the fixed deployment URL is baked at build time
 *     (the web build generated it at runtime via the `qrcode` lib).
 */
import type { CocktailResult } from "./types";
import { liquidRamp, rampFromColor, isFizzy, layerBands, layerGradientStops } from "./tokens";
import { glassById, iceById } from "./data/catalog";
import { geomFor, halfWidthAt, servedFill } from "./data/glasses";
import { garnishesFor, type GarnishSpec, type GarnishKind } from "./data/garnish";

const W = 720;
const PAD = 72;
const CX = W / 2;

const CN = '"Maoken Fengyasong","Songti SC","STSong",serif';
const EN = 'Georgia,"Times New Roman",serif';

/** QR for https://sip.guantools.top (errorCorrectionLevel "M") — baked. */
const QR_SIZE = 25;
const QR_BITS =
  "1111111000000100101111111100000100101111100100000110111010101100111010111011011101011111111101011101101110101001110010101110110000010100001110010000011111111010101010101111111000000001100001010000000010111110001101100011111000010110100000100100100010110111100101001110011101101011000000010010110000011010001110001111011110111101001011000001011010101010100011010111011011110111001110001010011101110001100111110101110111111010000000000101011001000110001111111001101110101010111100000101000100010001101110111010111001111111101001011101011110010101011111101110101000001000000110110000010001100011101110011111111010011110000111111";

type Op =
  | { t: "text"; x: number; y: number; size: number; color: string; stack: string; align: string; italic?: boolean; spacing?: number; text: string; tag?: "body" | "sig" }
  | { t: "line"; x1: number; x2: number; y: number; opacity: number }
  | { t: "qr"; x: number; y: number; area: number };

interface Layout { H: number; ops: Op[]; haloCy: number; }

const TAU = Math.PI * 2;

function withAlpha(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function mixHex(hex: string, target: number, amt: number): string {
  const m = hex.replace("#", "");
  const ch = (i: number) => {
    const c = parseInt(m.slice(i, i + 2), 16);
    return Math.max(0, Math.min(255, Math.round(c + (target - c) * amt))).toString(16).padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}
const lighten = (hex: string, amt: number) => mixHex(hex, 255, amt);
const darken = (hex: string, amt: number) => mixHex(hex, 0, amt);
const deg = (d: number) => (d * Math.PI) / 180;

function wrapCJK(text: string, perLine: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const out: string[] = [];
  let line = "";
  for (const ch of clean) {
    line += ch;
    if (line.length >= perLine) { out.push(line); line = ""; }
  }
  if (line.trim()) out.push(line);
  return out;
}

/* ── SVG path → current canvas path (replaces Path2D) ── */
function trace(ctx: any, d: string): void {
  ctx.beginPath();
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
  if (!tokens) return;
  let i = 0;
  let cmd = "";
  let x = 0, y = 0, sx = 0, sy = 0;
  let pcx = 0, pcy = 0; // previous control point (for S/T)
  const num = () => parseFloat(tokens[i++]);
  const isCmd = (t: string) => /[A-Za-z]/.test(t);
  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "M") {
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num();
      ctx.moveTo(x, y); sx = x; sy = y; cmd = rel ? "l" : "L";
    } else if (C === "L") {
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num(); ctx.lineTo(x, y);
    } else if (C === "H") {
      x = (rel ? x : 0) + num(); ctx.lineTo(x, y);
    } else if (C === "V") {
      y = (rel ? y : 0) + num(); ctx.lineTo(x, y);
    } else if (C === "C") {
      const x1 = (rel ? x : 0) + num(), y1 = (rel ? y : 0) + num();
      const x2 = (rel ? x : 0) + num(), y2 = (rel ? y : 0) + num();
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num();
      ctx.bezierCurveTo(x1, y1, x2, y2, x, y); pcx = x2; pcy = y2;
    } else if (C === "S") {
      const x1 = 2 * x - pcx, y1 = 2 * y - pcy;
      const x2 = (rel ? x : 0) + num(), y2 = (rel ? y : 0) + num();
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num();
      ctx.bezierCurveTo(x1, y1, x2, y2, x, y); pcx = x2; pcy = y2;
    } else if (C === "Q") {
      const x1 = (rel ? x : 0) + num(), y1 = (rel ? y : 0) + num();
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num();
      ctx.quadraticCurveTo(x1, y1, x, y); pcx = x1; pcy = y1;
    } else if (C === "T") {
      const x1 = 2 * x - pcx, y1 = 2 * y - pcy;
      x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num();
      ctx.quadraticCurveTo(x1, y1, x, y); pcx = x1; pcy = y1;
    } else if (C === "A") {
      const rx = num(), ry = num(), rot = num(), large = num(), sweep = num();
      const ex = (rel ? x : 0) + num(), ey = (rel ? y : 0) + num();
      arc(ctx, x, y, rx, ry, rot, large, sweep, ex, ey);
      x = ex; y = ey;
    } else if (C === "Z") {
      ctx.closePath(); x = sx; y = sy;
    }
  }
}

/** Endpoint → centre elliptical arc, replayed via ctx.ellipse. */
function arc(ctx: any, x1: number, y1: number, rx: number, ry: number, rotDeg: number, large: number, sweep: number, x2: number, y2: number): void {
  if (rx === 0 || ry === 0) { ctx.lineTo(x2, y2); return; }
  rx = Math.abs(rx); ry = Math.abs(ry);
  const phi = deg(rotDeg);
  const cosP = Math.cos(phi), sinP = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cosP * dx + sinP * dy;
  const y1p = -sinP * dx + cosP * dy;
  let r2x = rx * rx, r2y = ry * ry;
  const lam = (x1p * x1p) / r2x + (y1p * y1p) / r2y;
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; r2x = rx * rx; r2y = ry * ry; }
  let sign = large !== sweep ? 1 : -1;
  let num = r2x * r2y - r2x * y1p * y1p - r2y * x1p * x1p;
  if (num < 0) num = 0;
  const den = r2x * y1p * y1p + r2y * x1p * x1p;
  const co = sign * Math.sqrt(num / (den || 1e-9));
  const cxp = (co * rx * y1p) / ry;
  const cyp = (-co * ry * x1p) / rx;
  const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2;
  const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy)) || 1e-9;
    let a = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const theta1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dTheta = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dTheta > 0) dTheta -= TAU;
  if (sweep && dTheta < 0) dTheta += TAU;
  ctx.ellipse(cx, cy, rx, ry, phi, theta1, theta1 + dTheta, !sweep);
}

function ellipse(ctx: any, cx: number, cy: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
}
function rr(ctx: any, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function strokeRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: number, stroke: string, lw: number): void {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
}
function setSpacing(ctx: any, px: number): void {
  try { ctx.letterSpacing = `${px}px`; } catch (e) { /* unsupported */ }
}

/* ── layout (1:1 with web layout()) ── */
function layout(result: CocktailResult): Layout {
  const ops: Op[] = [];
  let y = 78;
  ops.push({ t: "text", x: CX, y, size: 13, color: "rgba(200,164,93,0.72)", stack: CN, align: "center", spacing: 4, text: "微醺时刻 · THE SIP & SIGH" });
  y += 16;
  ops.push({ t: "line", x1: CX - 34, x2: CX + 34, y, opacity: 0.45 });
  y += 30;

  const glassH = 210;
  const haloCy = y + glassH * 0.44;
  y += glassH + 40;

  ops.push({ t: "text", x: CX, y, size: 46, color: "#EFE2BE", stack: CN, align: "center", text: result.name });
  y += 34;
  ops.push({ t: "text", x: CX, y, size: 23, color: "#C8A45D", stack: EN, align: "center", italic: true, text: result.nameEn });
  y += 46;

  divider(ops, y, "专属配方 · THE RECIPE");
  y += 40;
  for (const ing of result.ingredients) {
    ops.push({ t: "text", x: PAD, y, size: 21, color: "#E7D6B1", stack: CN, align: "left", text: ing.name });
    ops.push({ t: "text", x: W - PAD, y, size: 19, color: "#C8A45D", stack: CN, align: "right", text: ing.amount });
    y += 37;
  }
  y += 6;
  ops.push({ t: "text", x: CX, y, size: 17, color: "rgba(231,214,177,0.7)", stack: CN, align: "center", spacing: 1, text: `${glassById(result.glass).name}　·　${iceById(result.ice).name}` });
  y += 48;

  const storyBody = result.story.replace(/\n[\s\S]*$/, "").trim();
  // story body is left-aligned across the left 3/4; the mini-code occupies the
  // right quarter, vertically centred against the text block.
  const QSIZE = 106;                 // mini-code column (20% smaller)
  const textRight = W - PAD - QSIZE - 20;                      // body column right edge
  const qrX = textRight + (W - PAD - textRight - QSIZE) / 2;   // code centred in the right region
  const lines = wrapCJK(storyBody, 25).slice(0, 6);
  if (lines.length) {
    divider(ops, y, "微醺絮语 · THE STORY"); // full-width rules, same as 专属配方
    const blockTop = y + 42;
    const lineH = 33;
    let ty = blockTop;
    for (const line of lines) {
      ops.push({ t: "text", x: PAD, y: ty, size: 18, color: "rgba(231,214,177,0.82)", stack: CN, align: "left", text: line, tag: "body" });
      ty += lineH;
    }
    let qrY = blockTop + ((lines.length - 1) * lineH) / 2 - QSIZE / 2 - 9;
    if (qrY < y + 4) qrY = y + 4;
    ops.push({ t: "qr", x: qrX, y: qrY, area: QSIZE });
    y = ty + 14;
  } else {
    ops.push({ t: "qr", x: qrX, y, area: QSIZE });
    y += QSIZE + 10;
  }

  const m = result.story.match(/——\s*([^\n]+)\s*$/);
  const signature = (m && m[1] ? m[1].trim() : "") || "The Sip & Sigh";
  ops.push({ t: "text", x: textRight, y, size: 18, color: "rgba(200,164,93,0.85)", stack: CN, align: "right", italic: true, text: `—— ${signature}`, tag: "sig" });
  y += 44;

  return { H: Math.round(y), ops, haloCy };
}
function divider(ops: Op[], y: number, label: string, rightEnd: number = W - PAD): void {
  const gap = 96;
  ops.push({ t: "line", x1: PAD, x2: CX - gap, y: y - 5, opacity: 0.3 });
  ops.push({ t: "line", x1: CX + gap, x2: rightEnd, y: y - 5, opacity: 0.3 });
  ops.push({ t: "text", x: CX, y, size: 13, color: "#C8A45D", stack: CN, align: "center", spacing: 2, text: label });
}

/**
 * Draw the full share card. Sizes the canvas node, paints, returns {W,H} so the
 * caller can canvasToTempFilePath the exact region.
 */
export function drawShareCard(canvas: any, ctx: any, dpr: number, result: CocktailResult, qrImg?: any): { W: number; H: number } {
  const clearFam = ["gin", "vodka", "sparkling", "rumWhite"].indexOf(result.family) > -1;
  const [hi, body, shadow] = result.liquidColor
    ? rampFromColor(result.liquidColor)
    : clearFam
      ? (["#EEF6F8", "#D6E6EC", "#A2BAC4"] as [string, string, string])
      : liquidRamp[result.family] || liquidRamp.default;

  const { H, ops, haloCy } = layout(result);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.textBaseline = "alphabetic";

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1B150F"); bg.addColorStop(0.55, "#120E0A"); bg.addColorStop(1, "#0C0907");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // halo behind the glass
  const halo = ctx.createRadialGradient(CX, haloCy, 0, CX, haloCy, 300);
  halo.addColorStop(0, withAlpha(hi, 0.32));
  halo.addColorStop(0.6, withAlpha(shadow, 0.07));
  halo.addColorStop(1, withAlpha(shadow, 0));
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

  // gold frames
  strokeRoundRect(ctx, 22, 22, W - 44, H - 44, 22, "rgba(200,164,93,0.42)", 1);
  strokeRoundRect(ctx, 32, 32, W - 64, H - 64, 15, "rgba(200,164,93,0.16)", 1);

  // glass
  drawGlass(ctx, result, hi, body, shadow, 124, 210, isFizzy(result.ingredients), garnishesFor(result.ingredients));

  // text + rules + qr
  let bodyRight = 0; // furthest right edge of the story body — signature aligns to it
  for (const op of ops) {
    if (op.t === "line") {
      ctx.strokeStyle = withAlpha("#C8A45D", op.opacity); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(op.x1, op.y); ctx.lineTo(op.x2, op.y); ctx.stroke();
      continue;
    }
    if (op.t === "qr") {
      // mini-program code image when available; fall back to the baked matrix
      if (qrImg) {
        ctx.drawImage(qrImg, op.x, op.y, op.area, op.area);
        continue;
      }
      const n = QR_SIZE;
      const cell = op.area / n;
      ctx.fillStyle = "rgba(200,164,93,0.5)";
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (QR_BITS[r * n + c] === "1") ctx.fillRect(op.x + c * cell, op.y + r * cell, cell + 0.5, cell + 0.5);
        }
      }
      continue;
    }
    ctx.font = `${op.italic ? "italic " : ""}${op.size}px ${op.stack}`;
    ctx.fillStyle = op.color;
    setSpacing(ctx, op.spacing || 0);
    if (op.tag === "body") {
      // left-aligned line; remember the furthest right edge so the signature lines up
      ctx.textAlign = "left";
      ctx.fillText(op.text, op.x, op.y);
      bodyRight = Math.max(bodyRight, op.x + ctx.measureText(op.text).width);
      continue;
    }
    if (op.tag === "sig") {
      // flush-right to the body's true rightmost edge
      ctx.textAlign = "right";
      ctx.fillText(op.text, bodyRight || op.x, op.y);
      continue;
    }
    ctx.textAlign = op.align;
    ctx.fillText(op.text, op.x, op.y);
  }
  setSpacing(ctx, 0);

  return { W, H };
}

/**
 * A compact 5:4 share thumbnail — just the 酒杯 + 酒名 — for onShareAppMessage's
 * imageUrl (the chat card crops to 5:4). 720×576 so the glass still centres on
 * the module CX=360 used by drawGlass.
 */
export function drawShareThumb(canvas: any, ctx: any, dpr: number, result: CocktailResult): { W: number; H: number } {
  const TW = 720, TH = 576;
  const clearFam = ["gin", "vodka", "sparkling", "rumWhite"].indexOf(result.family) > -1;
  const [hi, body, shadow] = result.liquidColor
    ? rampFromColor(result.liquidColor)
    : clearFam
      ? (["#EEF6F8", "#D6E6EC", "#A2BAC4"] as [string, string, string])
      : liquidRamp[result.family] || liquidRamp.default;

  canvas.width = TW * dpr;
  canvas.height = TH * dpr;
  ctx.scale(dpr, dpr);
  ctx.textBaseline = "alphabetic";

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, TH);
  bg.addColorStop(0, "#1B150F"); bg.addColorStop(0.55, "#120E0A"); bg.addColorStop(1, "#0C0907");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, TW, TH);

  // halo behind the glass
  const haloCy = 60 + 300 * 0.44;
  const halo = ctx.createRadialGradient(360, haloCy, 0, 360, haloCy, 300);
  halo.addColorStop(0, withAlpha(hi, 0.32));
  halo.addColorStop(0.6, withAlpha(shadow, 0.07));
  halo.addColorStop(1, withAlpha(shadow, 0));
  ctx.fillStyle = halo; ctx.fillRect(0, 0, TW, TH);

  // thin gold frame
  strokeRoundRect(ctx, 16, 16, TW - 32, TH - 32, 18, "rgba(200,164,93,0.4)", 1);

  // the glass (centred on CX=360)
  drawGlass(ctx, result, hi, body, shadow, 60, 300, isFizzy(result.ingredients), garnishesFor(result.ingredients));

  // name + english + brand
  ctx.textAlign = "center";
  ctx.fillStyle = "#EFE2BE";
  ctx.font = `46px ${CN}`;
  ctx.fillText(result.name, 360, 442);
  ctx.fillStyle = "#C8A45D";
  ctx.font = `italic 26px ${EN}`;
  ctx.fillText(result.nameEn, 360, 480);
  ctx.fillStyle = "rgba(200,164,93,0.72)";
  ctx.font = `13px ${CN}`;
  setSpacing(ctx, 3);
  ctx.fillText("微醺时刻 · THE SIP & SIGH", 360, 526);
  setSpacing(ctx, 0);

  return { W: TW, H: TH };
}

/* ── glass (1:1 with web drawGlass) ── */
function drawGlass(ctx: any, result: CocktailResult, hi: string, body: string, shadow: string, topY: number, targetH: number, fizzy: boolean, garnishes: GarnishSpec[]): void {
  const geom = geomFor(result.glass);
  const rim = geom.rim;
  const s = targetH / (geom.content.bottom - geom.content.top);
  const level = result.fillLevel != null ? result.fillLevel : servedFill(result.glass);
  const liquidTop = geom.cup.bottom - level * (geom.cup.bottom - geom.cup.top);
  const surfHW = Math.max(2, halfWidthAt(geom, liquidTop) - 2);
  const surfRy = surfHW * 0.14 + 1.5;
  const fillBottom = geom.cup.bottom + 30;
  const cupH = geom.cup.bottom - geom.cup.top;
  const cb = geom.cup.bottom;
  const interiorHW = Math.max(halfWidthAt(geom, cb - 5), halfWidthAt(geom, geom.cup.top + cupH * 0.62)) - 4;
  // dry (garnish-only) glass: skip the liquid and rest botanicals low in the cup
  const dry = level <= 0.005;
  const gTop = dry ? geom.cup.bottom - cupH * 0.22 : liquidTop;
  const gHW = dry ? Math.max(3, halfWidthAt(geom, gTop) - 3) : surfHW;

  const ice = result.ice;
  let iceR = 0, iceY = 0;
  if (ice === "sphere") {
    iceR = Math.max(10, Math.min(interiorHW * 0.9, cupH * 0.52));
    iceY = cb - iceR - 1;
  } else if (ice === "cube") {
    iceR = Math.max(9, Math.min(interiorHW * 0.74, cupH * 0.44));
    iceY = cb - iceR - 2;
  } else if (ice === "crushed") {
    iceR = Math.max(16, interiorHW * 0.96);
    iceY = cb - Math.min(iceR * 0.5, cupH * 0.42);
  } else if (ice === "cubes" || ice === "bullets") {
    iceR = interiorHW;
    iceY = (liquidTop + cb) / 2;
  }

  ctx.save();
  ctx.translate(CX - 100 * s, topY - geom.content.top * s);
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (geom.stem) {
    trace(ctx, geom.stem); ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
    trace(ctx, geom.stem); ctx.strokeStyle = "rgba(231,214,177,0.32)"; ctx.lineWidth = 1; ctx.stroke();
  }

  trace(ctx, geom.outline); ctx.fillStyle = "rgba(255,255,255,0.045)"; ctx.fill();

  // ── liquid, clipped to the bowl ──
  ctx.save();
  trace(ctx, geom.outline); ctx.clip();
  const fam = result.family;
  const clearFam = fam === "gin" || fam === "vodka" || fam === "sparkling" || fam === "rumWhite";
  const opaqueFam = fam === "cream" || fam === "coffeeMilk" || fam === "pinacolada" || fam === "tomato";
  let aT = 0.86, aM = 0.85, aB = 0.96;
  if (result.liquidColor) {
    const m = result.liquidColor.replace("#", "");
    const cr = parseInt(m.slice(0, 2), 16) || 0, cg = parseInt(m.slice(2, 4), 16) || 0, cbb = parseInt(m.slice(4, 6), 16) || 0;
    const sat = (Math.max(cr, cg, cbb) - Math.min(cr, cg, cbb)) / 255;
    const f = Math.max(0.34, Math.min(0.9, 0.36 + sat * 0.72));
    aT = f; aM = f; aB = Math.min(1, f + 0.16);
  } else if (clearFam) { aT = 0.56; aM = 0.5; aB = 0.8; }
  else if (opaqueFam) { aT = 0.97; aM = 0.97; aB = 1; }
  // colour-layered drinks (B-52…) fill as discrete bands; others as a gradient.
  // skip all liquid drawing when the glass is dry (garnish-only)
  if (!dry) {
  const bands = result.layers && result.layers.length > 1 ? layerBands(result.layers, liquidTop, fillBottom) : null;
  if (bands) {
    // one continuous gradient over the whole liquid → no seam lines, translucent
    const lg = ctx.createLinearGradient(0, liquidTop, 0, fillBottom);
    for (const s of layerGradientStops(bands, liquidTop, fillBottom)) lg.addColorStop(s.offset, withAlpha(s.color, 0.7));
    ctx.fillStyle = lg; ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
  } else {
    const liq = ctx.createLinearGradient(0, liquidTop, 0, fillBottom);
    liq.addColorStop(0, withAlpha(hi, aT)); liq.addColorStop(0.45, withAlpha(body, aM)); liq.addColorStop(1, withAlpha(shadow, aB));
    ctx.fillStyle = liq; ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
    const liqEdge = ctx.createLinearGradient(0, 0, 200, 0);
    liqEdge.addColorStop(0, withAlpha(shadow, 0.58)); liqEdge.addColorStop(0.09, withAlpha(shadow, 0.22)); liqEdge.addColorStop(0.24, withAlpha(shadow, 0));
    liqEdge.addColorStop(0.6, withAlpha(hi, 0.1)); liqEdge.addColorStop(0.78, withAlpha(shadow, 0)); liqEdge.addColorStop(0.92, withAlpha(shadow, 0.26)); liqEdge.addColorStop(1, withAlpha(shadow, 0.5));
    ctx.fillStyle = liqEdge; ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
  }
  const surfHi = bands ? bands[bands.length - 1].hi : hi;
  const baseHi = bands ? bands[0].hi : hi;
  ctx.globalAlpha = 0.3; ctx.fillStyle = baseHi; ellipse(ctx, 100, cb - 5, surfHW * 0.74, 7); ctx.fill(); ctx.globalAlpha = 1;
  ctx.globalAlpha = 0.55; ctx.fillStyle = surfHi; ellipse(ctx, 100, liquidTop, surfHW, surfRy); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,246,226,0.5)"; ctx.lineWidth = 0.8; ellipse(ctx, 100, liquidTop, surfHW, surfRy); ctx.stroke();
  if (fizzy) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const col = cb - 3 - liquidTop;
    const B: number[][] = [[-0.42, 0.18, 1.7], [0.34, 0.42, 1.1], [-0.12, 0.6, 1.9], [0.46, 0.74, 1.0], [0.06, 0.3, 1.4], [-0.5, 0.66, 1.2], [0.22, 0.86, 0.9], [-0.3, 0.5, 1.5], [0.5, 0.24, 1.0], [-0.04, 0.78, 1.2]];
    for (const [dx, f, r] of B) { ctx.beginPath(); ctx.ellipse(100 + dx * surfHW * 0.78, cb - 3 - f * col, r, r, 0, 0, TAU); ctx.fill(); }
  }
  }
  ctx.restore();

  if (ice !== "none") {
    ctx.save(); trace(ctx, geom.outline); ctx.clip();
    drawIce(ctx, ice as any, 100, iceY, iceR, liquidTop, body, liquidTop, geom.cup.bottom, interiorHW);
    ctx.restore();
  }

  if (garnishes.length) {
    ctx.save(); trace(ctx, geom.outline); ctx.clip();
    drawGarnishLayer(ctx, garnishes, "back", rim, geom.cup.top, gTop, gHW, body, shadow, dry);
    ctx.restore();
  }

  // optics
  ctx.save(); trace(ctx, geom.outline); ctx.clip();
  const wallAO = ctx.createLinearGradient(0, 0, 200, 0);
  wallAO.addColorStop(0, "rgba(20,13,4,0.5)"); wallAO.addColorStop(0.13, "rgba(20,13,4,0)"); wallAO.addColorStop(0.87, "rgba(20,13,4,0)"); wallAO.addColorStop(1, "rgba(36,24,8,0.52)");
  ctx.fillStyle = wallAO; ctx.fillRect(0, geom.cup.top - 6, 200, cupH + 12);
  const scx = 100 - interiorHW * 0.34, scy = geom.cup.top + cupH * 0.3, srx = Math.max(12, interiorHW * 0.52), sry = cupH * 0.44;
  const sheen = ctx.createRadialGradient(scx, scy, 0, scx, scy, Math.max(srx, sry));
  sheen.addColorStop(0, "rgba(255,255,255,0.16)"); sheen.addColorStop(0.6, "rgba(255,255,255,0.05)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen; ellipse(ctx, scx, scy, srx, sry); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ellipse(ctx, 100 + interiorHW * 0.46, geom.cup.top + cupH * 0.16, Math.max(2.5, interiorHW * 0.12), cupH * 0.1); ctx.fill();
  const leftWide = `M${rim.cx - rim.rx * 0.72},${rim.cy + 6} C${rim.cx - rim.rx * 0.92},${(rim.cy + cb) / 2} ${rim.cx - rim.rx * 0.82},${cb - 18} ${rim.cx - rim.rx * 0.5},${cb - 9}`;
  const leftCore = `M${rim.cx - rim.rx * 0.68},${rim.cy + 9} C${rim.cx - rim.rx * 0.86},${(rim.cy + cb) / 2} ${rim.cx - rim.rx * 0.78},${cb - 20} ${rim.cx - rim.rx * 0.5},${cb - 12}`;
  const rightHi = `M${rim.cx + rim.rx * 0.84},${rim.cy + 10} C${rim.cx + rim.rx * 0.92},${(rim.cy + cb) / 2} ${rim.cx + rim.rx * 0.86},${cb - 24} ${rim.cx + rim.rx * 0.6},${cb - 12}`;
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 3.6; trace(ctx, leftWide); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.1; trace(ctx, leftCore); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1.3; trace(ctx, rightHi); ctx.stroke();
  ctx.restore();

  // front linework
  ctx.fillStyle = "rgba(255,242,214,0.14)"; ellipse(ctx, 100, cb - 2, Math.max(4, halfWidthAt(geom, cb) - 5), 4.5); ctx.fill();
  ctx.strokeStyle = "rgba(35,23,8,0.42)"; ctx.lineWidth = 1.5; ellipse(ctx, 100, cb - 0.5, Math.max(4, halfWidthAt(geom, cb) - 4), 3.4); ctx.stroke();
  ctx.fillStyle = "rgba(255,247,226,0.4)"; ellipse(ctx, 98, cb - 3, Math.max(2, halfWidthAt(geom, cb) * 0.3), 1.4); ctx.fill();
  ctx.strokeStyle = "rgba(110,90,56,0.35)"; ctx.lineWidth = 2.4; trace(ctx, geom.outline); ctx.stroke();
  ctx.strokeStyle = "rgba(239,226,190,0.55)"; ctx.lineWidth = 1.2; trace(ctx, geom.outline); ctx.stroke();
  ctx.strokeStyle = "rgba(251,239,201,0.7)"; ctx.lineWidth = 1.2; ellipse(ctx, rim.cx, rim.cy, rim.rx, rim.ry); ctx.stroke();
  const lip = `M${rim.cx - rim.rx * 0.82},${rim.cy + rim.ry * 0.42} A${rim.rx} ${rim.ry} 0 0 0 ${rim.cx + rim.rx * 0.82},${rim.cy + rim.ry * 0.42}`;
  ctx.strokeStyle = "rgba(255,247,224,0.5)"; ctx.lineWidth = 1.5; trace(ctx, lip); ctx.stroke();

  if (garnishes.length) drawGarnishLayer(ctx, garnishes, "front", rim, geom.cup.top, liquidTop, surfHW, body, shadow, dry);

  ctx.restore();
}

const SHARDS: [string, number][] = [
  ["M-30,12 L-12,-6 L0,6 L-16,24 Z", 0.5], ["M-6,-8 L12,-18 L26,-4 L8,8 Z", 0.62],
  ["M2,2 L20,-6 L30,10 L12,18 Z", 0.46], ["M-18,18 L0,10 L12,24 L-6,32 Z", 0.55],
  ["M-34,22 L-18,16 L-10,30 L-26,36 Z", 0.42], ["M14,12 L30,8 L34,24 L18,28 Z", 0.5],
  ["M-12,28 L6,22 L16,36 L-2,42 Z", 0.4], ["M-2,-16 L12,-24 L22,-12 L8,-4 Z", 0.7],
  ["M20,20 L34,18 L32,34 L18,34 Z", 0.36], ["M-26,4 L-14,-2 L-6,10 L-20,16 Z", 0.58],
];

function drawIce(ctx: any, type: string, cx: number, cy: number, r: number, waterY: number, liquidColor: string, fillTop?: number, fillBottom?: number, fillHW?: number): void {
  const tint = "#e3edf2";
  if (type === "cubes" || type === "bullets") {
    drawIceFill(ctx, type, cx, waterY, liquidColor, fillTop != null ? fillTop : cy - r, fillBottom != null ? fillBottom : cy + r, fillHW != null ? fillHW : r);
    return;
  }
  const wl = waterY - cy;
  ctx.save();
  ctx.translate(cx, cy);

  if (type === "sphere") {
    const chord = Math.sqrt(Math.max(0, r * r - wl * wl));

    const getSphereGrad = (sub: boolean) => {
      const gx = -0.28 * r;
      const gy = -0.44 * r;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1.56 * r);
      if (sub) {
        g.addColorStop(0, "rgba(255,255,255,0.48)");
        g.addColorStop(0.2, "rgba(246,251,255,0.32)");
        g.addColorStop(0.54, withAlpha(tint, 0.22));
        g.addColorStop(0.80, "rgba(184,209,220,0.16)");
        g.addColorStop(1, "rgba(255,255,255,0.38)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.82)");
        g.addColorStop(0.2, "rgba(246,251,255,0.48)");
        g.addColorStop(0.54, withAlpha(tint, 0.34));
        g.addColorStop(0.80, "rgba(184,209,220,0.22)");
        g.addColorStop(1, "rgba(255,255,255,0.52)");
      }
      return g;
    };

    const getSphHiGrad = (sub: boolean) => {
      const gx = -0.28 * r;
      const gy = -0.32 * r;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1.28 * r);
      if (sub) {
        g.addColorStop(0, "rgba(255,255,255,0.62)");
        g.addColorStop(0.45, "rgba(255,255,255,0.18)");
        g.addColorStop(1, "rgba(255,255,255,0)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.86)");
        g.addColorStop(0.45, "rgba(255,255,255,0.22)");
        g.addColorStop(1, "rgba(255,255,255,0)");
      }
      return g;
    };

    const renderSpherePiece = (sub: boolean) => {
      ctx.save();
      // Base sphere
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(0.8px)";
      ctx.fillStyle = getSphereGrad(sub);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Refractive Inner Highlights
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.clip();

      // Inner highlight 1 (super soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(2.8px)";
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.06" : "0.08") + ")";
      ctx.beginPath();
      ellipse(ctx, -r * 0.2, r * 0.36, r * 0.72, r * 0.52);
      ctx.fill();
      ctx.restore();

      // Inner highlight 2 (super soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(2.8px)";
      const px1 = r * 0.28, py1 = r * 0.28;
      ctx.translate(px1, py1);
      ctx.rotate((-24 * Math.PI) / 180);
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.16" : "0.22") + ")";
      ctx.beginPath();
      ellipse(ctx, 0, 0, r * 0.34, r * 0.16);
      ctx.fill();
      ctx.restore();

      // Inner highlight 3 (medium soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(1.2px)";
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.04" : "0.06") + ")";
      ctx.beginPath();
      ellipse(ctx, -r * 0.12, -r * 0.04, r * 0.36, r * 0.5);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // restores clip()

      // Main Specular Highlight (super soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(2.8px)";
      const px2 = -r * 0.32, py2 = -r * 0.4;
      ctx.translate(px2, py2);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.fillStyle = getSphHiGrad(sub);
      ctx.beginPath();
      ellipse(ctx, 0, 0, r * 0.34, r * 0.2);
      ctx.fill();
      ctx.restore();

      // Small details
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(1.2px)";
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.38" : "0.5") + ")";
      ctx.beginPath();
      ctx.arc(r * 0.3, -r * 0.12, Math.max(0.6, r * 0.034), 0, TAU);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.26" : "0.36") + ")";
      ctx.beginPath();
      ctx.arc(r * 0.44, r * 0.34, Math.max(0.5, r * 0.026), 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    if (waterY == null || wl == null) {
      renderSpherePiece(false);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-r - 5, -r - 5, r * 2 + 10, wl + r + 5);
      ctx.clip();
      renderSpherePiece(false);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(-r - 5, wl, r * 2 + 10, 500);
      ctx.clip();
      renderSpherePiece(true);
      ctx.restore();

      // Waterline caustics
      if (Math.abs(wl) < r * 0.98) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.clip();

        if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ellipse(ctx, 0, wl, chord, Math.max(1.2, r * 0.09));
        ctx.fill();

        if (ctx.filter !== undefined) ctx.filter = "none";
        ctx.fillStyle = "rgba(255,255,255,0.38)";
        ctx.beginPath();
        ellipse(ctx, -chord * 0.18, wl - r * 0.02, chord * 0.62, Math.max(0.8, r * 0.035));
        ctx.fill();

        ctx.restore();
      }
    }
  } else if (type === "cube") {
    const sH = r;
    const d = r * 0.36;
    const rad = r * 0.22;

    const getCubeFaceGrad = (face: "front" | "top" | "side", sub: boolean) => {
      if (face === "front") {
        const g = ctx.createLinearGradient(-0.7 * sH, -sH, 0, sH);
        if (sub) {
          g.addColorStop(0, "rgba(255,255,255,0.52)");
          g.addColorStop(0.35, "rgba(247,252,255,0.38)");
          g.addColorStop(0.72, withAlpha(tint, 0.26));
          g.addColorStop(1, "rgba(215,236,244,0.20)");
        } else {
          g.addColorStop(0, "rgba(255,255,255,0.9)");
          g.addColorStop(0.35, "rgba(247,252,255,0.72)");
          g.addColorStop(0.72, withAlpha(tint, 0.56));
          g.addColorStop(1, "rgba(215,236,244,0.48)");
        }
        return g;
      } else if (face === "top") {
        const g = ctx.createLinearGradient(0, 0, sH, sH);
        if (sub) {
          g.addColorStop(0, "rgba(255,255,255,0.52)");
          g.addColorStop(1, "rgba(232,247,252,0.28)");
        } else {
          g.addColorStop(0, "rgba(255,255,255,0.9)");
          g.addColorStop(1, "rgba(232,247,252,0.54)");
        }
        return g;
      } else {
        const g = ctx.createLinearGradient(0, 0, sH, sH);
        if (sub) {
          g.addColorStop(0, "rgba(245,251,255,0.38)");
          g.addColorStop(1, "rgba(205,228,238,0.20)");
        } else {
          g.addColorStop(0, "rgba(245,251,255,0.62)");
          g.addColorStop(1, "rgba(205,228,238,0.42)");
        }
        return g;
      }
    };

    const getCubeHiGrad = (sub: boolean) => {
      const gx = -0.28 * sH;
      const gy = -0.44 * sH;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1.28 * sH);
      if (sub) {
        g.addColorStop(0, "rgba(255,255,255,0.48)");
        g.addColorStop(0.6, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(255,255,255,0)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.78)");
        g.addColorStop(0.6, "rgba(255,255,255,0.18)");
        g.addColorStop(1, "rgba(255,255,255,0)");
      }
      return g;
    };

    const renderCubePiece = (sub: boolean) => {
      ctx.save();

      const pTop = `M${-sH + rad * 0.7},${-sH} L${-sH + d},${-sH - d} L${sH + d},${-sH - d} L${sH - rad * 0.45},${-sH} Z`;
      const pSide = `M${sH},${-sH + rad * 0.55} L${sH + d},${-sH - d} L${sH + d},${sH - d} L${sH},${sH - rad * 0.55} Z`;

      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(0.4px)";
      ctx.fillStyle = getCubeFaceGrad("top", sub);
      ctx.globalAlpha = sub ? 0.48 : 0.78;
      trace(ctx, pTop); ctx.fill();
      ctx.fillStyle = getCubeFaceGrad("side", sub);
      ctx.globalAlpha = sub ? 0.42 : 0.72;
      trace(ctx, pSide); ctx.fill();
      ctx.fillStyle = getCubeFaceGrad("front", sub);
      ctx.globalAlpha = sub ? 0.44 : 0.72;
      rr(ctx, -sH, -sH, 2 * sH, 2 * sH, rad); ctx.fill();
      ctx.restore();

      ctx.save();
      rr(ctx, -sH, -sH, 2 * sH, 2 * sH, rad); ctx.clip();

      // Main inner glow (super soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(2.8px)";
      ctx.fillStyle = getCubeHiGrad(sub);
      ctx.translate(-sH * 0.26, -sH * 0.15);
      ctx.rotate((-18 * Math.PI) / 180);
      ctx.beginPath();
      ellipse(ctx, 0, 0, sH * 0.52, sH * 0.7);
      ctx.fill();
      ctx.restore();

      // Second soft highlight
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(1.2px)";
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.09" : "0.14") + ")";
      ctx.translate(sH * 0.36, sH * 0.44);
      ctx.rotate((-12 * Math.PI) / 180);
      ctx.beginPath();
      ellipse(ctx, 0, 0, sH * 0.42, sH * 0.16);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // restores clip(pFront)

      // Prism edge reflections (medium soft)
      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(1.2px)";
      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.12" : "0.2") + ")";
      const pShine = `M${-sH + rad * 0.5},${-sH + 0.5} C${-sH * 0.5},${-sH * 0.95} ${sH * 0.45},${-sH * 0.82} ${sH - rad * 0.4},${-sH + 1.4} L${sH - rad * 0.4},${-sH + rad * 0.23} C${sH * 0.34},${-sH * 0.7} ${-sH * 0.4},${-sH * 0.78} ${-sH + rad * 0.72},${-sH + rad * 0.22} Z`;
      trace(ctx, pShine); ctx.fill();

      ctx.fillStyle = "rgba(255,255,255," + (sub ? "0.11" : "0.2") + ")";
      ctx.beginPath();
      ellipse(ctx, -sH * 0.6, sH * 0.84, sH * 0.14, sH * 0.06);
      ctx.fill();
      ctx.restore();
    };

    if (waterY == null || wl == null) {
      renderCubePiece(false);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-sH - 10, -sH - d - 10, sH * 2 + d + 20, wl + sH + d + 10);
      ctx.clip();
      renderCubePiece(false);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(-sH - 10, wl, sH * 2 + d + 20, 500);
      ctx.clip();
      renderCubePiece(true);
      ctx.restore();

      if (Math.abs(wl) < sH) {
        ctx.save();
        rr(ctx, -sH, -sH, 2 * sH, 2 * sH, rad); ctx.clip();

        if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ellipse(ctx, 0, wl, sH * 0.94, Math.max(1.2, r * 0.07));
        ctx.fill();

        if (ctx.filter !== undefined) ctx.filter = "none";
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(-sH, wl, sH * 2, Math.max(1.5, r * 0.1));

        ctx.restore();
      }
    }
  } else {
    const k = r / 34; ctx.scale(k, k);
    ctx.fillStyle = withAlpha(tint, 0.12); ellipse(ctx, 0, 14, 36, 26); ctx.fill();
    const grad = ctx.createLinearGradient(-20, -20, 20, 40);
    grad.addColorStop(0, "rgba(255,255,255,0.55)"); grad.addColorStop(1, withAlpha(tint, 0.22));
    for (const [d, op] of SHARDS) {
      trace(ctx, d); ctx.fillStyle = grad; ctx.fill();
      trace(ctx, d); ctx.strokeStyle = "rgba(255,255,255,0.32)"; ctx.lineWidth = 0.7; ctx.stroke();
      trace(ctx, d.split(" ").slice(0, 2).join(" ")); ctx.strokeStyle = `rgba(255,255,255,${op * 0.5})`; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  ctx.restore();
}

function drawIceFill(ctx: any, type: string, cx: number, waterY: number, liquidColor: string, top: number, bot: number, hw: number): void {
  const tint = "#e3edf2";
  const isBullet = type === "bullets";
  const piece = isBullet ? 26 : 42;
  const stepX = piece * (isBullet ? 0.84 : 0.72);
  const stepY = piece * (isBullet ? 0.65 : 0.58);
  const topInset = isBullet ? piece * 0.68 : piece * 0.88;
  ctx.save();
  let idx = 0;
  const getCubeTopGrad = (sub: boolean) => {
    const g = ctx.createLinearGradient(-12.5, -15.5, 12.5, 0);
    if (sub) {
      g.addColorStop(0, "rgba(255,255,255,0.28)");
      g.addColorStop(0.6, "rgba(224,242,254,0.12)");
      g.addColorStop(1, "rgba(186,230,253,0.08)");
    } else {
      g.addColorStop(0, "rgba(255,255,255,0.92)");
      g.addColorStop(0.6, "rgba(224,242,254,0.78)");
      g.addColorStop(1, "rgba(186,230,253,0.65)");
    }
    return g;
  };

  const getCubeLeftGrad = (sub: boolean) => {
    const g = ctx.createLinearGradient(-14.7, -7.2, 0, 15.5);
    if (sub) {
      g.addColorStop(0, "rgba(255,255,255,0.22)");
      g.addColorStop(0.5, "rgba(240,249,255,0.1)");
      g.addColorStop(1, "rgba(186,230,253,0.06)");
    } else {
      g.addColorStop(0, "rgba(255,255,255,0.86)");
      g.addColorStop(0.5, "rgba(240,249,255,0.68)");
      g.addColorStop(1, "rgba(186,230,253,0.52)");
    }
    return g;
  };

  const getCubeRightGrad = (sub: boolean) => {
    const g = ctx.createLinearGradient(0, -7.2, 14.7, 15.5);
    if (sub) {
      g.addColorStop(0, "rgba(240,249,255,0.18)");
      g.addColorStop(0.5, "rgba(186,230,253,0.08)");
      g.addColorStop(1, "rgba(125,211,252,0.05)");
    } else {
      g.addColorStop(0, "rgba(240,249,255,0.78)");
      g.addColorStop(0.5, "rgba(186,230,253,0.58)");
      g.addColorStop(1, "rgba(125,211,252,0.44)");
    }
    return g;
  };

  const getBulletOuterGrad = (sub: boolean) => {
    const g = ctx.createLinearGradient(-13, 0, 13, 0);
    if (sub) {
      g.addColorStop(0, "rgba(186,230,253,0.1)");
      g.addColorStop(0.25, "rgba(255,255,255,0.32)");
      g.addColorStop(0.55, "rgba(224,242,254,0.08)");
      g.addColorStop(0.85, "rgba(125,211,252,0.06)");
      g.addColorStop(1, "rgba(186,230,253,0.12)");
    } else {
      g.addColorStop(0, "rgba(186,230,253,0.78)");
      g.addColorStop(0.25, "rgba(255,255,255,0.96)");
      g.addColorStop(0.55, "rgba(224,242,254,0.65)");
      g.addColorStop(0.85, "rgba(125,211,252,0.58)");
      g.addColorStop(1, "rgba(186,230,253,0.76)");
    }
    return g;
  };

  const getBulletCavityGrad = (sub: boolean) => {
    const g = ctx.createLinearGradient(0, -3, 0, 11);
    if (sub) {
      g.addColorStop(0, "rgba(186,230,253,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0.05)");
    } else {
      g.addColorStop(0, "rgba(159,193,208,0.7)");
      g.addColorStop(1, "rgba(197,223,234,0.4)");
    }
    return g;
  };

  const pCubeRight = "M 0,0 L 12.5,-7.2 Q 14.7,-8.5 14.7,-5.5 L 14.7,5.5 Q 14.7,8.5 12.5,7.2 L 2.5,13.0 Q 0,14.5 0,12.0 Z";
  const pCubeLeft = "M 0,0 L -12.5,-7.2 Q -14.7,-8.5 -14.7,-5.5 L -14.7,5.5 Q -14.7,8.5 -12.5,7.2 L -2.5,13.0 Q 0,14.5 0,12.0 Z";
  const pCubeTop = "M -12.5,-9.8 L -2.5,-15.5 Q 0,-17 2.5,-15.5 L 12.5,-9.8 Q 14.7,-8.5 12.5,-7.2 L 0,0 L -12.5,-7.2 Q -14.7,-8.5 -12.5,-9.8 Z";
  const pCubeBottomCap = "M 0,12.0 L -2.5,13.0 Q 0,14.5 2.5,13.0 Z";
  const pCubeRightTopCap = "M 12.5,-9.8 L 14.7,-8.5 L 12.5,-7.2 Z";
  const pCubeLeftTopCap = "M -12.5,-9.8 L -14.7,-8.5 L -12.5,-7.2 Z";
  const pCubeCoreTop = "M -4.4,-3.4 L -0.9,-5.5 Q 0,-6.0 0.9,-5.5 L 4.4,-3.4 Q 5.2,-3.0 4.4,-2.5 L 0,0 L -4.4,-2.5 Q -5.2,-3.0 -4.4,-3.4 Z";
  const pCubeCoreLeft = "M 0,0 L -4.4,-2.5 Q -5.2,-3.0 -5.2,-2.0 L -5.2,2.0 Q -5.2,3.0 -4.4,2.5 L -0.9,5.5 Q 0,6.0 0,5.1 Z";
  const pCubeCoreRight = "M 0,0 L 4.4,-2.5 Q 5.2,-3.0 5.2,-2.0 L 5.2,2.0 Q 5.2,3.0 4.4,2.5 L 0.9,5.5 Q 0,6.0 0,5.1 Z";

  const pBulletOuter = "M -13,-4 A 13,11 0 0 1 13,-4 L 13,11 A 13,3.5 0 0 1 -13,11 Z";
  const pBulletCavity = "M -6,11 L -6,-3 A 6,6 0 0 1 6,-3 L 6,11 A 6,1.6 0 0 1 -6,11 Z";

  for (let y = bot - piece * 0.5; y >= top + topInset; y -= stepY) {
    const rowI = Math.round((bot - y) / stepY);
    const stagger = rowI % 2 ? stepX * 0.5 : 0;
    const startOffset = piece * (isBullet ? 0.55 : 0.44);
    const endOffset = piece * (isBullet ? 0.45 : 0.34);
    for (let x = cx - hw + startOffset + stagger; x <= cx + hw - endOffset; x += stepX) {
      const jx = (((idx * 13) % 7) - 3) * piece * 0.05;
      const jy = (((idx * 7) % 5) - 2) * piece * 0.05;
      const rot = (((idx * 11) % 9) - 4) * (isBullet ? 11 : 7);
      const px = x + jx;
      const py = y + jy;

      const localWaterY = waterY - py;
      const scale = isBullet ? piece / 26 : piece / 34;
      const pieceH = (isBullet ? 15 : 17) * scale;
      const isSubmerged = localWaterY < -pieceH;
      const isDry = localWaterY > pieceH;
      const isIntersecting = !isDry && !isSubmerged;

      const renderPiece = (sub: boolean) => {
        ctx.save();
        ctx.rotate((rot * Math.PI) / 180);
        ctx.scale(scale, scale);

        if (isBullet) {
          if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
          ctx.fillStyle = getBulletOuterGrad(sub);
          trace(ctx, pBulletOuter); ctx.fill();

          ctx.fillStyle = getBulletCavityGrad(sub);
          trace(ctx, pBulletCavity); ctx.fill();

          if (ctx.filter !== undefined) ctx.filter = "blur(0.8px)";
          ctx.lineCap = "round";

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.15 : 0.45})`;
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(-9, -2); ctx.lineTo(-9, 8); ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.55})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(-2, -6, 10, Math.PI, Math.PI * 1.5); ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.12 : 0.35})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(0, 11, 13, 3.5, 0, 0, Math.PI); ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.1 : 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.ellipse(0, 11, 6, 1.6, 0, 0, Math.PI); ctx.stroke();
        } else {
          if (ctx.filter !== undefined) ctx.filter = "blur(0.4px)";
          ctx.fillStyle = getCubeRightGrad(sub);
          trace(ctx, pCubeRight); ctx.fill();
          trace(ctx, pCubeBottomCap); ctx.fill();
          trace(ctx, pCubeRightTopCap); ctx.fill();
          ctx.fillStyle = getCubeLeftGrad(sub);
          trace(ctx, pCubeLeft); ctx.fill();
          trace(ctx, pCubeLeftTopCap); ctx.fill();
          ctx.fillStyle = getCubeTopGrad(sub);
          trace(ctx, pCubeTop); ctx.fill();

          if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
          ctx.lineCap = "round";

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.42})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12.0); ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.14 : 0.32})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12.5, -7.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12.5, -7.2); ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.48})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(-12.5, -9.8);
          ctx.lineTo(-2.5, -15.5);
          ctx.quadraticCurveTo(0, -17, 2.5, -15.5);
          ctx.lineTo(12.5, -9.8);
          ctx.stroke();

          if (ctx.filter !== undefined) ctx.filter = "blur(1.1px)";
          ctx.fillStyle = `rgba(255,255,255,${sub ? 0.08 : 0.16})`;
          trace(ctx, pCubeCoreTop); ctx.fill();
          trace(ctx, pCubeCoreLeft); ctx.fill();
          trace(ctx, pCubeCoreRight); ctx.fill();
        }

        ctx.restore();
      };

      ctx.save();
      ctx.translate(px, py);

      if (isDry) {
        renderPiece(false);
      } else if (isSubmerged) {
        renderPiece(true);
      } else if (isIntersecting) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-50, localWaterY, 100, 100 - localWaterY);
        ctx.clip();
        renderPiece(true);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(-50, -100, 100, 100 + localWaterY);
        ctx.clip();
        renderPiece(false);
        ctx.restore();

        ctx.save();
        if (ctx.filter !== undefined) ctx.filter = "blur(0.8px)";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.ellipse(0, localWaterY, (isBullet ? 12 : 16) * scale, (isBullet ? 1.5 : 2) * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        if (ctx.filter !== undefined) ctx.filter = "none";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.ellipse(0, localWaterY, (isBullet ? 8 : 10) * scale, (isBullet ? 0.6 : 0.8) * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      idx++;
    }
  }

  if (idx === 0) {
    const px = cx;
    const py = (top + bot) * 0.5;
    const localWaterY = waterY - py;
    const scale = isBullet ? piece / 26 : piece / 34;
    const pieceH = (isBullet ? 15 : 17) * scale;
    const isSubmerged = localWaterY < -pieceH;
    const isDry = localWaterY > pieceH;
    const isIntersecting = !isDry && !isSubmerged;

    const renderPiece = (sub: boolean) => {
      ctx.save();
      ctx.rotate((isBullet ? 0 : -5) * Math.PI / 180);
      ctx.scale(scale, scale);

      if (isBullet) {
        if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
        ctx.fillStyle = getBulletOuterGrad(sub); trace(ctx, pBulletOuter); ctx.fill();
        ctx.fillStyle = getBulletCavityGrad(sub); trace(ctx, pBulletCavity); ctx.fill();

        if (ctx.filter !== undefined) ctx.filter = "blur(0.8px)";
        ctx.lineCap = "round";

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.15 : 0.45})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(-9, -2); ctx.lineTo(-9, 8); ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.55})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(-2, -6, 10, Math.PI, Math.PI * 1.5); ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.12 : 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 11, 13, 3.5, 0, 0, Math.PI); ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.1 : 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(0, 11, 6, 1.6, 0, 0, Math.PI); ctx.stroke();
      } else {
        if (ctx.filter !== undefined) ctx.filter = "blur(0.4px)";
        ctx.fillStyle = getCubeRightGrad(sub);
        trace(ctx, pCubeRight); ctx.fill();
        trace(ctx, pCubeBottomCap); ctx.fill();
        trace(ctx, pCubeRightTopCap); ctx.fill();
        ctx.fillStyle = getCubeLeftGrad(sub);
        trace(ctx, pCubeLeft); ctx.fill();
        trace(ctx, pCubeLeftTopCap); ctx.fill();
        ctx.fillStyle = getCubeTopGrad(sub);
        trace(ctx, pCubeTop); ctx.fill();

        if (ctx.filter !== undefined) ctx.filter = "blur(0.5px)";
        ctx.lineCap = "round";

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.42})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12.0); ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.14 : 0.32})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12.5, -7.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12.5, -7.2); ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255,${sub ? 0.18 : 0.48})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-12.5, -9.8);
        ctx.lineTo(-2.5, -15.5);
        ctx.quadraticCurveTo(0, -17, 2.5, -15.5);
        ctx.lineTo(12.5, -9.8);
        ctx.stroke();

        if (ctx.filter !== undefined) ctx.filter = "blur(1.1px)";
        ctx.fillStyle = `rgba(255,255,255,${sub ? 0.08 : 0.16})`;
        trace(ctx, pCubeCoreTop); ctx.fill();
        trace(ctx, pCubeCoreLeft); ctx.fill();
        trace(ctx, pCubeCoreRight);
        ctx.fill();
      }

      ctx.restore();
    };

    ctx.save();
    ctx.translate(px, py);

    if (isDry) {
      renderPiece(false);
    } else if (isSubmerged) {
      renderPiece(true);
    } else if (isIntersecting) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-50, localWaterY, 100, 100 - localWaterY);
      ctx.clip();
      renderPiece(true);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(-50, -100, 100, 100 + localWaterY);
      ctx.clip();
      renderPiece(false);
      ctx.restore();

      ctx.save();
      if (ctx.filter !== undefined) ctx.filter = "blur(0.8px)";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.ellipse(0, localWaterY, (isBullet ? 12 : 16) * scale, (isBullet ? 1.5 : 2) * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      if (ctx.filter !== undefined) ctx.filter = "none";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.ellipse(0, localWaterY, (isBullet ? 8 : 10) * scale, (isBullet ? 0.6 : 0.8) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  ctx.restore();
}

/* ── garnish shapes (1:1 with web drawGarnishShape) ── */
function drawGarnishShape(ctx: any, kind: GarnishKind, color: string, s: number): void {
  const fillPath = (d: string, style: string) => { trace(ctx, d); ctx.fillStyle = style; ctx.fill(); };
  const strokePath = (d: string, style: string, w: number) => { trace(ctx, d); ctx.strokeStyle = style; ctx.lineWidth = w; ctx.stroke(); };
  const dot = (x: number, y: number, r: number, style: string) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = style; ctx.fill(); };
  const ell = (x: number, y: number, rx: number, ry: number, style: string) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = style; ctx.fill(); };

  switch (kind) {
    case "citrusWheel":
    case "cucumberSlice": {
      const cuke = kind === "cucumberSlice";
      dot(0, 0, s, cuke ? darken(color, 0.12) : color);
      dot(0, 0, s * (cuke ? 0.84 : 0.82), lighten(color, cuke ? 0.5 : 0.62));
      if (cuke) {
        for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ell(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32, s * 0.07, s * 0.1, withAlpha(darken(color, 0.2), 0.5)); }
      } else {
        ctx.strokeStyle = withAlpha(color, 0.5); ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.74, Math.sin(a) * s * 0.74); ctx.stroke(); }
        dot(0, 0, s * 0.12, lighten(color, 0.4));
      }
      ctx.save(); ctx.translate(-s * 0.35, -s * 0.4); ctx.rotate(deg(-30)); ell(0, 0, s * 0.22, s * 0.12, "rgba(255,255,255,0.4)"); ctx.restore();
      break;
    }
    case "citrusTwist":
      strokePath(`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s} C${-s * 0.9},${s * 1.2} ${-s},${s * 0.2} ${-s * 0.45},${0}`, color, s * 0.42);
      strokePath(`M${-s * 0.7},${-s} C${s * 0.7},${-s} ${s * 0.8},${s * 0.6} ${-s * 0.2},${s}`, lighten(color, 0.45), s * 0.16);
      break;
    case "berry":
      dot(0, 0, s * 0.78, color);
      for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; dot(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4, s * 0.18, withAlpha(darken(color, 0.12), 0.55)); }
      dot(-s * 0.24, -s * 0.28, s * 0.16, "rgba(255,255,255,0.5)");
      break;
    case "cherry":
      strokePath(`M${s * 0.2},${-s * 1.7} C${s * 0.1},${-s * 0.9} ${-s * 0.1},${-s * 0.6} 0,${-s * 0.55}`, "#6E5A2A", s * 0.12);
      dot(0, 0, s * 0.7, color);
      ctx.strokeStyle = withAlpha(darken(color, 0.3), 0.5); ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.arc(0, 0, s * 0.7, 0, TAU); ctx.stroke();
      dot(-s * 0.26, -s * 0.26, s * 0.16, "rgba(255,255,255,0.55)");
      break;
    case "fruitSlice": {
      const wedge = `M0,${s} A${s} ${s} 0 0 1 ${-s},0 L0,0 Z`;
      fillPath(wedge, lighten(color, 0.45)); strokePath(wedge, color, s * 0.12);
      strokePath(`M0,${s} A${s} ${s} 0 0 1 ${-s},0`, darken(color, 0.1), s * 0.22);
      ctx.save(); ctx.translate(-s * 0.45, s * 0.42); ctx.rotate(deg(40)); ell(0, 0, s * 0.12, s * 0.2, "rgba(255,255,255,0.3)"); ctx.restore();
      break;
    }
    case "mintSprig": {
      strokePath(`M0,0 C${s * 0.1},${-s} 0,${-s * 1.8} ${-s * 0.1},${-s * 2.4}`, darken(color, 0.2), s * 0.1);
      const leaf = (lx: number, ly: number, rot: number, sc: number) => {
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(deg(rot)); ctx.scale(sc, sc);
        fillPath(`M0,0 C${s * 0.55},${-s * 0.2} ${s * 0.55},${-s * 0.9} 0,${-s * 1.15} C${-s * 0.55},${-s * 0.9} ${-s * 0.55},${-s * 0.2} 0,0 Z`, color);
        ctx.strokeStyle = darken(color, 0.25); ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.05); ctx.stroke();
        ctx.restore();
      };
      leaf(0, -s * 2.2, 8, 1); leaf(-s * 0.3, -s * 1.5, -32, 0.85); leaf(s * 0.32, -s * 1.4, 34, 0.85); leaf(-s * 0.3, -s * 0.85, -50, 0.7); leaf(s * 0.3, -s * 0.8, 52, 0.7);
      break;
    }
    case "herbSprig":
      strokePath(`M0,0 L0,${-s * 2.8}`, darken(color, 0.2), s * 0.1);
      ctx.strokeStyle = color; ctx.lineWidth = s * 0.08;
      for (let i = 0; i < 12; i++) { const y = -i * s * 0.22 - s * 0.2; const side = i % 2 === 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(side * s * 0.5, y - s * 0.28); ctx.stroke(); }
      break;
    case "thymeSprig":
      strokePath(`M0,0 C${s * 0.06},${-s} ${-s * 0.06},${-s * 1.8} ${s * 0.04},${-s * 2.4}`, darken(color, 0.22), s * 0.08);
      for (let i = 0; i < 11; i++) {
        const y = -s * 0.3 - i * s * 0.2; const side = i % 2 === 0 ? 1 : -1;
        ctx.save(); ctx.translate(side * s * 0.14, y); ctx.rotate(deg(side * 34)); ell(0, 0, s * 0.17, s * 0.09, i % 3 === 0 ? lighten(color, 0.12) : color); ctx.restore();
      }
      break;
    case "dillSprig":
      strokePath(`M0,0 L0,${-s * 2.4}`, darken(color, 0.2), s * 0.07);
      ctx.strokeStyle = color; ctx.lineWidth = s * 0.045;
      for (let i = 0; i < 7; i++) {
        const y = -s * 0.45 - i * s * 0.28; const side = i % 2 === 0 ? 1 : -1;
        for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(side * (s * 0.18 + j * s * 0.12), y - s * 0.34 - j * s * 0.04); ctx.stroke(); }
      }
      break;
    case "bayLeaf": {
      const d = `M0,${-s * 1.5} C${s * 0.52},${-s * 0.9} ${s * 0.5},${s * 0.8} 0,${s * 1.5} C${-s * 0.5},${s * 0.8} ${-s * 0.52},${-s * 0.9} 0,${-s * 1.5} Z`;
      fillPath(d, color); strokePath(d, darken(color, 0.28), s * 0.05);
      strokePath(`M0,${-s * 1.4} L0,${s * 1.4}`, darken(color, 0.32), s * 0.05);
      ctx.strokeStyle = withAlpha(darken(color, 0.25), 0.5); ctx.lineWidth = s * 0.035;
      for (const t of [-0.7, -0.3, 0.1, 0.5]) {
        ctx.beginPath(); ctx.moveTo(0, t * s); ctx.lineTo(s * 0.34, t * s + s * 0.28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, t * s); ctx.lineTo(-s * 0.34, t * s + s * 0.28); ctx.stroke();
      }
      strokePath(`M${-s * 0.18},${-s * 1.1} C${-s * 0.3},${-s * 0.4} ${-s * 0.28},${s * 0.4} ${-s * 0.12},${s * 0.9}`, "rgba(255,255,255,0.2)", s * 0.08);
      break;
    }
    case "basilLeaf": {
      const d = `M0,${-s * 1.35} C${s * 1.02},${-s * 0.8} ${s * 0.92},${s * 0.7} 0,${s * 1.15} C${-s * 0.92},${s * 0.7} ${-s * 1.02},${-s * 0.8} 0,${-s * 1.35} Z`;
      fillPath(d, color); strokePath(d, darken(color, 0.24), s * 0.05);
      strokePath(`M0,${-s * 1.2} L0,${s * 1.05}`, darken(color, 0.3), s * 0.055);
      ctx.strokeStyle = withAlpha(darken(color, 0.22), 0.5); ctx.lineWidth = s * 0.04;
      for (const t of [-0.55, -0.15, 0.25]) {
        ctx.beginPath(); ctx.moveTo(0, t * s); ctx.quadraticCurveTo(s * 0.45, t * s + s * 0.1, s * 0.78, t * s + s * 0.45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, t * s); ctx.quadraticCurveTo(-s * 0.45, t * s + s * 0.1, -s * 0.78, t * s + s * 0.45); ctx.stroke();
      }
      ctx.save(); ctx.translate(-s * 0.34, -s * 0.34); ctx.rotate(deg(-24)); ell(0, 0, s * 0.3, s * 0.5, "rgba(255,255,255,0.16)"); ctx.restore();
      break;
    }
    case "sageLeaf": {
      const d = `M0,${-s * 1.45} C${s * 0.46},${-s * 0.9} ${s * 0.5},${s * 0.85} 0,${s * 1.3} C${-s * 0.5},${s * 0.85} ${-s * 0.46},${-s * 0.9} 0,${-s * 1.45} Z`;
      fillPath(d, lighten(color, 0.1)); strokePath(d, darken(color, 0.2), s * 0.05);
      strokePath(`M0,${-s * 1.35} L0,${s * 1.2}`, withAlpha(darken(color, 0.18), 0.6), s * 0.05);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; dot(Math.cos(a) * s * 0.26, Math.sin(a) * s * 0.7, s * 0.05, withAlpha(darken(color, 0.14), 0.4)); }
      break;
    }
    case "lavender":
      strokePath(`M0,0 L0,${-s * 2.2}`, "#6E7A4A", s * 0.1);
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < 6; i++) ell((i % 2 === 0 ? 1 : -1) * s * 0.16, -s * 2.1 + i * s * 0.22, s * 0.2, s * 0.16, color);
      ctx.globalAlpha = 1;
      break;
    case "leaf":
      fillPath(`M0,${s} C${s * 0.9},${s * 0.3} ${s * 0.9},${-s * 0.7} 0,${-s} C${-s * 0.9},${-s * 0.7} ${-s * 0.9},${s * 0.3} 0,${s} Z`, color);
      ctx.strokeStyle = darken(color, 0.28); ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, -s); ctx.stroke();
      break;
    case "flower":
      ctx.globalAlpha = 0.92;
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate((i / 6) * TAU); ell(0, -s * 0.55, s * 0.28, s * 0.55, color); ctx.restore(); }
      ctx.globalAlpha = 1;
      dot(0, 0, s * 0.26, lighten(color, 0.5));
      break;
    case "cinnamonStick":
      rr(ctx, -s * 0.32, -s * 2.6, s * 0.64, s * 2.6, s * 0.3); ctx.fillStyle = color; ctx.fill();
      rr(ctx, -s * 0.32, -s * 2.6, s * 0.26, s * 2.6, s * 0.13); ctx.fillStyle = darken(color, 0.25); ctx.fill();
      ctx.globalAlpha = 0.7; rr(ctx, s * 0.06, -s * 2.6, s * 0.16, s * 2.6, s * 0.08); ctx.fillStyle = lighten(color, 0.25); ctx.fill(); ctx.globalAlpha = 1;
      break;
    case "clove": {
      const one = (x: number, y: number, rot: number) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(deg(rot));
        ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, s * 0.9); ctx.stroke();
        dot(0, -s * 0.05, s * 0.28, lighten(color, 0.2));
        ctx.strokeStyle = darken(color, 0.2); ctx.lineWidth = s * 0.07;
        for (let i = 0; i < 4; i++) { const a = (i / 4) * 6.28; ctx.beginPath(); ctx.moveTo(0, -s * 0.05); ctx.lineTo(Math.cos(a) * s * 0.26, -s * 0.05 + Math.sin(a) * s * 0.26); ctx.stroke(); }
        ctx.restore();
      };
      one(-s * 0.5, -s * 0.4, -20); one(s * 0.5, -s * 0.3, 22);
      break;
    }
    case "starAnise": {
      let d = "";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU - Math.PI / 2; const a2 = ((i + 0.5) / 8) * TAU - Math.PI / 2;
        d += `${i === 0 ? "M" : "L"}${Math.cos(a) * s},${Math.sin(a) * s} L${Math.cos(a2) * s * 0.4},${Math.sin(a2) * s * 0.4} `;
      }
      d += "Z";
      fillPath(d, color); strokePath(d, darken(color, 0.3), s * 0.04);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU - Math.PI / 2; dot(Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62, s * 0.13, lighten(color, 0.4)); }
      break;
    }
    case "seeds": {
      const pos: [number, number][] = [[-s * 0.5, 0], [s * 0.2, -s * 0.4], [s * 0.5, s * 0.3], [-s * 0.2, s * 0.4], [0, -s * 0.05], [-s * 0.6, s * 0.5]];
      pos.forEach(([x, y], i) => dot(x, y, s * 0.22, i % 2 ? lighten(color, 0.15) : color));
      break;
    }
    case "gingerSlice": {
      const d = `M${-s * 0.9},${-s * 0.2} C${-s * 0.6},${-s} ${s * 0.8},${-s * 0.9} ${s},${-s * 0.1} C${s * 1.1},${s * 0.7} ${-s * 0.3},${s} ${-s * 0.9},${-s * 0.2} Z`;
      fillPath(d, lighten(color, 0.2)); strokePath(d, darken(color, 0.18), s * 0.07);
      ctx.strokeStyle = withAlpha(darken(color, 0.15), 0.4); ctx.lineWidth = s * 0.05;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.5 + i * s * 0.4, -s * 0.5); ctx.lineTo(-s * 0.4 + i * s * 0.4, s * 0.5); ctx.stroke(); }
      break;
    }
    case "chili":
      fillPath(`M0,${-s * 2.4} C${s * 0.1},${-s * 2.2} ${s * 0.55},${-s} ${s * 0.3},${-s * 0.2} C${s * 0.1},${s * 0.3} ${-s * 0.4},${s * 0.1} ${-s * 0.2},${-s * 0.8} C${-s * 0.05},${-s * 1.6} ${-s * 0.15},${-s * 2.2} 0,${-s * 2.4} Z`, color);
      strokePath(`M0,${-s * 2.4} C${s * 0.05},${-s * 1.6} ${s * 0.1},${-s} ${s * 0.15},${-s * 0.5}`, "rgba(255,255,255,0.4)", s * 0.1);
      strokePath(`M0,${-s * 2.4} C${-s * 0.2},${-s * 2.6} ${-s * 0.5},${-s * 2.5} ${-s * 0.6},${-s * 2.3}`, "#5A7A3A", s * 0.16);
      break;
    case "vanillaPod": {
      const d = `M0,0 C${s * 0.3},${-s} ${-s * 0.2},${-s * 1.9} ${s * 0.1},${-s * 2.8}`;
      strokePath(d, color, s * 0.34); strokePath(d, lighten(color, 0.25), s * 0.1);
      break;
    }
    case "coffeeBeans": {
      const bean = (x: number, y: number, rot: number) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(deg(rot));
        ell(0, 0, s * 0.42, s * 0.6, color);
        strokePath(`M0,${-s * 0.5} C${s * 0.12},${-s * 0.2} ${s * 0.12},${s * 0.2} 0,${s * 0.5}`, darken(color, 0.4), s * 0.09);
        ell(-s * 0.14, -s * 0.18, s * 0.1, s * 0.16, "rgba(255,255,255,0.25)");
        ctx.restore();
      };
      bean(-s * 0.55, s * 0.2, -18); bean(s * 0.5, -s * 0.1, 16); bean(0, s * 0.55, 4);
      break;
    }
    case "olive":
      ctx.strokeStyle = "#C9A45D"; ctx.lineWidth = s * 0.12; ctx.beginPath(); ctx.moveTo(s * 0.1, -s * 1.6); ctx.lineTo(-s * 0.1, s * 0.4); ctx.stroke();
      ell(0, 0, s * 0.6, s * 0.8, color);
      ctx.strokeStyle = withAlpha(darken(color, 0.25), 0.5); ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.6, s * 0.8, 0, 0, TAU); ctx.stroke();
      dot(0, s * 0.35, s * 0.2, "#C5402A");
      ell(-s * 0.2, -s * 0.3, s * 0.12, s * 0.2, "rgba(255,255,255,0.4)");
      break;
    case "onion":
      ctx.strokeStyle = "#C9A45D"; ctx.lineWidth = s * 0.12; ctx.beginPath(); ctx.moveTo(s * 0.1, -s * 1.6); ctx.lineTo(-s * 0.1, s * 0.3); ctx.stroke();
      dot(0, 0, s * 0.72, color);
      strokePath(`M${-s * 0.5},${-s * 0.3} A${s * 0.72} ${s * 0.72} 0 0 1 ${s * 0.4},${-s * 0.5}`, withAlpha(darken(color, 0.15), 0.5), s * 0.05);
      dot(-s * 0.24, -s * 0.26, s * 0.16, "rgba(255,255,255,0.5)");
      break;
    case "goldLeaf": {
      const flakes: [number, number, number][] = [[-s * 0.5, -s * 0.2, 20], [s * 0.3, s * 0.3, -15], [s * 0.1, -s * 0.5, 40], [-s * 0.2, s * 0.5, -30]];
      flakes.forEach(([x, y, r], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate(deg(r)); ctx.globalAlpha = 0.85 - i * 0.12; ctx.fillStyle = color; ctx.fillRect(0, 0, s * (0.3 + (i % 2) * 0.18), s * 0.26); ctx.restore(); });
      ctx.globalAlpha = 1;
      break;
    }
    case "drops": {
      const pos: [number, number][] = [[-s * 0.5, 0], [s * 0.08, -s * 0.32], [s * 0.46, s * 0.22], [-s * 0.1, s * 0.34]];
      ctx.globalAlpha = 0.65;
      pos.forEach(([x, y]) => ell(x, y, s * 0.2, s * 0.26, color));
      ctx.globalAlpha = 1;
      break;
    }
    default:
      break;
  }
}

function drawGarnishLayer(ctx: any, specs: GarnishSpec[], layer: string, rim: any, cupTop: number, liquidTop: number, surfHW: number, liquidColor: string, liquidShadow: string, dry = false): void {
  const surf = specs.filter((g) => g.placement === "surface");
  const tall = specs.filter((g) => g.placement === "tall");
  const rimG = specs.find((g) => g.placement === "rim");
  const foam = specs.find((g) => g.placement === "foam");
  const dust = specs.find((g) => g.placement === "dust");
  const sItem = Math.max(6, Math.min(16, surfHW * 0.38));
  const surfRy = surfHW * 0.14 + 1.5;
  const tallH = rim.cy - cupTop + 60;

  if (layer === "back") {
    if (foam) {
      ctx.globalAlpha = 0.92; ctx.fillStyle = foam.color;
      ctx.beginPath(); ctx.ellipse(100, liquidTop - surfRy * 0.4, surfHW, surfRy * 1.5, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      [-0.4, 0, 0.45].forEach((d) => { ctx.beginPath(); ctx.arc(100 + d * surfHW, liquidTop - surfRy * 0.7, surfHW * 0.1, 0, TAU); ctx.fill(); });
    }
    surf.forEach((g, i) => {
      const m = surf.length;
      // fan floaters across the surface, stagger depth (mirrors GarnishLayer)
      const gap = m > 1 ? Math.min(sItem * 1.7, (surfHW * 1.5) / (m - 1)) : 0;
      const x = 100 + (i - (m - 1) / 2) * gap;
      const y = liquidTop + sItem * 0.16 + (i % 2 ? sItem * 0.22 : 0);
      const wl = liquidTop - y;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = withAlpha(liquidShadow, 0.32);
      ctx.beginPath(); ctx.ellipse(sItem * 0.16, sItem * 0.62, sItem * 0.96, sItem * 0.34, 0, 0, TAU); ctx.fill();
      drawGarnishShape(ctx, g.kind, g.color, sItem);
      if (!dry) {
        const sub = ctx.createLinearGradient(0, -sItem, 0, sItem);
        sub.addColorStop(0, withAlpha(liquidColor, 0)); sub.addColorStop(0.42, withAlpha(liquidColor, 0)); sub.addColorStop(0.78, withAlpha(liquidColor, 0.42)); sub.addColorStop(1, withAlpha(liquidShadow, 0.55));
        ctx.fillStyle = sub; ctx.beginPath(); ctx.ellipse(0, 0, sItem * 1.05, sItem * 1.05, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(255,247,230,0.5)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(0, wl, sItem * 0.86, Math.max(1, sItem * 0.16), 0, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    });
    if (dust) {
      ctx.fillStyle = withAlpha(dust.color, 0.55);
      for (let i = 0; i < 14; i++) {
        const x = 100 + (((i * 37) % 100) / 100) * surfHW - surfHW * 0.5;
        const y = liquidTop - 1 + (((i * 53) % 30) / 30) * surfRy - surfRy * 0.4;
        ctx.beginPath(); ctx.arc(x, y, 0.6 + (i % 3) * 0.3, 0, TAU); ctx.fill();
      }
    }
    return;
  }

  if (rimG) {
    ctx.fillStyle = withAlpha(rimG.color, 0.9);
    for (let i = 0; i < 16; i++) {
      const t = i / 15; const ang = Math.PI * (0.15 + 0.7 * t);
      const x = rim.cx + Math.cos(ang) * rim.rx * (i % 2 ? 1 : 0.94);
      const y = rim.cy + Math.sin(ang) * rim.ry * 1.1;
      ctx.beginPath(); ctx.arc(x, y, 0.9 + (i % 3) * 0.4, 0, TAU); ctx.fill();
    }
  }
  tall.forEach((g, i) => {
    const m = tall.length;
    // fan the sprigs across the mouth and plant them into the drink (mirrors GarnishLayer)
    const off = m === 1 ? 0.16 : i / (m - 1) - 0.5;
    const ax = 100 + off * rim.rx * 1.2;
    const restOnRim = liquidTop <= rim.cy + 6;
    const baseY = restOnRim ? rim.cy + 1 : liquidTop - 2;
    const rot = off * 26;
    const sTall = Math.max(7, Math.min(14, surfHW * 0.34));
    const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
    ctx.fillStyle = withAlpha(liquidShadow, 0.28);
    ctx.beginPath(); ctx.ellipse(ax + 1.5, baseY + 2.5, sTall * 0.8, Math.max(1.4, sTall * 0.24), 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(ax, baseY); ctx.rotate(deg(rot)); ctx.scale(grow, grow); drawGarnishShape(ctx, g.kind, g.color, sTall); ctx.restore();
  });
}
