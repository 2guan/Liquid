/**
 * Parametric glassware. Each glass is described only by a vertical PROFILE —
 * a list of [y, halfWidth] samples from rim to base — plus an optional stem.
 * `buildGeom` turns that into the SVG geometry the <Glass> renderer consumes,
 * smoothing the silhouette with a Catmull-Rom spline. This lets the library
 * scale to dozens of glasses without hand-drawing each path.
 *
 * All glasses share a 200 × 280 viewBox, horizontal centre x = 100.
 */
import type { GlassType } from "@/types";

export type GlassCategory = "tumbler" | "stem" | "nosing" | "specialty";

export interface GlassCategoryMeta {
  id: GlassCategory;
  name: string;
  nameEn: string;
}

export const GLASS_CATEGORIES: GlassCategoryMeta[] = [
  { id: "tumbler", name: "平底杯", nameEn: "Tumblers" },
  { id: "stem", name: "高脚杯", nameEn: "Stemware" },
  { id: "nosing", name: "闻香杯", nameEn: "Nosing" },
  { id: "specialty", name: "特色杯", nameEn: "Specialty" },
];

export interface GlassGeom {
  outline: string;
  stem?: string;
  rim: { cx: number; cy: number; rx: number; ry: number };
  profile: [number, number][];
  cup: { top: number; bottom: number };
  shadow: { cx: number; cy: number; rx: number; ry: number };
  /** vertical bounds of the actual drawing — lets thumbnails frame to content */
  content: { top: number; bottom: number };
}

interface StemSpec {
  footY?: number;
  footHW?: number;
  stemHW?: number;
}

interface GlassSpec {
  id: string;
  name: string;
  nameEn: string;
  note: string;
  category: GlassCategory;
  profile: [number, number][]; // [y, halfWidth] rim → base
  stem?: StemSpec;
  rimRy?: number;
}

const CX = 100;

/** Catmull-Rom spline through points → smooth SVG cubic path. */
function catmull(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M${round(points[0][0])},${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(p2[0])},${round(p2[1])}`;
  }
  return d;
}

const round = (n: number) => Math.round(n * 10) / 10;

function buildStem(stem: StemSpec, topY: number): string {
  const footY = stem.footY ?? 256;
  const footHW = stem.footHW ?? 34;
  const s = stem.stemHW ?? 3.2;
  const column = `M${CX - s},${topY} L${CX - s},${footY - 5} C${CX - s},${footY - 1} ${CX - s + 1},${footY} ${CX},${footY} C${CX + s - 1},${footY} ${CX + s},${footY - 1} ${CX + s},${footY - 5} L${CX + s},${topY} Z`;
  const foot = `M${CX - footHW},${footY + 1} C${CX - footHW},${footY - 3} ${CX - footHW + 12},${footY - 4} ${CX},${footY - 4} C${CX + footHW - 12},${footY - 4} ${CX + footHW},${footY - 3} ${CX + footHW},${footY + 1} C${CX + footHW},${footY + 5} ${CX + footHW - 12},${footY + 6} ${CX},${footY + 6} C${CX - footHW + 12},${footY + 6} ${CX - footHW},${footY + 5} ${CX - footHW},${footY + 1} Z`;
  return `${column} ${foot}`;
}

function buildGeom(spec: GlassSpec): GlassGeom {
  const prof = spec.profile;
  const [rimY, rimHW] = prof[0];
  const [baseY, baseHW] = prof[prof.length - 1];

  // Every glass in the "stem" category is stemmed; "nosing"/"specialty" only
  // when an explicit stem is given. A missing stem here was the bug that left
  // wine/martini/coupe bowls floating with no foot.
  const stemmed = spec.category === "stem" || spec.stem !== undefined;
  const footY = spec.stem?.footY ?? 256;
  const footHW = spec.stem?.footHW ?? 34;
  const stemHW = spec.stem?.stemHW ?? 3.2;

  const left: [number, number][] = prof.map(([y, hw]) => [CX - hw, y]);
  const right: [number, number][] = [...prof].reverse().map(([y, hw]) => [CX + hw, y]);

  let boundary: [number, number][];
  let stem: string | undefined;
  let stemTopY = baseY;

  if (stemmed) {
    // Funnel the bowl bottom down to the stem width so the bowl flows into the
    // stem instead of ending in a wide flat disc on a thin stick.
    stemTopY = baseY + Math.min(16, Math.max(8, (footY - baseY) * 0.3));
    boundary = [
      ...left,
      [CX - stemHW, stemTopY],
      [CX, stemTopY],
      [CX + stemHW, stemTopY],
      ...right,
    ];
    stem = buildStem({ footY, footHW, stemHW }, stemTopY);
  } else {
    boundary = [...left, [CX, baseY], ...right];
  }

  const rimRy = spec.rimRy ?? Math.max(4, Math.min(11, rimHW * 0.16));
  // Close the silhouette over the top with the *back rim arc* (an elliptical
  // mouth) instead of a flat chord — a straight `Z` here drew a horizontal line
  // across the cup opening. The front lip is the rim ellipse drawn in <Glass>.
  const outline = `${catmull(boundary)} A${round(rimHW)},${round(rimRy)} 0 0 0 ${round(CX - rimHW)},${round(rimY)} Z`;
  const contentBottom = stemmed ? footY + 8 : baseY + Math.max(6, baseHW * 0.16) + 6;

  return {
    outline,
    stem,
    rim: { cx: CX, cy: rimY, rx: rimHW, ry: rimRy },
    profile: prof,
    cup: { top: rimY + 6, bottom: baseY - 2 },
    shadow: stemmed
      ? { cx: CX, cy: footY + 4, rx: footHW + 6, ry: Math.max(6, footHW * 0.2) }
      : { cx: CX, cy: baseY + 6, rx: baseHW + 6, ry: Math.max(6, baseHW * 0.16) },
    content: { top: rimY - rimRy - 3, bottom: contentBottom },
  };
}

/** Interpolate the bowl half-width at a given y (used to size the liquid surface). */
export function halfWidthAt(geom: GlassGeom, y: number): number {
  const p = geom.profile;
  if (y <= p[0][0]) return p[0][1];
  if (y >= p[p.length - 1][0]) return p[p.length - 1][1];
  for (let i = 0; i < p.length - 1; i++) {
    const [y0, w0] = p[i];
    const [y1, w1] = p[i + 1];
    if (y >= y0 && y <= y1) {
      const t = (y - y0) / (y1 - y0);
      return w0 + (w1 - w0) * t;
    }
  }
  return p[p.length - 1][1];
}

/* ── The glassware cabinet ── */
export const GLASS_SPECS: GlassSpec[] = [
  // ── Tumblers ──
  { id: "rocks", name: "古典杯", nameEn: "Rocks", note: "厚底沉稳，加冰与搅拌型酒款", category: "tumbler", profile: [[150, 58], [200, 55], [244, 52]] },
  { id: "double-rocks", name: "双份古典杯", nameEn: "Double Rocks", note: "更宽更深，盛放大冰球", category: "tumbler", profile: [[132, 62], [190, 58], [248, 54]] },
  { id: "highball", name: "高球杯", nameEn: "Highball", note: "高挑通透，气泡与长饮", category: "tumbler", profile: [[70, 40], [160, 39], [248, 38]] },
  { id: "collins", name: "柯林斯杯", nameEn: "Collins", note: "更细更高，长饮与气泡", category: "tumbler", profile: [[58, 34], [160, 33], [250, 32]] },
  { id: "shot", name: "子弹杯", nameEn: "Shot", note: "一口饮尽的烈酒小杯", category: "tumbler", profile: [[176, 32], [210, 29], [242, 26]] },
  { id: "julep", name: "茱莉普杯", nameEn: "Julep Cup", note: "金属感杯身，碎冰霜化", category: "tumbler", profile: [[120, 46], [185, 43], [246, 40]] },
  { id: "pilsner", name: "皮尔森杯", nameEn: "Pilsner", note: "锥形高杯，气泡升腾", category: "tumbler", profile: [[60, 44], [150, 34], [250, 22]] },
  { id: "bucket", name: "水桶杯", nameEn: "Bucket", note: "矮胖宽口，大量碎冰", category: "tumbler", profile: [[140, 64], [200, 60], [246, 56]] },
  { id: "zombie", name: "僵尸杯", nameEn: "Zombie", note: "极高窄身，提基长饮", category: "tumbler", profile: [[50, 36], [150, 35], [252, 33]] },
  { id: "pint", name: "品脱杯", nameEn: "Pint", note: "上宽下窄，啤酒与潘趣", category: "tumbler", profile: [[64, 46], [150, 42], [250, 34]] },

  // ── Stemware ──
  { id: "martini", name: "马天尼杯", nameEn: "Martini", note: "纤长杯脚，冰镇无冰烈酒", category: "stem", profile: [[122, 70], [160, 36], [198, 4]] },
  { id: "cocktail", name: "鸡尾酒杯", nameEn: "Cocktail", note: "略带弧度的经典锥杯", category: "stem", profile: [[124, 60], [160, 30], [196, 6]] },
  { id: "coupe", name: "碟形香槟杯", nameEn: "Coupe", note: "复古弧线，摇制后的霜雾", category: "stem", profile: [[130, 66], [150, 50], [178, 12]] },
  { id: "nick-nora", name: "尼克诺拉杯", nameEn: "Nick & Nora", note: "小巧郁金香，优雅复古", category: "stem", profile: [[134, 33], [150, 40], [182, 14]] },
  { id: "margarita", name: "玛格丽特杯", nameEn: "Margarita", note: "阶梯宽碗，咸边玛格丽特", category: "stem", profile: [[118, 68], [148, 30], [166, 36], [188, 12]] },
  { id: "wine-red", name: "红葡萄酒杯", nameEn: "Red Wine", note: "大肚收口，聚拢果香", category: "stem", profile: [[110, 40], [160, 52], [202, 18]] },
  { id: "wine-white", name: "白葡萄酒杯", nameEn: "White Wine", note: "较窄杯口，清爽冰镇", category: "stem", profile: [[110, 34], [160, 44], [202, 16]] },
  { id: "bordeaux", name: "波尔多杯", nameEn: "Bordeaux", note: "高大杯身，单宁充分舒展", category: "stem", profile: [[96, 42], [160, 56], [206, 18]] },
  { id: "burgundy", name: "勃艮第杯", nameEn: "Burgundy", note: "宽大气球，集中细腻香气", category: "stem", profile: [[110, 46], [156, 62], [202, 20]] },
  { id: "flute", name: "香槟笛杯", nameEn: "Champagne Flute", note: "细长杯身，保持气泡", category: "stem", profile: [[86, 22], [150, 20], [200, 14]] },
  { id: "sour", name: "酸酒杯", nameEn: "Sour", note: "小巧郁金香，酸酒泡沫", category: "stem", profile: [[128, 36], [160, 40], [196, 16]] },
  { id: "goblet", name: "高脚酒杯", nameEn: "Goblet", note: "圆润大肚，潘趣与桑格利亚", category: "stem", profile: [[120, 46], [166, 52], [204, 22]] },
  { id: "sherry", name: "雪莉杯", nameEn: "Sherry", note: "细窄小杯，加强酒纯饮", category: "stem", profile: [[130, 28], [165, 32], [196, 14]] },
  { id: "port", name: "波特杯", nameEn: "Port", note: "略大雪莉杯，甜型加强酒", category: "stem", profile: [[126, 30], [162, 36], [196, 15]] },
  { id: "cordial", name: "利口杯", nameEn: "Cordial", note: "迷你高脚，利口酒一口量", category: "stem", profile: [[150, 22], [190, 12]] },
  { id: "snifter", name: "白兰地杯", nameEn: "Snifter", note: "宽肚短脚，掌心温香", category: "stem", profile: [[140, 34], [172, 56], [202, 26]], stem: { footY: 244, footHW: 30, stemHW: 7 } },
  { id: "poco-grande", name: "波可格兰德杯", nameEn: "Poco Grande", note: "热带曲线，飘香长饮", category: "stem", profile: [[100, 44], [140, 30], [172, 46], [202, 20]] },
  { id: "hurricane", name: "飓风杯", nameEn: "Hurricane", note: "曲线大杯，提基潘趣", category: "stem", profile: [[72, 42], [120, 32], [178, 50], [210, 22]], stem: { footY: 252, footHW: 30 } },

  // ── Nosing ──
  { id: "glencairn", name: "格兰凯恩杯", nameEn: "Glencairn", note: "聚拢香气，纯饮威士忌标准", category: "nosing", profile: [[132, 27], [150, 33], [185, 47], [215, 42], [236, 22]], stem: { footY: 252, footHW: 30, stemHW: 9 } },
  { id: "copita", name: "雪莉闻香杯", nameEn: "Copita", note: "郁金香小杯，雪莉与威士忌闻香", category: "nosing", profile: [[128, 30], [165, 40], [200, 16]], stem: { footY: 250, footHW: 30 } },
  { id: "neat", name: "NEAT 杯", nameEn: "NEAT Glass", note: "外扩杯口，引导酒精挥发", category: "nosing", profile: [[134, 40], [160, 26], [184, 38], [226, 30]] },
  { id: "tulip", name: "郁金香闻香杯", nameEn: "Tulip", note: "收腰外翻，集中复杂香气", category: "nosing", profile: [[120, 30], [160, 44], [200, 16]], stem: { footY: 252, footHW: 30 } },

  // ── Specialty ──
  { id: "tiki-mug", name: "提基马克杯", nameEn: "Tiki Mug", note: "陶制图腾，热带朗姆", category: "specialty", profile: [[110, 50], [170, 52], [246, 46]] },
  { id: "copper-mug", name: "铜马克杯", nameEn: "Copper Mug", note: "莫斯科骡子的冰镇铜杯", category: "specialty", profile: [[120, 56], [185, 54], [246, 50]] },
  { id: "irish-coffee", name: "爱尔兰咖啡杯", nameEn: "Irish Coffee", note: "带柄高脚，热饮与奶盖", category: "specialty", profile: [[120, 40], [160, 44], [210, 30]], stem: { footY: 244, footHW: 34, stemHW: 6 } },
  { id: "absinthe", name: "苦艾酒杯", nameEn: "Absinthe", note: "储液球底，滴水仪式", category: "specialty", profile: [[130, 34], [172, 30], [200, 24], [228, 28]], stem: { footY: 256, footHW: 30 } },
];

/** Geometry registry keyed by glass id, generated from the specs. */
export const GLASS_GEOM: Record<string, GlassGeom> = Object.fromEntries(
  GLASS_SPECS.map((s) => [s.id, buildGeom(s)]),
);

/** Resolve geometry with a safe fallback so unknown ids never crash the render. */
export function geomFor(id: GlassType): GlassGeom {
  return GLASS_GEOM[id] ?? GLASS_GEOM.rocks;
}

export interface GlassMeta {
  id: GlassType;
  name: string;
  nameEn: string;
  note: string;
  category: GlassCategory;
}

export const GLASSES: GlassMeta[] = GLASS_SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  nameEn: s.nameEn,
  note: s.note,
  category: s.category,
}));

export const GLASS_COUNT = GLASSES.length;

export const glassById = (id: GlassType): GlassMeta =>
  GLASSES.find((g) => g.id === id) ?? GLASSES[0];

export const isGlassId = (id: string): boolean => id in GLASS_GEOM;

export const glassesByCategory = (cat: GlassCategory): GlassMeta[] =>
  GLASSES.filter((g) => g.category === cat);

export function searchGlasses(query: string): GlassMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return GLASSES.filter(
    (g) => g.name.includes(q) || g.nameEn.toLowerCase().includes(q) || g.note.includes(q),
  );
}
