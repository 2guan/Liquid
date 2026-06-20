import type { CocktailResult } from "@/types";
import { liquidRamp, isFizzy } from "@/lib/tokens";
import { glassById, iceById } from "@/lib/data/catalog";
import { geomFor, halfWidthAt } from "@/lib/data/glasses";

/**
 * Share card — rendered to a PNG on a <canvas> so it bakes in the *page's*
 * Chinese display face (猫啃网风雅宋 / Maoken Fengyasong). A standalone SVG would
 * fall back to the viewer's system font, and embedding the full 6.9MB webfont in
 * every download is wasteful — drawing on canvas with the already-loaded font
 * gives a portable, pixel-perfect, universally-shareable image instead.
 *
 * The layout flows: a single vertical cursor advances past each block and the
 * canvas height is computed from the final cursor, so any number of ingredients
 * or any story length lays out without overlapping.
 */
const W = 720;
const PAD = 72; // left/right content margin
const CX = W / 2;
const SCALE = 2; // render at 2× for crisp text

// mirrors tailwind `font-cn` so Chinese matches the page exactly
const CN = '"Maoken Fengyasong", "Songti SC", "STSong", "Noto Serif SC", serif';
const EN = 'Georgia, "Times New Roman", serif';

type Op =
  | { t: "text"; x: number; y: number; size: number; color: string; stack: string; align: CanvasTextAlign; italic?: boolean; spacing?: number; text: string }
  | { t: "line"; x1: number; x2: number; y: number; opacity: number };

interface Layout {
  H: number;
  ops: Op[];
  haloCy: number;
}

/** Walk the card top-to-bottom, emitting draw ops and measuring total height. */
function layout(result: CocktailResult): Layout {
  const ops: Op[] = [];
  let y = 0;

  // brand eyebrow
  y = 78;
  ops.push({ t: "text", x: CX, y, size: 13, color: "rgba(200,164,93,0.72)", stack: CN, align: "center", spacing: 4, text: "微醺时刻 · THE SIP & SIGH" });
  y += 16;
  ops.push({ t: "line", x1: CX - 34, x2: CX + 34, y, opacity: 0.45 });
  y += 30;

  // glass
  const glassH = 210;
  const haloCy = y + glassH * 0.44;
  y += glassH + 40; // glass drawn separately; reserve its band

  // name
  ops.push({ t: "text", x: CX, y, size: 46, color: "#EFE2BE", stack: CN, align: "center", text: result.name });
  y += 34;
  ops.push({ t: "text", x: CX, y, size: 23, color: "#C8A45D", stack: EN, align: "center", italic: true, text: result.nameEn });
  y += 46;

  // recipe
  divider(ops, y, "专属配方 · THE RECIPE");
  y += 40;
  for (const ing of result.ingredients) {
    ops.push({ t: "text", x: PAD, y, size: 21, color: "#E7D6B1", stack: CN, align: "left", text: ing.name });
    ops.push({ t: "text", x: W - PAD, y, size: 19, color: "#C8A45D", stack: EN, align: "right", text: ing.amount });
    y += 37;
  }
  y += 6;
  ops.push({ t: "text", x: CX, y, size: 17, color: "rgba(231,214,177,0.7)", stack: CN, align: "center", spacing: 1, text: `${glassById(result.glass).name}　·　${iceById(result.ice).name}` });
  y += 48;

  // story
  const storyBody = result.story.replace(/\n[\s\S]*$/, "").trim();
  const lines = wrapCJK(storyBody, 21).slice(0, 6);
  if (lines.length) {
    divider(ops, y, "微醺絮语 · THE STORY");
    y += 42;
    for (const line of lines) {
      ops.push({ t: "text", x: CX, y, size: 18, color: "rgba(231,214,177,0.82)", stack: CN, align: "center", text: line });
      y += 33;
    }
    y += 14;
  }

  // signature
  const signature = result.story.match(/——\s*([^\n]+)\s*$/)?.[1]?.trim() || "The Sip & Sigh";
  ops.push({ t: "text", x: CX, y, size: 18, color: "rgba(200,164,93,0.85)", stack: CN, align: "center", italic: true, text: `—— ${signature}` });
  y += 52;

  // footer
  ops.push({ t: "line", x1: CX - 26, x2: CX + 26, y: y - 16, opacity: 0.3 });
  ops.push({ t: "text", x: CX, y, size: 11, color: "rgba(200,164,93,0.5)", stack: CN, align: "center", spacing: 3, text: "SAVOUR THE MOMENT · 微醺时刻" });
  y += 40;

  return { H: Math.round(y), ops, haloCy };
}

/** A centred small-caps label flanked by short rules. */
function divider(ops: Op[], y: number, label: string): void {
  const gap = 96;
  ops.push({ t: "line", x1: PAD, x2: CX - gap, y: y - 5, opacity: 0.3 });
  ops.push({ t: "line", x1: CX + gap, x2: W - PAD, y: y - 5, opacity: 0.3 });
  ops.push({ t: "text", x: CX, y, size: 13, color: "#C8A45D", stack: CN, align: "center", spacing: 2, text: label });
}

/** Render the whole card onto a canvas, using the page's loaded fonts. */
export async function renderShareCard(result: CocktailResult): Promise<HTMLCanvasElement> {
  // make sure the Chinese face is ready before we paint with it
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('700 46px "Maoken Fengyasong"'),
        document.fonts.load('400 21px "Maoken Fengyasong"'),
      ]);
      await document.fonts.ready;
    } catch {
      /* fall back to Songti — still renders */
    }
  }

  const [hi, body, shadow] = liquidRamp[result.family] ?? liquidRamp.default;
  const { H, ops, haloCy } = layout(result);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  // ── background ──
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1B150F");
  bg.addColorStop(0.55, "#120E0A");
  bg.addColorStop(1, "#0C0907");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // halo behind the glass
  const halo = ctx.createRadialGradient(CX, haloCy, 0, CX, haloCy, 300);
  halo.addColorStop(0, withAlpha(hi, 0.32));
  halo.addColorStop(0.6, withAlpha(shadow, 0.07));
  halo.addColorStop(1, withAlpha(shadow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // gold frames
  strokeRoundRect(ctx, 22, 22, W - 44, H - 44, 22, "rgba(200,164,93,0.42)", 1);
  strokeRoundRect(ctx, 32, 32, W - 64, H - 64, 15, "rgba(200,164,93,0.16)", 1);

  // ── glass ──
  drawGlass(ctx, result, hi, body, shadow, 124, 210, isFizzy(result.ingredients));

  // ── text + rules ──
  for (const op of ops) {
    if (op.t === "line") {
      ctx.strokeStyle = withAlpha("#C8A45D", op.opacity);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(op.x1, op.y);
      ctx.lineTo(op.x2, op.y);
      ctx.stroke();
      continue;
    }
    ctx.font = `${op.italic ? "italic " : ""}${op.size}px ${op.stack}`;
    ctx.fillStyle = op.color;
    ctx.textAlign = op.align;
    setSpacing(ctx, op.spacing ?? 0);
    ctx.fillText(op.text, op.x, op.y);
  }
  setSpacing(ctx, 0);

  return canvas;
}

/** Draw the result's real glass shape, scaled to a target height & centred. */
function drawGlass(
  ctx: CanvasRenderingContext2D,
  result: CocktailResult,
  hi: string,
  body: string,
  shadow: string,
  topY: number,
  targetH: number,
  fizzy: boolean,
): void {
  const geom = geomFor(result.glass);
  const rim = geom.rim;
  const s = targetH / (geom.content.bottom - geom.content.top);
  const level = 0.6;
  const liquidTop = geom.cup.bottom - level * (geom.cup.bottom - geom.cup.top);
  const surfHW = Math.max(2, halfWidthAt(geom, liquidTop) - 2);
  const surfRy = surfHW * 0.14 + 1.5;
  const fillBottom = geom.cup.bottom + 30;
  const cupH = geom.cup.bottom - geom.cup.top;
  const cb = geom.cup.bottom;
  const interiorHW = Math.max(halfWidthAt(geom, cb - 5), halfWidthAt(geom, geom.cup.top + cupH * 0.62)) - 4;

  // ice sizing & buoyancy — mirrors <Glass>
  const ice = result.ice;
  let iceR = 0;
  let iceY = 0;
  if (ice === "sphere") {
    iceR = Math.max(10, Math.min(interiorHW * 0.9, cupH * 0.52));
    iceY = Math.min(liquidTop + iceR * 0.8, cb - iceR - 1);
  } else if (ice === "cube") {
    iceR = Math.max(9, Math.min(interiorHW * 0.74, cupH * 0.44));
    iceY = Math.min(liquidTop + iceR * 0.8, cb - iceR - 2);
  } else if (ice === "crushed") {
    iceR = Math.max(16, interiorHW * 0.96);
    iceY = cb - Math.min(iceR * 0.5, cupH * 0.42);
  }

  const outline = new Path2D(geom.outline);

  ctx.save();
  ctx.translate(CX - 100 * s, topY - geom.content.top * s);
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (geom.stem) {
    const stem = new Path2D(geom.stem);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill(stem);
    ctx.strokeStyle = "rgba(231,214,177,0.32)";
    ctx.lineWidth = 1;
    ctx.stroke(stem);
  }

  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fill(outline);

  // ── liquid, clipped to the bowl ──
  ctx.save();
  ctx.clip(outline);
  const liq = ctx.createLinearGradient(0, liquidTop, 0, fillBottom);
  liq.addColorStop(0, hi);
  liq.addColorStop(0.45, body);
  liq.addColorStop(1, shadow);
  ctx.fillStyle = liq;
  ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
  // warm caustic pool at the base
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = hi;
  ellipse(ctx, 100, cb - 5, surfHW * 0.74, 7);
  ctx.fill();
  ctx.globalAlpha = 1;
  // meniscus disc + bright skin line
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = hi;
  ellipse(ctx, 100, liquidTop, surfHW, surfRy);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,246,226,0.5)";
  ctx.lineWidth = 0.8;
  ellipse(ctx, 100, liquidTop, surfHW, surfRy);
  ctx.stroke();
  // carbonation — static bubbles suspended through the drink
  if (fizzy) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const col = cb - 3 - liquidTop;
    for (const [dx, f, r] of [
      [-0.42, 0.18, 1.7], [0.34, 0.42, 1.1], [-0.12, 0.6, 1.9], [0.46, 0.74, 1.0], [0.06, 0.3, 1.4],
      [-0.5, 0.66, 1.2], [0.22, 0.86, 0.9], [-0.3, 0.5, 1.5], [0.5, 0.24, 1.0], [-0.04, 0.78, 1.2],
    ] as const) {
      ctx.beginPath();
      ctx.ellipse(100 + dx * surfHW * 0.78, cb - 3 - f * col, r, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // ── ice, clipped to the bowl ──
  if (ice !== "none") {
    ctx.save();
    ctx.clip(outline);
    drawIce(ctx, ice, 100, iceY, iceR, liquidTop, body);
    ctx.restore();
  }

  // ── glass optics: window sheen + specular streaks (clipped) ──
  ctx.save();
  ctx.clip(outline);
  const scx = 100 - interiorHW * 0.34;
  const scy = geom.cup.top + cupH * 0.3;
  const srx = Math.max(12, interiorHW * 0.52);
  const sry = cupH * 0.44;
  const sheen = ctx.createRadialGradient(scx, scy, 0, scx, scy, Math.max(srx, sry));
  sheen.addColorStop(0, "rgba(255,255,255,0.16)");
  sheen.addColorStop(0.6, "rgba(255,255,255,0.05)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ellipse(ctx, scx, scy, srx, sry);
  ctx.fill();
  const leftWide = `M${rim.cx - rim.rx * 0.72},${rim.cy + 6} C${rim.cx - rim.rx * 0.92},${(rim.cy + cb) / 2} ${rim.cx - rim.rx * 0.82},${cb - 18} ${rim.cx - rim.rx * 0.5},${cb - 9}`;
  const leftCore = `M${rim.cx - rim.rx * 0.68},${rim.cy + 9} C${rim.cx - rim.rx * 0.86},${(rim.cy + cb) / 2} ${rim.cx - rim.rx * 0.78},${cb - 20} ${rim.cx - rim.rx * 0.5},${cb - 12}`;
  const rightHi = `M${rim.cx + rim.rx * 0.84},${rim.cy + 10} C${rim.cx + rim.rx * 0.92},${(rim.cy + cb) / 2} ${rim.cx + rim.rx * 0.86},${cb - 24} ${rim.cx + rim.rx * 0.6},${cb - 12}`;
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 3.6;
  ctx.stroke(new Path2D(leftWide));
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.1;
  ctx.stroke(new Path2D(leftCore));
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.3;
  ctx.stroke(new Path2D(rightHi));
  ctx.restore();

  // ── front linework ──
  ctx.fillStyle = "rgba(255,242,214,0.14)";
  ellipse(ctx, 100, cb - 2, Math.max(4, halfWidthAt(geom, cb) - 5), 4.5);
  ctx.fill();
  ctx.strokeStyle = "rgba(110,90,56,0.35)";
  ctx.lineWidth = 2.4;
  ctx.stroke(outline);
  ctx.strokeStyle = "rgba(239,226,190,0.55)";
  ctx.lineWidth = 1.2;
  ctx.stroke(outline);
  // mouth ellipse + lit front lip
  ctx.strokeStyle = "rgba(251,239,201,0.7)";
  ctx.lineWidth = 1.2;
  ellipse(ctx, rim.cx, rim.cy, rim.rx, rim.ry);
  ctx.stroke();
  const lip = `M${rim.cx - rim.rx * 0.82},${rim.cy + rim.ry * 0.42} A${rim.rx} ${rim.ry} 0 0 0 ${rim.cx + rim.rx * 0.82},${rim.cy + rim.ry * 0.42}`;
  ctx.strokeStyle = "rgba(255,247,224,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke(new Path2D(lip));

  ctx.restore();
}

/** Crushed-ice shards (same field as <IceGroup>), authored on a ±34 canvas. */
const SHARDS: [string, number][] = [
  ["M-30,12 L-12,-6 L0,6 L-16,24 Z", 0.5],
  ["M-6,-8 L12,-18 L26,-4 L8,8 Z", 0.62],
  ["M2,2 L20,-6 L30,10 L12,18 Z", 0.46],
  ["M-18,18 L0,10 L12,24 L-6,32 Z", 0.55],
  ["M-34,22 L-18,16 L-10,30 L-26,36 Z", 0.42],
  ["M14,12 L30,8 L34,24 L18,28 Z", 0.5],
  ["M-12,28 L6,22 L16,36 L-2,42 Z", 0.4],
  ["M-2,-16 L12,-24 L22,-12 L8,-4 Z", 0.7],
  ["M20,20 L34,18 L32,34 L18,34 Z", 0.36],
  ["M-26,4 L-14,-2 L-6,10 L-20,16 Z", 0.58],
];

/** Canvas port of <IceGroup> — clear refractive sphere / cube / crushed with a
 *  waterline, drawn in the glass's local coordinate space (already transformed). */
function drawIce(
  ctx: CanvasRenderingContext2D,
  type: "sphere" | "cube" | "crushed",
  cx: number,
  cy: number,
  r: number,
  waterY: number,
  liquidColor: string,
): void {
  const tint = "#e3edf2";
  const wl = waterY - cy;
  ctx.save();
  ctx.translate(cx, cy);

  if (type === "sphere") {
    const gx = -0.26 * r;
    const gy = -0.4 * r;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1.4 * r);
    g.addColorStop(0, "rgba(255,255,255,0.6)");
    g.addColorStop(0.2, withAlpha("#eef7fb", 0.26));
    g.addColorStop(0.58, withAlpha(tint, 0.1));
    g.addColorStop(0.86, withAlpha(tint, 0.16));
    g.addColorStop(1, withAlpha(tint, 0.36));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = withAlpha(liquidColor, 0.4);
    ctx.fillRect(-r, wl, 2 * r, 2 * r);
    ctx.fillStyle = withAlpha(tint, 0.14);
    ellipse(ctx, -0.22 * r, 0.4 * r, 0.78 * r, 0.58 * r);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.lineWidth = Math.max(0.8, r * 0.05);
    ctx.beginPath();
    ctx.moveTo(0.34 * r, 0.58 * r);
    ctx.quadraticCurveTo(0.72 * r, 0.48 * r, 0.66 * r, 0.12 * r);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ellipse(ctx, -0.18 * r, -0.04 * r, 0.4 * r, 0.5 * r);
    ctx.fill();
    ctx.restore();

    // primary specular hot-spot + echo
    ctx.save();
    ctx.translate(-0.34 * r, -0.4 * r);
    ctx.rotate((-30 * Math.PI) / 180);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ellipse(ctx, 0, 0, 0.3 * r, 0.18 * r);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(-0.1 * r, -0.18 * r, Math.max(0.8, r * 0.06), 0, Math.PI * 2);
    ctx.fill();

    // meniscus ring where the drink wraps the ice
    if (Math.abs(wl) < r * 0.98) {
      const chord = Math.sqrt(Math.max(0, r * r - wl * wl));
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ellipse(ctx, 0, wl, chord, Math.max(1, r * 0.08));
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.9;
      ellipse(ctx, 0, wl, chord, Math.max(1, r * 0.08));
      ctx.stroke();
      ctx.restore();
    }

    // tiny internal bubbles
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(0.3 * r, -0.12 * r, Math.max(0.6, r * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    ctx.arc(0.44 * r, 0.34 * r, Math.max(0.5, r * 0.026), 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "cube") {
    const sH = r;
    const d = r * 0.36;
    const rad = r * 0.16;
    // top face
    ctx.beginPath();
    ctx.moveTo(-sH + rad * 0.5, -sH);
    ctx.lineTo(-sH + d, -sH - d);
    ctx.lineTo(sH + d, -sH - d);
    ctx.lineTo(sH - rad * 0.5, -sH);
    ctx.closePath();
    ctx.fillStyle = withAlpha(tint, 0.4);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // right face
    ctx.beginPath();
    ctx.moveTo(sH, -sH + rad * 0.5);
    ctx.lineTo(sH + d, -sH - d);
    ctx.lineTo(sH + d, sH - d);
    ctx.lineTo(sH, sH - rad * 0.5);
    ctx.closePath();
    ctx.fillStyle = withAlpha(tint, 0.18);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.stroke();
    // front face
    const front = roundRectPath(-sH, -sH, 2 * sH, 2 * sH, rad);
    const fg = ctx.createLinearGradient(-0.7 * sH, -sH, 0, sH);
    fg.addColorStop(0, "rgba(255,255,255,0.42)");
    fg.addColorStop(0.46, withAlpha(tint, 0.16));
    fg.addColorStop(1, withAlpha(tint, 0.22));
    ctx.fillStyle = fg;
    ctx.fill(front);
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 0.8;
    ctx.stroke(front);
    // clipped interior
    ctx.save();
    ctx.clip(front);
    ctx.fillStyle = withAlpha(liquidColor, 0.38);
    ctx.fillRect(-sH, wl, 2 * sH, 2 * sH);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = Math.max(0.6, r * 0.04);
    ctx.beginPath();
    ctx.moveTo(-0.5 * sH, -sH);
    ctx.lineTo(0.1 * sH, sH);
    ctx.stroke();
    ctx.strokeStyle = withAlpha(tint, 0.3);
    ctx.lineWidth = Math.max(0.6, r * 0.05);
    ctx.beginPath();
    ctx.moveTo(0.55 * sH, -sH);
    ctx.lineTo(-0.15 * sH, sH);
    ctx.stroke();
    if (Math.abs(wl) < sH) {
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-sH, wl);
      ctx.lineTo(sH, wl);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(-sH, wl, 2 * sH, Math.max(1.2, r * 0.08));
    }
    ctx.restore();
    // lit melt-rounded edges
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-sH + rad, -sH);
    ctx.arcTo(-sH, -sH, -sH, -sH + rad, rad);
    ctx.lineTo(-sH, sH - rad);
    ctx.stroke();
  } else {
    // crushed
    const k = r / 34;
    ctx.scale(k, k);
    ctx.fillStyle = withAlpha(tint, 0.12);
    ellipse(ctx, 0, 14, 36, 26);
    ctx.fill();
    const grad = ctx.createLinearGradient(-20, -20, 20, 40);
    grad.addColorStop(0, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, withAlpha(tint, 0.22));
    for (const [d, op] of SHARDS) {
      const p = new Path2D(d);
      ctx.fillStyle = grad;
      ctx.fill(p);
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 0.7;
      ctx.stroke(p);
      const edge = new Path2D(d.split(" ").slice(0, 2).join(" "));
      ctx.strokeStyle = `rgba(255,255,255,${op * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke(edge);
    }
  }
  ctx.restore();
}

function roundRectPath(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  if (typeof (p as unknown as { roundRect?: unknown }).roundRect === "function") {
    p.roundRect(x, y, w, h, r);
  } else {
    p.rect(x, y, w, h);
  }
  return p;
}

export async function downloadShareCard(result: CocktailResult): Promise<void> {
  const canvas = await renderShareCard(result);
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.nameEn.replace(/\s+/g, "-").toLowerCase() || "cocktail"}-sip-and-sigh.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      resolve();
    }, "image/png");
  });
}

export function shareText(result: CocktailResult): string {
  const sig = result.story.match(/——\s*([^\n]+)\s*$/)?.[1]?.trim() || "微醺时刻";
  return `《${result.name} · ${result.nameEn}》\n${result.story.replace(/\n.*$/, "")}\n—— ${sig}（微醺时刻 The Sip & Sigh）`;
}

/* ── small canvas helpers ── */
function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function strokeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, lw: number): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number): void {
  // letterSpacing isn't in older TS lib DOM types; guarded set
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* unsupported — ignore */
  }
}

function withAlpha(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Wrap a (mostly CJK) string to `perLine` characters. */
function wrapCJK(text: string, perLine: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const out: string[] = [];
  let line = "";
  for (const ch of clean) {
    line += ch;
    if (line.length >= perLine) {
      out.push(line);
      line = "";
    }
  }
  if (line.trim()) out.push(line);
  return out;
}
