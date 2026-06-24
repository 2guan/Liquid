/**
 * Design tokens — the single source of truth shared between TS logic and SVG art.
 * Mirrors design_system §3. Tailwind reads its own copy in tailwind.config.ts;
 * this file is for code that needs the raw values (SVG fills, canvas, AI mappings).
 */

export const color = {
  bgPrimary: "#0E0B08",
  bgSecondary: "#15110D",
  bgTertiary: "#1B150F",
  wood: "#3B2A1F",
  woodLight: "#4E3826",
  woodDark: "#281C14",
  gold: "#C8A45D",
  goldSoft: "#A88945",
  goldBright: "#E3C684",
  amber: "#D89C3A",
  amberGlow: "#F0B14B",
  amberDeep: "#A9701F",
  paper: "#E7D6B1",
  paperAged: "#D8C399",
  paperShadow: "#B9A074",
  ink: "#1A1612",
  inkSoft: "#2A231B",
  copper: "#9C5A33",
  absinthe: "#7E8C4E",
  glass: "rgba(255,255,255,0.08)",
} as const;

/**
 * Liquid colour ramps keyed by spirit family. Each is [highlight, body, shadow]
 * so a glass can render a believable gradient with refraction.
 */
export const liquidRamp: Record<string, [string, string, string]> = {
  // ── spirit families (neat colour) ──
  whisky: ["#E8A94E", "#B9742A", "#6E3E12"],
  whiskyPeat: ["#C8923F", "#955B22", "#52300F"],
  gin: ["#EAF1E6", "#CBD9C4", "#8FA487"],
  rum: ["#D08A45", "#9A5826", "#5A2F12"],
  rumWhite: ["#EFE7D0", "#D2C39C", "#937E54"],
  tequila: ["#E9D89B", "#C9A85A", "#8A6E2E"],
  vodka: ["#F2F4F0", "#D9DEDA", "#A7AEA9"],
  brandy: ["#C56A2E", "#8A3F18", "#4E2210"],
  absinthe: ["#C7D183", "#8E9C4A", "#54602A"],
  vermouth: ["#B8484A", "#7E2E30", "#491B1C"],
  campari: ["#D24A38", "#A02414", "#5A1208"],
  wine: ["#7E2233", "#561622", "#2F0C14"],
  cream: ["#F0E4C8", "#D9C49A", "#A88F62"],
  // ── drink colours (a mixer / juice / liqueur dominates the glass) ──
  cola: ["#7E4A24", "#43240E", "#1E0E05"], // cola / iced-tea brown
  coffee: ["#6B4A2E", "#36210F", "#160C05"], // espresso, coffee liqueur
  coffeeMilk: ["#E6CEA2", "#C49A64", "#7E5A32"], // white russian / mudslide / alexander
  orange: ["#F7B24B", "#E07C1C", "#9A4A0E"], // orange juice
  sunrise: ["#F4A93E", "#DE5A22", "#8A1E12"], // tequila sunrise (orange→grenadine)
  pineapple: ["#F1DE6E", "#DBB42E", "#917214"], // pineapple juice
  pinacolada: ["#F3E8C6", "#DCC78A", "#9C7E4A"], // pineapple + coconut cream
  cranberry: ["#E06A86", "#B02F50", "#67152E"], // cosmopolitan / cranberry
  grenadine: ["#DE4763", "#A11E3C", "#5C1022"], // grenadine red-pink
  berry: ["#CB5A88", "#8E2E56", "#501630"], // raspberry / blackberry
  rose: ["#EDA7BC", "#CF7191", "#8E3F5C"], // pink lady / clover club
  blue: ["#5BC8EC", "#2A86CC", "#125A92"], // blue curaçao
  green: ["#A6DC55", "#5FA62E", "#356414"], // midori / green chartreuse
  tomato: ["#D24A2C", "#9A2C16", "#561409"], // bloody mary
  peach: ["#F6C98D", "#E69A54", "#A4662C"], // bellini / peach / grapefruit
  sparkling: ["#F3E4A6", "#E0C566", "#A6862E"], // champagne / prosecco — pale gold
  sherry: ["#D49A4E", "#A4662A", "#5A3614"], // sherry / tawny port
  chocolate: ["#7A4E30", "#492A18", "#23130A"], // crème de cacao / chocolate
  default: ["#D89C3A", "#A9701F", "#5A3A10"],
};

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

export const radius = { sm: 6, md: 12, lg: 20, xl: 28 } as const;

export const grid = {
  mobile: { columns: 4, margin: 16, gutter: 12 },
  tablet: { columns: 12, margin: 32, gutter: 16 },
} as const;

export type SpiritFamily = keyof typeof liquidRamp;

/** Mix a hex colour toward a target channel value (0=black, 255=white) by amt. */
function mixChannel(hex: string, target: number, amt: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (target - c) * amt))).toString(16).padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}

/** Build a [highlight, body, shadow] liquid ramp from ANY single base colour, so
 *  the drink's colour is no longer limited to the fixed family palette. */
export function rampFromColor(hex: string): [string, string, string] {
  return [mixChannel(hex, 255, 0.34), hex, mixChannel(hex, 0, 0.45)];
}

/** One colour band of a layered drink (B-52, Black Velvet…), bottom → top. */
export interface LiquidLayer {
  color: string; // hex
  ratio: number; // relative thickness
}

/** Average two hex colours (used to blend adjacent layers at their boundary). */
function avgHex(a: string, b: string): string {
  const pa = a.replace("#", ""), pb = b.replace("#", "");
  const ch = (i: number) => {
    const v = Math.round((parseInt(pa.slice(i, i + 2), 16) + parseInt(pb.slice(i, i + 2), 16)) / 2);
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

/** A computed band with absolute y-bounds, a shading ramp, and the blended edge
 *  colours that fade into the layer above (`blendUp`) and below (`blendDown`). */
export interface LayerBand {
  color: string;
  top: number;
  bottom: number;
  hi: string;
  body: string;
  shadow: string;
  blendUp: string;
  blendDown: string;
}

/**
 * Slice the liquid column [top..bottom] into bands by layer ratio. `layers[0]`
 * is the BOTTOM layer (densest, sinks); the last layer's band top == `top`.
 * Each band carries `blendUp`/`blendDown` = the half-way colour into its
 * neighbours, so renderers fade between layers instead of drawing a hard line.
 * Shared by every glass renderer so on-screen and exported cards layer identically.
 */
export function layerBands(layers: LiquidLayer[], top: number, bottom: number): LayerBand[] {
  const total = layers.reduce((s, l) => s + Math.max(0.0001, l.ratio), 0);
  const h = bottom - top;
  let acc = 0;
  const n = layers.length;
  return layers.map((l, i) => {
    const bandTop = bottom - ((acc + l.ratio) / total) * h;
    const bandBottom = bottom - (acc / total) * h;
    acc += l.ratio;
    const [hi, body, shadow] = rampFromColor(l.color);
    const blendUp = i < n - 1 ? avgHex(l.color, layers[i + 1].color) : l.color;
    const blendDown = i > 0 ? avgHex(l.color, layers[i - 1].color) : l.color;
    return { color: l.color, top: bandTop, bottom: bandBottom, hi, body, shadow, blendUp, blendDown };
  });
}

/**
 * Flatten layer bands into a single continuous gradient (offset 0 = column top,
 * 1 = bottom) so the whole liquid can be ONE rect/fill — no abutting band rects,
 * hence no antialiased seam lines (the Android "two lines" bug).
 */
export function layerGradientStops(bands: LayerBand[], top: number, bottom: number): { offset: number; color: string }[] {
  const H = Math.max(1e-6, bottom - top);
  const off = (y: number) => Math.max(0, Math.min(1, (y - top) / H));
  const stops: { offset: number; color: string }[] = [];
  for (let i = bands.length - 1; i >= 0; i--) {
    const b = bands[i];
    stops.push({ offset: off(b.top), color: b.blendUp });
    stops.push({ offset: off((b.top + b.bottom) / 2), color: b.body });
    stops.push({ offset: off(b.bottom), color: b.blendDown });
  }
  return stops;
}

/** Accents used to build a two-tone gradient pour for Mood / Zen drinks. */
/**
 * Build the pour's gradient body from the drink's OWN ingredient colours, bottom
 * → top. A drink mixed from several differently-coloured spirits / liqueurs /
 * syrups becomes genuinely multi-colour (like the home card); one whose parts
 * share a colour stays near-uniform (barely a gradient). No-op if already layered
 * (an explicitly-layered recipe) or single-colour. Mutates the result in place.
 */
export function maybeGradientPour(result: {
  ingredients?: { name?: string; nameEn?: string; family?: string }[];
  family: string;
  layers?: LiquidLayer[];
}): void {
  if (result.layers && result.layers.length > 1) return;
  const cols: string[] = [];
  for (const ing of result.ingredients ?? []) {
    // use the tagged family, else read the colour from the ingredient's name
    // (remote LLM results carry names but no family field)
    const fam = (ing.family as SpiritFamily | undefined) || familyFromName(ing.name, ing.nameEn);
    // skip colourless parts so a clear base doesn't add a pale/transparent band
    if (!fam || fam === "gin" || fam === "vodka" || fam === "rumWhite" || fam === "sparkling") continue;
    const c = (liquidRamp[fam] ?? [])[1];
    if (c && cols.indexOf(c) === -1) cols.push(c);
  }
  if (cols.length < 2) return; // uniform colour → keep the normal single-tone fill
  // bottom (base spirit) → top (lighter mixers); cap at 4 bands for a rich blend
  result.layers = cols.slice(0, 4).map((color) => ({ color, ratio: 1 }));
}

/** Blend a set of hex colours into one (used to colour a free mix by its
 *  ingredients). Weighted toward saturation so a pile of bright picks doesn't
 *  average into grey mud. Returns null if nothing usable. */
export function blendColors(colors: (string | undefined)[]): string | null {
  const valid = colors.filter((c): c is string => !!c && /^#?[0-9a-fA-F]{6}$/.test(c));
  if (!valid.length) return null;
  let r = 0, g = 0, b = 0, wsum = 0;
  for (const c of valid) {
    const m = c.replace("#", "");
    const cr = parseInt(m.slice(0, 2), 16);
    const cg = parseInt(m.slice(2, 4), 16);
    const cb = parseInt(m.slice(4, 6), 16);
    const max = Math.max(cr, cg, cb);
    const min = Math.min(cr, cg, cb);
    const w = 0.5 + (max - min) / 255; // more saturated ingredients pull harder
    r += cr * w;
    g += cg * w;
    b += cb * w;
    wsum += w;
  }
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v / wsum))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * Infer the colour a finished drink actually takes from its ingredients.
 *
 * The base-spirit family alone is misleading — a Long Island Iced Tea is built
 * on clear spirits yet looks like iced tea because of the cola, and a Champagne
 * Cocktail is pale gold, not wine-red. So we scan the ingredient names for the
 * component that visually dominates the glass (cola, coffee, juices, curaçao,
 * grenadine, dairy, sparkling wine…) and fall back to the base spirit only when
 * nothing colour-defining is present. Used wherever a result is finalised, so
 * recipes, the LLM and the offline poet all colour their glassware correctly.
 */
export function inferLiquidFamily(
  ingredients: { name?: string; nameEn?: string }[] | undefined | null,
  fallback: SpiritFamily = "default",
): SpiritFamily {
  if (!ingredients || ingredients.length === 0) return fallback;
  const text = ingredients
    .map((i) => `${i.name ?? ""} ${i.nameEn ?? ""}`)
    .join(" ")
    .toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => text.includes(k.toLowerCase()));

  // dairy / coconut cream (whitens & lightens)
  const cream = has("奶油", "鲜奶", "牛奶", "炼乳", "椰浆", "椰奶", "cream", "milk", "coconut");
  // ambiguous tokens are matched narrowly to avoid false hits:
  //   橙汁 (juice) ≠ 君度/橙皮/橙味苦精/橙酒 ;  薄荷叶 (garnish) ≠ 绿薄荷利口酒
  const coffee = has("咖啡", "浓缩咖啡", "espresso", "coffee", "卡鲁瓦", "甘露", "kahlua", "tia maria");
  const chocolate = has("可可", "巧克力", "cacao", "chocolate", "摩卡", "mocha");
  // green liqueurs only — white crème de menthe stays clear, so don't match bare 薄荷利口酒
  const greenLiq = has("蜜瓜利口", "蜜多丽", "密多丽", "midori", "绿查特", "green chartreuse", "绿薄荷");
  const blue = has("蓝橙", "蓝柑", "蓝库拉索", "blue cura", "blue curacao");
  const oj = has("橙汁", "柳橙汁", "鲜橙汁", "血橙汁", "orange juice");
  const pineapple = has("菠萝", "凤梨", "鳳梨", "pineapple");
  const grenadine = has("红石榴", "石榴糖浆", "grenadine");
  const cranberry = has("蔓越莓", "蔓越橘", "cranberry");
  const berry = has("覆盆子", "树莓", "黑莓", "草莓", "蓝莓", "黑刺李", "黑加仑", "黑醋栗", "raspberry", "blackberry", "strawberry", "blueberry", "sloe", "cassis", "crème de cassis");
  // peach/grapefruit — strip 樱桃/核桃/猕猴桃 first so maraschino & kiwi don't read as peach
  const peach = text.replace(/樱桃|核桃|胡桃|猕猴桃/g, "").includes("桃") ||
    has("peach", "bellini", "西柚", "葡萄柚", "grapefruit");
  const sparkling = has("香槟", "普罗塞克", "普罗赛克", "起泡", "气泡酒", "卡瓦", "未熟葡萄", "青葡萄", "verjus", "champagne", "prosecco", "cava", "sparkling");
  const redWine = has("红葡萄酒", "红酒", "基安蒂", "chianti", "red wine");
  const sherry = has("雪莉", "sherry", "波特", "port", "tawny", "马德拉", "madeira");
  const campari = has("金巴利", "campari", "阿佩罗", "aperol");

  if (has("番茄", "西红柿", "tomato")) return "tomato";
  if (has("可乐", "cola", "coke", "百事", "pepsi")) return "cola";
  if (has("抹茶", "matcha")) return "green";
  if (has("青苹果", "sour apple", "green apple")) return "green";
  if (has("西瓜", "watermelon")) return "grenadine"; // pink-red
  if (has("玫瑰", "rose water", "玫瑰露", "玫瑰糖浆")) return "rose";
  if (has("百香果", "passion fruit", "passionfruit")) return "orange";
  if (coffee && cream) return "coffeeMilk";
  if (coffee) return "coffee";
  if (blue) return "blue";
  if (greenLiq) return "green";
  if (cranberry) return "cranberry";
  if (berry) return "berry";
  if (oj && grenadine) return "sunrise";
  if (grenadine) return "grenadine";
  if (oj) return "orange";
  if (pineapple && cream) return "pinacolada";
  if (pineapple) return "pineapple";
  if (peach) return "peach";
  if (chocolate && cream) return "coffeeMilk";
  if (chocolate) return "chocolate";
  // a bitter aperitivo tints the glass even when topped with sparkling wine
  if (campari) return "campari";
  if (sparkling) return "sparkling";
  if (sherry) return "sherry";
  if (redWine) return "wine";
  if (cream) return "cream";
  // clear/white base spirits shouldn't render as aged amber
  if (fallback === "rum" && has("白朗姆", "银朗姆", "白色朗姆", "white rum", "silver rum", "light rum")) return "rumWhite";
  return fallback;
}

/**
 * Best-effort colour family for a SINGLE ingredient — from its `family` tag if
 * present, else read from its name (coloured liqueurs/syrups AND base spirits).
 * Lets the pour gradient be built from a recipe whose parts carry only names
 * (e.g. a remote LLM result). Returns undefined for colourless parts (soda,
 * citrus, bitters, herbs) so they don't tint the blend.
 */
export function familyFromName(name?: string, nameEn?: string): SpiritFamily | undefined {
  const text = `${name ?? ""} ${nameEn ?? ""}`.trim();
  if (!text) return undefined;
  const colorant = inferLiquidFamily([{ name, nameEn }], "default");
  if (colorant !== "default") return colorant;
  const t = text.toLowerCase();
  if (/泥煤|艾雷|peat|islay/.test(t)) return "whiskyPeat";
  if (/威士忌|波本|苏格兰|黑麦|whisky|whiskey|bourbon|scotch|rye/.test(t)) return "whisky";
  if (/金酒|琴酒|gin/.test(t)) return "gin";
  if (/伏特加|vodka/.test(t)) return "vodka";
  if (/白朗姆|银朗姆|white rum|light rum|silver rum/.test(t)) return "rumWhite";
  if (/朗姆|rum/.test(t)) return "rum";
  if (/龙舌兰|特其拉|梅斯卡尔|tequila|mezcal/.test(t)) return "tequila";
  if (/白兰地|干邑|雅文邑|brandy|cognac|armagnac/.test(t)) return "brandy";
  if (/苦艾酒|茴香|absinthe|pastis/.test(t)) return "absinthe";
  if (/味美思|vermouth/.test(t)) return "vermouth";
  if (/红葡萄酒|红酒|red wine/.test(t)) return "wine";
  return undefined;
}

/**
 * Does the drink carry carbonation? Champagne & other sparkling wines, plus
 * soda/tonic/cola/ginger-beer long drinks — used by <Glass> to fizz the liquid.
 */
export function isFizzy(ingredients: { name?: string; nameEn?: string }[] | undefined | null): boolean {
  if (!ingredients || ingredients.length === 0) return false;
  const text = ingredients.map((i) => `${i.name ?? ""} ${i.nameEn ?? ""}`).join(" ").toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => text.includes(k.toLowerCase()));
  return has(
    "香槟", "普罗塞克", "普罗赛克", "起泡", "气泡", "卡瓦", "苏打", "汽水", "汤力",
    "可乐", "雪碧", "姜啤", "姜汁", "金汤力",
    "champagne", "prosecco", "cava", "sparkling", "spumante", "soda", "seltzer",
    "tonic", "cola", "coke", "ginger ale", "ginger beer", "sprite", "club soda",
  );
}
