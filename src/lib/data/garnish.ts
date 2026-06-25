/**
 * Garnish inference — maps a drink's ingredients to the physical elements that
 * should appear in the finished glass, so every recognisable ingredient gets a
 * distinct on-glass representation (a mint sprig, a cinnamon stick, a clove, a
 * citrus wheel, a cherry…). Base spirits / liqueurs / syrups / mixers carry no
 * floating object — they manifest through the liquid's colour & carbonation.
 */

export type GarnishKind =
  | "citrusWheel"
  | "citrusTwist"
  | "berry"
  | "cherry"
  | "fruitSlice"
  | "mintSprig"
  | "herbSprig"
  | "thymeSprig"
  | "dillSprig"
  | "bayLeaf"
  | "basilLeaf"
  | "sageLeaf"
  | "leaf"
  | "lavender"
  | "flower"
  | "cinnamonStick"
  | "clove"
  | "starAnise"
  | "seeds"
  | "gingerSlice"
  | "chili"
  | "vanillaPod"
  | "coffeeBeans"
  | "dusting"
  | "olive"
  | "onion"
  | "goldLeaf"
  | "cucumberSlice"
  | "saltRim"
  | "sugarRim"
  | "foam"
  | "drops";

export type GarnishPlacement = "tall" | "surface" | "rim" | "dust" | "foam";

export interface GarnishSpec {
  kind: GarnishKind;
  color: string;
  placement: GarnishPlacement;
}

const PLACEMENT: Record<GarnishKind, GarnishPlacement> = {
  citrusWheel: "surface",
  citrusTwist: "surface",
  berry: "surface",
  cherry: "surface",
  fruitSlice: "surface",
  mintSprig: "tall",
  herbSprig: "tall",
  thymeSprig: "tall",
  dillSprig: "tall",
  bayLeaf: "surface",
  basilLeaf: "surface",
  sageLeaf: "surface",
  leaf: "surface",
  lavender: "tall",
  flower: "surface",
  cinnamonStick: "tall",
  clove: "surface",
  starAnise: "surface",
  seeds: "surface",
  gingerSlice: "surface",
  chili: "tall",
  vanillaPod: "tall",
  coffeeBeans: "surface",
  dusting: "dust",
  olive: "surface",
  onion: "surface",
  goldLeaf: "surface",
  cucumberSlice: "surface",
  saltRim: "rim",
  sugarRim: "rim",
  foam: "foam",
  drops: "surface",
};

const spec = (kind: GarnishKind, color: string): GarnishSpec => ({ kind, color, placement: PLACEMENT[kind] });

/** Map one ingredient name → the element it contributes to the glass (or null). */
export function garnishFor(name: string, category?: string): GarnishSpec | null {
  const n = name;

  // ── rim treatments ──
  if (n.includes("盐边") || (n.includes("海盐") && !n.includes("焦糖"))) return spec("saltRim", "#EDEDE6");
  if (n.includes("糖边")) return spec("sugarRim", "#ECE4D0");

  // ── foam cap ──
  if (n.includes("蛋白") || n.includes("奶油") || n.includes("椰奶") || n.includes("淡奶")) return spec("foam", "#F3ECDA");

  // ── bitters: a few aromatic dashes (before fruit — names like 橙味苦精 /
  //     樱桃苦精 contain fruit words) ──
  if (category === "bitters" || /苦精/.test(n)) {
    const c = n.includes("橙") ? "#B5662A" : /巧克力|咖啡|可可/.test(n) ? "#3A2016" : "#7A2A1C";
    return spec("drops", c);
  }

  // ── liquids (liqueurs / syrups / juices / mixers / wine) speak through the
  //     liquid's colour & fizz, not a solid garnish — even when fruit-named ──
  if (/利口酒|糖浆|汁|汽水|苏打|汤力|可乐|姜啤|绿茶|红茶|乌龙|葡萄酒|白兰地|清酒|水$/.test(n)) return null;

  // ── citrus peel twists ──
  if (n.includes("皮卷") || n.includes("橙皮") || n.includes("柠檬皮") || n.includes("葡萄柚皮") || /皮$/.test(n)) {
    const c = n.includes("柠檬") ? "#E8C84A" : n.includes("葡萄柚") ? "#E0654A" : "#E8923A";
    return spec("citrusTwist", c);
  }

  // ── citrus wheels / wedges ──
  if (/柠檬|青柠|橙|血橙|葡萄柚|柚|金橘|脱水柑橘|莱姆/.test(n)) {
    const c = n.includes("青柠") || (n.includes("柚") && !n.includes("葡萄柚"))
      ? "#9FC24A"
      : n.includes("血橙")
        ? "#C5402A"
        : n.includes("葡萄柚")
          ? "#E0654A"
          : n.includes("柠檬")
            ? "#E8C84A"
            : "#E8923A";
    return spec("citrusWheel", c);
  }

  // ── cherries ──
  if (n.includes("樱桃")) return spec("cherry", "#9E1F2A");

  // ── berries ──
  if (/草莓/.test(n)) return spec("berry", "#D83A4A");
  if (/覆盆子|树莓/.test(n)) return spec("berry", "#C5304A");
  if (/蓝莓/.test(n)) return spec("berry", "#4A4A8A");
  if (/黑莓|黑加仑/.test(n)) return spec("berry", "#3A1E3A");
  if (/蔓越莓/.test(n)) return spec("berry", "#B5283A");
  if (/石榴/.test(n) && !n.includes("糖浆")) return spec("berry", "#A8283A");
  if (/葡萄/.test(n) && !n.includes("葡萄酒") && !n.includes("葡萄柚")) return spec("berry", "#5A2A5A");

  // ── other fresh fruit slices ──
  if (/水蜜桃|蜜桃|桃子|^桃|白桃/.test(n)) return spec("fruitSlice", "#E8A86A");
  if (/杏(?!仁)/.test(n)) return spec("fruitSlice", "#E0913A");
  if (/李子|^李/.test(n)) return spec("fruitSlice", "#6E2A4A");
  if (/苹果/.test(n)) return spec("fruitSlice", "#A8C24A");
  if (/梨/.test(n)) return spec("fruitSlice", "#C9D08A");
  if (/菠萝|凤梨/.test(n)) return spec("fruitSlice", "#E8C23A");
  if (/芒果/.test(n)) return spec("fruitSlice", "#E8A82A");
  if (/百香果/.test(n)) return spec("fruitSlice", "#D89A2A");
  if (/西瓜/.test(n)) return spec("fruitSlice", "#E0566A");
  if (/荔枝/.test(n)) return spec("fruitSlice", "#E8D0C8");
  if (/无花果/.test(n)) return spec("fruitSlice", "#6E3A2A");
  if (/哈密瓜|蜜瓜|甜瓜/.test(n)) return spec("fruitSlice", "#E8B06A");
  if (/番石榴/.test(n)) return spec("fruitSlice", "#E07A6A");

  // ── herbs & botanicals (each species drawn distinctly) ──
  if (/薄荷|留兰香|香蜂草|马鞭草/.test(n)) return spec("mintSprig", "#6EA84A"); // paired round leaves
  if (/迷迭香/.test(n)) return spec("herbSprig", "#5A7A4A"); // needles
  if (/百里香|龙蒿/.test(n)) return spec("thymeSprig", "#6E8A4A"); // tiny alternating leaves
  if (/莳萝|茴香叶/.test(n)) return spec("dillSprig", "#7A9A4A"); // feathery fronds
  if (/月桂/.test(n)) return spec("bayLeaf", "#4A6A3A"); // single long pointed leaf
  if (/薰衣草/.test(n)) return spec("lavender", "#8A6AA8");
  if (/罗勒/.test(n)) return spec("basilLeaf", "#4E8A36"); // broad glossy leaf
  if (/鼠尾草/.test(n)) return spec("sageLeaf", "#8FA07C"); // soft grey-green leaf
  if (/紫苏/.test(n)) return spec("leaf", "#7E5A8A"); // purple generic leaf
  if (/香菜|香茅|苦艾|啤酒花|芦荟/.test(n)) return spec("leaf", "#5A8A3A");
  if (/玫瑰|茉莉|桂花|紫罗兰|洋甘菊|接骨木花|食用花/.test(n)) {
    const c = n.includes("玫瑰") || n.includes("紫罗兰") ? "#C56A86" : n.includes("洋甘菊") || n.includes("桂花") ? "#E0B85A" : "#E6E2C8";
    return spec("flower", c);
  }

  // ── spices ──
  if (/肉桂|桂皮/.test(n)) return spec("cinnamonStick", "#9C5A2A");
  if (/丁香/.test(n)) return spec("clove", "#5A3320");
  if (/八角/.test(n)) return spec("starAnise", "#7A3A24");
  if (/香草/.test(n) && !n.includes("草本")) return spec("vanillaPod", "#6A4A2A");
  if (/生姜|^姜|姜片|姜糖|姜味|姜汁/.test(n)) return spec("gingerSlice", "#E6CFA0");
  if (/辣椒/.test(n)) return spec("chili", "#C5342A");
  if (/咖啡豆|可可粒|咖啡点缀/.test(n)) return spec("coffeeBeans", "#3A2418");
  if (/可可粉|抹茶粉|肉豆蔻|藏红花|多香果/.test(n)) {
    const c = n.includes("抹茶") ? "#7EA84A" : n.includes("可可") ? "#5A3A2A" : n.includes("藏红花") ? "#C5662A" : "#8A5A34";
    return spec("dusting", c);
  }
  if (/黑胡椒|粉红胡椒|小豆蔻|杜松|芫荽|茴香籽|山椒|孜然|黑芝麻/.test(n)) {
    const c = n.includes("粉红") ? "#C56A5A" : n.includes("豆蔻") ? "#8A9A5A" : n.includes("芝麻") ? "#3A322C" : "#3A3028";
    return spec("seeds", c);
  }

  // ── explicit garnishes ──
  if (/橄榄/.test(n)) return spec("olive", "#7E8A4A");
  if (/洋葱/.test(n)) return spec("onion", "#E8E2C8");
  if (/金箔/.test(n)) return spec("goldLeaf", "#E3C684");
  if (/黄瓜/.test(n)) return spec("cucumberSlice", "#A8C28A");

  // base spirits / liqueurs / fortified / syrups / mixers → carried by the liquid
  return null;
}

/**
 * Resolve the set of garnishes for a drink. Deduplicates by kind and caps the
 * count (a tidy 1 sprig + a couple of surface items + a rim/dust) so the glass
 * reads as garnished, not cluttered. Returns them in draw order.
 */
/**
 * A classic aromatic garnish to pair with a spirit served neat / on the rocks
 * (Pure Pour) — a twist or wedge that lifts the nose, the way a bartender would
 * finish a pour. Returns an ingredient row so it flows to the glass + card.
 */
export function aromaticForFamily(family: string | undefined): { name: string; amount: string } | null {
  switch (family) {
    case "whisky":
    case "campari":
    case "brandy":
      return { name: "橙皮", amount: "1 卷" };
    case "whiskyPeat":
    case "gin":
    case "vodka":
    case "vermouth":
      return { name: "柠檬皮卷", amount: "1 卷" };
    case "rum":
    case "rumWhite":
    case "tequila":
      return { name: "青柠角", amount: "1 块" };
    case "cream":
      return { name: "肉豆蔻", amount: "少许" };
    default:
      return null;
  }
}

/** How many physical pieces an amount implies — only the builder's "份" count
 *  multiplies (so "2 份肉桂棒" → 2 sticks); recipe measures stay a single piece. */
function pieceCount(amount?: string): number {
  const m = amount && amount.match(/(\d+)\s*份/);
  if (!m) return 1;
  return Math.max(1, Math.min(3, parseInt(m[1], 10)));
}

export function garnishesFor(ingredients: { name?: string; category?: string; amount?: string }[] | undefined | null): GarnishSpec[] {
  if (!ingredients || ingredients.length === 0) return [];
  // Honour quantity: choosing 2 份肉桂棒 should show two sticks. Cap each kind at
  // 3 so a heavy hand reads as a little cluster, not a hedge.
  const all: GarnishSpec[] = [];
  const kindCount = new Map<GarnishKind, number>();
  for (const ing of ingredients) {
    if (!ing?.name) continue;
    const g = garnishFor(ing.name, ing.category);
    if (!g) continue;
    for (let k = 0, pieces = pieceCount(ing.amount); k < pieces; k++) {
      const c = kindCount.get(g.kind) ?? 0;
      if (c >= 3) break;
      kindCount.set(g.kind, c + 1);
      all.push(g);
    }
  }
  // cap each placement so the glass stays composed, not crowded
  const take = (p: GarnishPlacement, n: number) => all.filter((g) => g.placement === p).slice(0, n);
  return [
    ...take("foam", 1),
    ...take("rim", 1),
    ...take("surface", 5),
    ...take("tall", 4),
    ...take("dust", 1),
  ];
}
