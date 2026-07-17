/**
 * magicMix — the shared logic behind the Magic / Alchemy Atelier builder
 * (魔法模式). Ported from the web build. It turns an ordered list of chosen
 * ingredients (with amounts) into the visual contract the glass renders
 * (layers / blended colour / fill) and the structural facts the AI needs
 * (dominant colour family, classification). Kept free of any prose so the live
 * preview and the offline poet share ONE source of truth.
 */
import type { FlavorPick } from "../types";
import type { SpiritFamily, LiquidLayer } from "../tokens";
import { blendColors } from "../tokens";

/** Categories that pour actual liquid into the glass (form colour bands). */
export const LIQUID_CATEGORIES = new Set([
  "spirit",
  "liqueur",
  "fortified",
  "bitters",
  "juice",
  "syrup",
  "mixer",
]);

/** Categories that are always alcoholic. (mixer is decided per-ingredient.) */
const ALCOHOLIC_CATEGORIES = new Set(["spirit", "liqueur", "fortified", "bitters"]);

export type MixUnit = "ml" | "dash" | "份";

export interface MixAmount {
  qty: number;
  unit: MixUnit;
}

/** The bartender's default measure for a freshly-added ingredient. */
export function defaultAmount(category: string): MixAmount {
  switch (category) {
    case "spirit":
      return { qty: 45, unit: "ml" };
    case "liqueur":
    case "fortified":
      return { qty: 20, unit: "ml" };
    case "syrup":
      return { qty: 15, unit: "ml" };
    case "juice":
      return { qty: 30, unit: "ml" };
    case "mixer":
      return { qty: 60, unit: "ml" };
    case "bitters":
      return { qty: 2, unit: "dash" };
    case "herb":
    case "fruit":
      return { qty: 1, unit: "份" };
    case "spice":
      return { qty: 1, unit: "份" };
    default:
      return { qty: 1, unit: "份" };
  }
}

export function amountStep(unit: MixUnit): number {
  return unit === "ml" ? 5 : 1;
}

export function amountLabel(qty: number, unit: MixUnit): string {
  if (unit === "ml") return `${qty}ml`;
  if (unit === "dash") return `${qty} dash`;
  return `${qty} 份`;
}

export function itemVolumeMl(it: { category: string; qty: number; unit: MixUnit }): number {
  if (!LIQUID_CATEGORIES.has(it.category)) return 0;
  if (it.unit === "ml") return it.qty;
  if (it.unit === "dash") return Math.max(1, it.qty * 0.8);
  return 0;
}

export interface MixItemLike {
  category: string;
  color: string;
  family?: SpiritFamily;
  qty: number;
  unit: MixUnit;
}

export function totalVolumeMl(items: MixItemLike[]): number {
  return items.reduce((s, it) => s + itemVolumeMl(it), 0);
}

/**
 * The colour bands, BOTTOM → TOP in the order the ingredients were added (so the
 * pour honours the player's sequence). Each band's thickness ∝ its volume.
 */
export function buildLayers(items: MixItemLike[]): LiquidLayer[] {
  return items
    .map((it) => ({ color: it.color, ratio: itemVolumeMl(it) }))
    .filter((b) => b.ratio > 0);
}

export function fillForVolume(totalMl: number): number {
  if (totalMl <= 0) return 0;
  return Math.max(0.08, Math.min(0.95, totalMl / 170));
}

export function blendForItems(items: MixItemLike[]): string | null {
  const liquids = items.filter((it) => itemVolumeMl(it) > 0);
  if (!liquids.length) return null;
  const expanded: string[] = [];
  for (const it of liquids) {
    const w = Math.max(1, Math.round(itemVolumeMl(it) / 10));
    for (let i = 0; i < w; i++) expanded.push(it.color);
  }
  return blendColors(expanded);
}

const CATEGORY_FAMILY: Record<string, SpiritFamily> = {
  spirit: "whisky",
  liqueur: "brandy",
  fortified: "vermouth",
  bitters: "campari",
  juice: "tequila",
  fruit: "default",
  herb: "absinthe",
  spice: "brandy",
  syrup: "cream",
  mixer: "gin",
  garnish: "default",
};

export function dominantFamily(picks: { family?: SpiritFamily; category: string }[]): SpiritFamily {
  const famCounts = new Map<SpiritFamily, number>();
  for (const p of picks) if (p.family) famCounts.set(p.family, (famCounts.get(p.family) ?? 0) + 1);
  if (famCounts.size) {
    let best: SpiritFamily = "default";
    let max = -1;
    famCounts.forEach((n, f) => {
      if (n > max) {
        max = n;
        best = f;
      }
    });
    return best;
  }
  const catCounts = new Map<string, number>();
  for (const p of picks) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  let bestCat = "spirit";
  let maxC = -1;
  catCounts.forEach((n, c) => {
    if (n > maxC) {
      maxC = n;
      bestCat = c;
    }
  });
  return CATEGORY_FAMILY[bestCat] ?? "default";
}

function isAlcoholicMixer(p: { name?: string; nameEn?: string; family?: SpiritFamily }): boolean {
  if (p.family === "wine") return true;
  const t = `${p.name ?? ""} ${p.nameEn ?? ""}`.toLowerCase();
  return /清酒|sake|香槟|champagne|普罗赛克|普罗塞克|prosecco|卡瓦|cava|葡萄酒|wine/.test(t);
}

export interface MixClass {
  hasLiquid: boolean;
  hasAlcohol: boolean;
  onlyGarnish: boolean;
  mocktail: boolean;
}

export function classifyMix(picks: { category: string; name?: string; nameEn?: string; family?: SpiritFamily }[]): MixClass {
  const hasLiquid = picks.some((p) => LIQUID_CATEGORIES.has(p.category));
  const hasAlcohol = picks.some(
    (p) => ALCOHOLIC_CATEGORIES.has(p.category) || (p.category === "mixer" && isAlcoholicMixer(p)),
  );
  return {
    hasLiquid,
    hasAlcohol,
    onlyGarnish: !hasLiquid,
    mocktail: hasLiquid && !hasAlcohol,
  };
}

export type AmountedPick = FlavorPick & { amount?: string };
