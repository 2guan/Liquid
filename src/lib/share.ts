import QRCode from "qrcode";
import type { CocktailResult } from "@/types";
import { liquidRamp, rampFromColor, isFizzy, layerBands, layerGradientStops } from "@/lib/tokens";
import { glassById, iceById } from "@/lib/data/catalog";
import { geomFor, halfWidthAt, servedFill } from "@/lib/data/glasses";
import { garnishesFor, type GarnishSpec, type GarnishKind } from "@/lib/data/garnish";
import { makePrepSteps } from "@/lib/prepSteps";

/** The site the card's QR links back to (env-overridable, else the live origin). */
function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://github.com/2guan/Liquid";
}

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
  | { t: "text"; x: number; y: number; size: number; color: string; stack: string; align: CanvasTextAlign; italic?: boolean; spacing?: number; text: string; tag?: "body" | "sig" }
  | { t: "line"; x1: number; x2: number; y: number; opacity: number }
  | { t: "qr"; x: number; y: number; area: number; size: number; data: ArrayLike<number>; color: string };

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
    ops.push({ t: "text", x: W - PAD, y, size: 19, color: "#C8A45D", stack: CN, align: "right", text: ing.amount });
    y += 37;
  }
  y += 6;
  ops.push({ t: "text", x: CX, y, size: 17, color: "rgba(231,214,177,0.7)", stack: CN, align: "center", spacing: 1, text: `${glassById(result.glass).name}　·　${iceById(result.ice).name}` });
  y += 48;

  const steps = result.steps?.length ? result.steps : makePrepSteps(result);
  if (steps.length) {
    divider(ops, y, "操作指导 · METHOD");
    y += 40;
    steps.slice(0, 5).forEach((step, i) => {
      const lines = wrapCJK(`${i + 1}. ${step}`, 28).slice(0, 2);
      for (const line of lines) {
        ops.push({ t: "text", x: PAD, y, size: 18, color: "rgba(231,214,177,0.82)", stack: CN, align: "left", text: line });
        y += 30;
      }
      y += 4;
    });
    y += 16;
  }

  // story
  const storyBody = result.story.replace(/\n[\s\S]*$/, "").trim();
  // story body is left-aligned across the left 3/4; the QR occupies the right
  // quarter, vertically centred against the text block.
  const matrix = QRCode.create(siteUrl(), { errorCorrectionLevel: "M" }).modules;
  const QR_GOLD = "rgba(200,164,93,0.5)";
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
    ops.push({ t: "qr", x: qrX, y: qrY, area: QSIZE, size: matrix.size, data: matrix.data, color: QR_GOLD });
    y = ty + 14;
  } else {
    ops.push({ t: "qr", x: qrX, y, area: QSIZE, size: matrix.size, data: matrix.data, color: QR_GOLD });
    y += QSIZE + 10;
  }

  // signature
  const signature = result.story.match(/——\s*([^\n]+)\s*$/)?.[1]?.trim() || "The Sip & Sigh";
  ops.push({ t: "text", x: textRight, y, size: 18, color: "rgba(200,164,93,0.85)", stack: CN, align: "right", italic: true, text: `—— ${signature}`, tag: "sig" });
  y += 44; // bottom margin

  return { H: Math.round(y), ops, haloCy };
}

/** A centred small-caps label flanked by short rules (right rule end overridable). */
function divider(ops: Op[], y: number, label: string, rightEnd: number = W - PAD): void {
  const gap = 96;
  ops.push({ t: "line", x1: PAD, x2: CX - gap, y: y - 5, opacity: 0.3 });
  ops.push({ t: "line", x1: CX + gap, x2: rightEnd, y: y - 5, opacity: 0.3 });
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

  const _clearFam = ["gin", "vodka", "sparkling", "rumWhite"].includes(result.family);
  const [hi, body, shadow] = result.liquidColor
    ? rampFromColor(result.liquidColor)
    : _clearFam
      ? (["#EEF6F8", "#D6E6EC", "#A2BAC4"] as [string, string, string])
      : liquidRamp[result.family] ?? liquidRamp.default;
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
  drawGlass(ctx, result, hi, body, shadow, 124, 210, isFizzy(result.ingredients), garnishesFor(result.ingredients));

  // ── text + rules ──
  let bodyRight = 0; // furthest right edge of the story body — signature aligns to it
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
    if (op.t === "qr") {
      // bare modules in semi-transparent gold — quiet, no chip behind it
      const n = op.size;
      const cell = op.area / n;
      ctx.fillStyle = op.color;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (op.data[r * n + c]) {
            // +0.5 overlap avoids hairline seams between modules
            ctx.fillRect(op.x + c * cell, op.y + r * cell, cell + 0.5, cell + 0.5);
          }
        }
      }
      continue;
    }
    ctx.font = `${op.italic ? "italic " : ""}${op.size}px ${op.stack}`;
    ctx.fillStyle = op.color;
    setSpacing(ctx, op.spacing ?? 0);
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
  garnishes: GarnishSpec[],
): void {
  const geom = geomFor(result.glass);
  const rim = geom.rim;
  const s = targetH / (geom.content.bottom - geom.content.top);
  const level = result.fillLevel ?? servedFill(result.glass);
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
  } else if (ice === "cubes" || ice === "bullets") {
    iceR = interiorHW;
    iceY = (liquidTop + cb) / 2;
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
  // liquid clarity — clear spirits/sodas see-through, creamy drinks opaque
  const fam = result.family;
  const clearFam = fam === "gin" || fam === "vodka" || fam === "sparkling" || fam === "rumWhite";
  const opaqueFam = fam === "cream" || fam === "coffeeMilk" || fam === "pinacolada" || fam === "tomato";
  let aT = 0.86, aM = 0.85, aB = 0.96;
  if (result.liquidColor) {
    const m = result.liquidColor.replace("#", "");
    const cr = parseInt(m.slice(0, 2), 16) || 0;
    const cg = parseInt(m.slice(2, 4), 16) || 0;
    const cbb = parseInt(m.slice(4, 6), 16) || 0;
    const sat = (Math.max(cr, cg, cbb) - Math.min(cr, cg, cbb)) / 255;
    const f = Math.max(0.34, Math.min(0.9, 0.36 + sat * 0.72));
    aT = f; aM = f; aB = Math.min(1, f + 0.16);
  } else if (clearFam) {
    aT = 0.56; aM = 0.5; aB = 0.8;
  } else if (opaqueFam) {
    aT = 0.97; aM = 0.97; aB = 1;
  }
  // colour-layered drinks (B-52…) fill as discrete bands; others as a gradient.
  // skip all liquid drawing when the glass is dry (garnish-only)
  if (!dry) {
  const bands = result.layers && result.layers.length > 1 ? layerBands(result.layers, liquidTop, fillBottom) : null;
  if (bands) {
    // one continuous gradient over the whole liquid (no abutting band rects → no
    // seam lines), translucent so it reads like real layered liquid
    const lg = ctx.createLinearGradient(0, liquidTop, 0, fillBottom);
    for (const s of layerGradientStops(bands, liquidTop, fillBottom)) lg.addColorStop(s.offset, withAlpha(s.color, 0.7));
    ctx.fillStyle = lg;
    ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
  } else {
    const liq = ctx.createLinearGradient(0, liquidTop, 0, fillBottom);
    liq.addColorStop(0, withAlpha(hi, aT));
    liq.addColorStop(0.45, withAlpha(body, aM));
    liq.addColorStop(1, withAlpha(shadow, aB));
    ctx.fillStyle = liq;
    ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
    // wall shading — the body darkens toward the glass walls (3D volume)
    const liqEdge = ctx.createLinearGradient(0, 0, 200, 0);
    liqEdge.addColorStop(0, withAlpha(shadow, 0.58));
    liqEdge.addColorStop(0.09, withAlpha(shadow, 0.22));
    liqEdge.addColorStop(0.24, withAlpha(shadow, 0));
    liqEdge.addColorStop(0.6, withAlpha(hi, 0.1));
    liqEdge.addColorStop(0.78, withAlpha(shadow, 0));
    liqEdge.addColorStop(0.92, withAlpha(shadow, 0.26));
    liqEdge.addColorStop(1, withAlpha(shadow, 0.5));
    ctx.fillStyle = liqEdge;
    ctx.fillRect(0, liquidTop, 200, fillBottom - liquidTop);
  }
  const surfHi = bands ? bands[bands.length - 1].hi : hi;
  const baseHi = bands ? bands[0].hi : hi;
  // warm caustic pool at the base
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = baseHi;
  ellipse(ctx, 100, cb - 5, surfHW * 0.74, 7);
  ctx.fill();
  ctx.globalAlpha = 1;
  // meniscus disc + bright skin line
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = surfHi;
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
  }
  ctx.restore();

  // ── ice, clipped to the bowl ──
  if (ice !== "none") {
    ctx.save();
    ctx.clip(outline);
    drawIce(ctx, ice, 100, iceY, iceR, liquidTop, body, liquidTop, geom.cup.bottom, interiorHW);
    ctx.restore();
  }

  // ── in-drink garnishes (clipped inside the glass, behind the front wall) ──
  if (garnishes.length) {
    ctx.save();
    ctx.clip(outline);
    drawGarnishLayer(ctx, garnishes, "back", rim, geom.cup.top, gTop, gHW, body, shadow, dry);
    ctx.restore();
  }

  // ── glass optics: window sheen + specular streaks (clipped) ──
  ctx.save();
  ctx.clip(outline);
  // inner-wall ambient occlusion (glass thickness) — sheen paints over it
  const wallAO = ctx.createLinearGradient(0, 0, 200, 0);
  wallAO.addColorStop(0, "rgba(20,13,4,0.5)");
  wallAO.addColorStop(0.13, "rgba(20,13,4,0)");
  wallAO.addColorStop(0.87, "rgba(20,13,4,0)");
  wallAO.addColorStop(1, "rgba(36,24,8,0.52)");
  ctx.fillStyle = wallAO;
  ctx.fillRect(0, geom.cup.top - 6, 200, cupH + 12);
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
  // tight secondary catch-light, upper-right
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ellipse(ctx, 100 + interiorHW * 0.46, geom.cup.top + cupH * 0.16, Math.max(2.5, interiorHW * 0.12), cupH * 0.1);
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
  // thick-glass base — dark refractive ring + a tight bright glint
  ctx.strokeStyle = "rgba(35,23,8,0.42)";
  ctx.lineWidth = 1.5;
  ellipse(ctx, 100, cb - 0.5, Math.max(4, halfWidthAt(geom, cb) - 4), 3.4);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,247,226,0.4)";
  ellipse(ctx, 98, cb - 3, Math.max(2, halfWidthAt(geom, cb) * 0.3), 1.4);
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

  // ── on-rim garnishes: salt/sugar crust + sprigs resting on the lip ──
  if (garnishes.length) {
    drawGarnishLayer(ctx, garnishes, "front", rim, geom.cup.top, liquidTop, surfHW, body, shadow, dry);
  }

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
  type: "sphere" | "cube" | "cubes" | "bullets" | "crushed",
  cx: number,
  cy: number,
  r: number,
  waterY: number,
  liquidColor: string,
  fillTop?: number,
  fillBottom?: number,
  fillHW?: number,
): void {
  const tint = "#e3edf2";
  if (type === "cubes" || type === "bullets") {
    drawIceFill(ctx, type, cx, waterY, liquidColor, fillTop ?? cy - r, fillBottom ?? cy + r, fillHW ?? r);
    return;
  }
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

/** Canvas port of the multi-piece "cubes" / "bullets" ice fill (mirrors <IceGroup>). */
function drawIceFill(
  ctx: CanvasRenderingContext2D,
  type: "cubes" | "bullets",
  cx: number,
  waterY: number,
  liquidColor: string,
  top: number,
  bot: number,
  hw: number,
): void {
  const tint = "#e3edf2";
  const isBullet = type === "bullets";
  // fixed piece size (svg units) — a wider/taller cup simply fits more pieces
  const piece = isBullet ? 26 : 34;
  const stepX = piece * 0.92;
  const stepY = piece * (isBullet ? 0.7 : 0.82);
  const half = piece * 0.5;
  ctx.save();
  ctx.fillStyle = withAlpha(tint, 0.06);
  ctx.fillRect(cx - hw, top - piece * 0.2, hw * 2, bot - top + piece * 0.4);
  let idx = 0;
  for (let y = bot - piece * 0.5; y > top - piece * 0.1; y -= stepY) {
    const rowI = Math.round((bot - y) / stepY);
    const stagger = rowI % 2 ? stepX * 0.5 : 0;
    for (let x = cx - hw + piece * 0.5 + stagger; x <= cx + hw - piece * 0.4; x += stepX) {
      const px = x + (((idx * 13) % 7) - 3) * piece * 0.05;
      const py = y + (((idx * 7) % 5) - 2) * piece * 0.05;
      const rot = (((idx * 11) % 9) - 4) * (isBullet ? 11 : 7);
      const sub = py > waterY + piece * 0.12;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((rot * Math.PI) / 180);
      const w = piece;
      const h = isBullet ? piece * 0.6 : piece;
      const ry = isBullet ? -h / 2 : -half;
      const rr = isBullet ? piece * 0.3 : piece * 0.22;
      const path = roundRectPath(-half, ry, w, h, rr);
      ctx.fillStyle = withAlpha(tint, isBullet ? 0.5 : 0.46);
      ctx.fill(path);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.6;
      ctx.stroke(path);
      if (sub) {
        ctx.fillStyle = withAlpha(liquidColor, 0.28);
        ctx.fill(path);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.42)";
      ctx.lineWidth = 0.7;
      ctx.lineCap = "round";
      const ey = -half * (isBullet ? 0.4 : 0.66);
      ctx.beginPath();
      ctx.moveTo(-half * 0.66, ey);
      ctx.lineTo(half * 0.5, ey);
      ctx.stroke();
      ctx.restore();
      idx++;
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

/* ── garnishes (canvas port of <GarnishLayer> / <Shape>) ── */
const TAU = Math.PI * 2;
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

/** Draw one garnish around the current origin (ctx already translated/rotated). */
function drawGarnishShape(ctx: CanvasRenderingContext2D, kind: GarnishKind, color: string, s: number): void {
  const fillPath = (d: string, style: string) => { ctx.fillStyle = style; ctx.fill(new Path2D(d)); };
  const strokePath = (d: string, style: string, w: number) => { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.stroke(new Path2D(d)); };
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
      fillPath(wedge, lighten(color, 0.45));
      strokePath(wedge, color, s * 0.12);
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
    case "thymeSprig": {
      strokePath(`M0,0 C${s * 0.06},${-s} ${-s * 0.06},${-s * 1.8} ${s * 0.04},${-s * 2.4}`, darken(color, 0.22), s * 0.08);
      for (let i = 0; i < 11; i++) {
        const y = -s * 0.3 - i * s * 0.2;
        const side = i % 2 === 0 ? 1 : -1;
        ctx.save(); ctx.translate(side * s * 0.14, y); ctx.rotate(deg(side * 34));
        ell(0, 0, s * 0.17, s * 0.09, i % 3 === 0 ? lighten(color, 0.12) : color);
        ctx.restore();
      }
      break;
    }
    case "dillSprig": {
      strokePath(`M0,0 L0,${-s * 2.4}`, darken(color, 0.2), s * 0.07);
      ctx.strokeStyle = color; ctx.lineWidth = s * 0.045;
      for (let i = 0; i < 7; i++) {
        const y = -s * 0.45 - i * s * 0.28;
        const side = i % 2 === 0 ? 1 : -1;
        for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(side * (s * 0.18 + j * s * 0.12), y - s * 0.34 - j * s * 0.04); ctx.stroke(); }
      }
      break;
    }
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
      ctx.fillStyle = color; ctx.fill(roundRectPath(-s * 0.32, -s * 2.6, s * 0.64, s * 2.6, s * 0.3));
      ctx.fillStyle = darken(color, 0.25); ctx.fill(roundRectPath(-s * 0.32, -s * 2.6, s * 0.26, s * 2.6, s * 0.13));
      ctx.globalAlpha = 0.7; ctx.fillStyle = lighten(color, 0.25); ctx.fill(roundRectPath(s * 0.06, -s * 2.6, s * 0.16, s * 2.6, s * 0.08)); ctx.globalAlpha = 1;
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
        const a = (i / 8) * TAU - Math.PI / 2;
        const a2 = ((i + 0.5) / 8) * TAU - Math.PI / 2;
        d += `${i === 0 ? "M" : "L"}${Math.cos(a) * s},${Math.sin(a) * s} L${Math.cos(a2) * s * 0.4},${Math.sin(a2) * s * 0.4} `;
      }
      d += "Z";
      fillPath(d, color);
      strokePath(d, darken(color, 0.3), s * 0.04);
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

/** Canvas port of <GarnishLayer> — two passes, mirroring the SVG layering. */
function drawGarnishLayer(
  ctx: CanvasRenderingContext2D,
  specs: GarnishSpec[],
  layer: "back" | "front",
  rim: { cx: number; cy: number; rx: number; ry: number },
  cupTop: number,
  liquidTop: number,
  surfHW: number,
  liquidColor: string,
  liquidShadow: string,
  dry = false,
): void {
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
      // fan floaters across the surface, stagger depth (mirrors <GarnishLayer>)
      const gap = m > 1 ? Math.min(sItem * 1.7, (surfHW * 1.5) / (m - 1)) : 0;
      const x = 100 + (i - (m - 1) / 2) * gap;
      const y = liquidTop + sItem * 0.16 + (i % 2 ? sItem * 0.22 : 0);
      const wl = liquidTop - y;
      ctx.save();
      ctx.translate(x, y);
      // soft contact shadow cast into the drink
      ctx.fillStyle = withAlpha(liquidShadow, 0.32);
      ctx.beginPath(); ctx.ellipse(sItem * 0.16, sItem * 0.62, sItem * 0.96, sItem * 0.34, 0, 0, TAU); ctx.fill();
      // the garnish
      drawGarnishShape(ctx, g.kind, g.color, sItem);
      // liquid-only finishing: submerge wash + waterline meniscus
      if (!dry) {
        const sub = ctx.createLinearGradient(0, -sItem, 0, sItem);
        sub.addColorStop(0, withAlpha(liquidColor, 0));
        sub.addColorStop(0.42, withAlpha(liquidColor, 0));
        sub.addColorStop(0.78, withAlpha(liquidColor, 0.42));
        sub.addColorStop(1, withAlpha(liquidShadow, 0.55));
        ctx.fillStyle = sub;
        ctx.beginPath(); ctx.ellipse(0, 0, sItem * 1.05, sItem * 1.05, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(255,247,230,0.5)"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(0, wl, sItem * 0.86, Math.max(1, sItem * 0.16), 0, 0, TAU); ctx.stroke();
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

  // front
  if (rimG) {
    ctx.fillStyle = withAlpha(rimG.color, 0.9);
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const ang = Math.PI * (0.15 + 0.7 * t);
      const x = rim.cx + Math.cos(ang) * rim.rx * (i % 2 ? 1 : 0.94);
      const y = rim.cy + Math.sin(ang) * rim.ry * 1.1;
      ctx.beginPath(); ctx.arc(x, y, 0.9 + (i % 3) * 0.4, 0, TAU); ctx.fill();
    }
  }
  tall.forEach((g, i) => {
    const m = tall.length;
    // fan the sprigs across the mouth and plant them into the drink (mirrors <GarnishLayer>)
    const off = m === 1 ? 0.16 : i / (m - 1) - 0.5;
    const ax = 100 + off * rim.rx * 1.2;
    const restOnRim = liquidTop <= rim.cy + 6;
    const baseY = restOnRim ? rim.cy + 1 : liquidTop - 2;
    const rot = off * 26;
    const sTall = Math.max(7, Math.min(14, surfHW * 0.34));
    const grow = (tallH / (sTall * 2.8) > 1.6 ? 1.35 : 1) * (1 - Math.abs(off) * 0.12);
    // shadow where the stalk meets the surface / lip
    ctx.fillStyle = withAlpha(liquidShadow, 0.28);
    ctx.beginPath(); ctx.ellipse(ax + 1.5, baseY + 2.5, sTall * 0.8, Math.max(1.4, sTall * 0.24), 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(ax, baseY); ctx.rotate(deg(rot)); ctx.scale(grow, grow); drawGarnishShape(ctx, g.kind, g.color, sTall); ctx.restore();
  });
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
