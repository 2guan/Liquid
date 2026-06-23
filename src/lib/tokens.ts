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
