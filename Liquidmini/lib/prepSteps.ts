import type { CocktailResult, Ingredient } from "./types";
import { isFizzy } from "./tokens";
import { GLASSES, glassById } from "./data/catalog";

const measured = (ingredients: Ingredient[]) =>
  ingredients
    .filter((i) => (i.parts ?? 1) > 0)
    .map((i) => `${i.name}${i.amount ? ` ${i.amount}` : ""}`)
    .join("、");

const garnishNames = (ingredients: Ingredient[]) =>
  ingredients
    .filter((i) => (i.parts ?? 1) <= 0 || /片|枝|叶|瓣|粒|撮|适量|少许/.test(i.amount))
    .map((i) => i.name)
    .filter(Boolean);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const GLASS_NAME_RE = new RegExp(
  [
    ...GLASSES.map((g) => g.name),
    ...GLASSES.map((g) => g.nameEn),
    "老式杯",
    "香槟杯",
    "高脚杯",
    "闻香杯",
    "鸡尾酒杯",
  ]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|"),
  "gi",
);

export function normalizePrepStepsGlass(
  result: Pick<CocktailResult, "glass">,
  steps: string[] | undefined,
): string[] {
  if (!steps || steps.length === 0) return [];
  const glassName = glassById(result.glass).name;
  return steps.map((step) => step.replace(GLASS_NAME_RE, glassName));
}

export function makePrepSteps(result: Pick<CocktailResult, "ingredients" | "ice" | "glass">): string[] {
  const ingredients = result.ingredients || [];
  const liquids = measured(ingredients);
  const garnishes = garnishNames(ingredients);
  const fizzy = isFizzy(ingredients);
  const hasIce = result.ice !== "none";
  const hasOnlyGarnish = ingredients.length > 0 && ingredients.every((i) => (i.parts ?? 1) <= 0);

  if (hasOnlyGarnish) {
    return [
      `将${glassById(result.glass).name}擦净并冷却片刻，让空杯保持清透。`,
      `把${garnishes.slice(0, 3).join("、") || "点缀"}轻放在杯口或杯底。`,
      "不加入酒液，保留这只杯子的留白与仪式感。",
    ];
  }

  const steps = [
    hasIce ? `先准备${glassById(result.glass).name}与冰块，让杯壁和冰面都保持干净。`
      : `先冷却${glassById(result.glass).name}，倒掉融水，让杯壁保持清爽。`,
    liquids ? `按配方量取：${liquids}。` : "按配方备齐所有材料。",
  ];

  if (fizzy) {
    steps.push("将非气泡材料先加入杯中或调酒壶，轻轻混合至味道均匀。");
    steps.push("最后补入气泡材料，沿杯壁缓慢倒入，避免气泡过快消散。");
  } else if (hasIce) {
    steps.push("加入冰块后短暂搅拌或摇合，让温度下降并完成适度稀释。");
  } else {
    steps.push("轻柔搅拌或摇合至酒液融合，再滤入杯中。");
  }

  steps.push(garnishes.length
    ? `以${garnishes.slice(0, 2).join("、")}完成装饰，出杯前轻嗅香气。`
    : "确认酒液清亮、杯沿干净，即可出杯。");

  return normalizePrepStepsGlass(result, steps);
}
