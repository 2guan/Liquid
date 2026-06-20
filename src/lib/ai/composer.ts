/**
 * The composer — turns a seed (mood / mix / pour) into a structured
 * CocktailResult. This is the "调酒师 + 诗人 + 化学家" rendered as pure functions.
 * Swap this for a real LLM by implementing the same return shape (see cocktailAI.ts).
 */
import type { CocktailResult, GlassType, IceType, Ingredient } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { spiritById, SPIRITS } from "@/lib/data/spirits";
import { VOICE, SIGNATURES, EMOTION_BRIDGES } from "./lexicon";
import { makeRng, hashString, type Rng } from "./rng";

/** Modifiers & accents the chemist reaches for, grouped by purpose. */
const MODIFIERS = [
  { name: "红味美思", nameEn: "Sweet Vermouth", family: "vermouth" as SpiritFamily },
  { name: "干味美思", nameEn: "Dry Vermouth", family: "vermouth" as SpiritFamily },
  { name: "君度橙酒", nameEn: "Cointreau" },
  { name: "黑樱桃利口酒", nameEn: "Maraschino" },
  { name: "接骨木花利口酒", nameEn: "Elderflower" },
  { name: "咖啡利口酒", nameEn: "Coffee Liqueur" },
];

const ACCENTS = [
  { name: "安格仕苦精", nameEn: "Angostura Bitters", amount: "2 dash" },
  { name: "橙味苦精", nameEn: "Orange Bitters", amount: "1 dash" },
  { name: "鲜柠檬汁", nameEn: "Lemon Juice", amount: "15ml" },
  { name: "青柠汁", nameEn: "Lime Juice", amount: "15ml" },
  { name: "蜂蜜糖浆", nameEn: "Honey Syrup", amount: "10ml" },
  { name: "薄荷叶", nameEn: "Fresh Mint", amount: "6 片" },
  { name: "迷迭香", nameEn: "Rosemary", amount: "1 枝" },
  { name: "苏打水", nameEn: "Soda", amount: "顶部补满" },
];

const GLASS_BY_FAMILY: Record<SpiritFamily, GlassType> = {
  whisky: "glencairn",
  whiskyPeat: "glencairn",
  brandy: "glencairn",
  gin: "coupe",
  vodka: "martini",
  rum: "rocks",
  tequila: "coupe",
  absinthe: "rocks",
  campari: "rocks",
  vermouth: "rocks",
  wine: "coupe",
  cream: "coupe",
  default: "rocks",
};

const ICE_BY_FAMILY: Record<SpiritFamily, IceType> = {
  whisky: "sphere",
  whiskyPeat: "none",
  brandy: "none",
  gin: "none",
  vodka: "none",
  rum: "cube",
  tequila: "none",
  absinthe: "crushed",
  campari: "cube",
  vermouth: "cube",
  wine: "none",
  cream: "cube",
  default: "cube",
};

function baseSpiritFor(family: SpiritFamily, rng: Rng): Ingredient {
  const match = SPIRITS.filter((s) => s.family === family);
  const chosen = match.length ? rng.pick(match) : rng.pick(SPIRITS);
  return {
    name: chosen.name,
    nameEn: chosen.nameEn,
    amount: `${rng.pick([45, 50, 60])}ml`,
    parts: rng.int(4, 6),
    family: chosen.family,
  };
}

function composeName(family: SpiritFamily, rng: Rng, keyword?: string) {
  const v = VOICE[family] ?? VOICE.default;
  // Pick aligned indices so the Chinese & English names describe the same image.
  const ai = rng.int(0, v.adjs.length - 1);
  const ni = rng.int(0, v.nouns.length - 1);
  const adj = v.adjs[ai];
  const baseNoun = v.nouns[ni];
  // Optionally weave a mood keyword into the noun — but never let it echo a
  // character already in the adjective or noun (avoids "孤独的孤独…").
  const adjStem = adj.replace(/的$/, "");
  const canWeave =
    keyword &&
    rng.chance(0.3) &&
    !adjStem.includes(keyword[0]) &&
    !baseNoun.includes(keyword[0]);
  const noun = canWeave ? `${keyword}${baseNoun}` : baseNoun;
  const name = `${adj}${noun}`;
  const nameEn = `${v.enAdj[ai]} ${v.enNoun[ni]}`;
  return { name, nameEn };
}

function composeStory(family: SpiritFamily, rng: Rng): string {
  const v = VOICE[family] ?? VOICE.default;
  const scene = rng.pick(v.scenes);
  const close = rng.pick([
    "把这一切收进杯底，便是此刻的你。",
    "于是我斟出这一杯，敬尚未说出口的那句话。",
    "请慢饮——它会替你把今晚妥帖地收好。",
    "举杯时，光会替你记住这个瞬间。",
  ]);
  return `${scene}。${close}\n—— ${rng.pick(SIGNATURES)}`;
}

function composeTaste(family: SpiritFamily, rng: Rng): string {
  const v = VOICE[family] ?? VOICE.default;
  const notes = rng.pickN(v.taste, Math.min(3, v.taste.length));
  const aroma = notes[0] ?? "复合的香气";
  const mid = notes[1] ?? "圆润的酒体";
  const finish = notes[2] ?? notes[0] ?? "悠长的回甘";
  const aromaLine = rng.pick([
    `初闻，${aroma}的气息率先升起，像一封缓缓拆开的信`,
    `凑近杯口，${aroma}先一步漫开，铺垫出整杯的底色`,
    `香气以${aroma}开场，清晰而有层次`,
  ]);
  const texture = rng.pick(["丝滑", "醇厚", "清亮", "绵密", "饱满"]);
  const palateLine = rng.pick([
    `入口被${mid}温柔包裹，质地${texture}，在舌面上层层铺展`,
    `酒液滑过舌尖，${mid}徐徐释放，口感${texture}而克制`,
    `中段是${mid}的主场，${texture}的酒体托起每一缕风味`,
  ]);
  const finishLine = rng.pick([
    `尾韵里${finish}久久不散，随杯壁的温度悄悄变换`,
    `余味是${finish}，在喉间轻轻停留，留下一道温热的回响`,
    `收尾以${finish}作结，绵长而干净，引人再啜一口`,
  ]);
  return `${aromaLine}。${palateLine}。${finishLine}。整杯层次分明，冷暖之间自有节奏，值得静下心来细品。`;
}

function composeEmotion(family: SpiritFamily, rng: Rng, mood: string): string {
  const v = VOICE[family] ?? VOICE.default;
  const bridge = rng.pick(EMOTION_BRIDGES).replace("{mood}", mood || "此刻的心绪");
  return `${bridge}${rng.pick(v.adjs)}${rng.pick(v.nouns)}。`;
}

function buildIngredients(family: SpiritFamily, rng: Rng, keywords: string[]): {
  ingredients: Ingredient[];
  ratio: number[];
} {
  const base = baseSpiritFor(family, rng);
  const ingredients: Ingredient[] = [base];

  // chemist adds a modifier for balance
  if (rng.chance(0.7)) {
    const m = rng.pick(MODIFIERS);
    ingredients.push({ name: m.name, nameEn: m.nameEn, amount: `${rng.pick([10, 15, 20])}ml`, parts: rng.int(1, 2), family: m.family });
  }
  // keyword-led accent (mint for calm, citrus for joy, etc.)
  const wantsHerb = keywords.some((k) => /薄荷|草|森林|呼吸/.test(k));
  const wantsCitrus = keywords.some((k) => /柑橘|阳光|气泡|微风|柠/.test(k));
  let accent;
  if (wantsHerb) accent = ACCENTS.find((a) => a.name === "薄荷叶")!;
  else if (wantsCitrus) accent = ACCENTS.find((a) => a.name === "鲜柠檬汁")!;
  else accent = rng.pick(ACCENTS);
  ingredients.push({ name: accent.name, nameEn: accent.nameEn, amount: accent.amount, parts: 1 });

  const ratio = ingredients.map((i) => i.parts ?? 1);
  return { ingredients, ratio };
}

export interface MoodComposeInput {
  family: SpiritFamily;
  moodText: string;
  keywords: string[];
}

export function composeFromMood(input: MoodComposeInput): CocktailResult {
  const seed = hashString(input.moodText + input.family + input.keywords.join());
  const rng = makeRng(seed || 1);
  const { ingredients, ratio } = buildIngredients(input.family, rng, input.keywords);
  const { name, nameEn } = composeName(input.family, rng, input.keywords[0]);
  return {
    name,
    nameEn,
    ingredients,
    ratio,
    glass: GLASS_BY_FAMILY[input.family],
    ice: ICE_BY_FAMILY[input.family],
    family: input.family,
    taste_profile: composeTaste(input.family, rng),
    story: composeStory(input.family, rng),
    emotion_mapping: composeEmotion(input.family, rng, input.moodText.slice(0, 16)),
  };
}

/** Pure Pour — describe a single spirit served in a chosen glass/ice. */
export function composePour(spiritId: string, glass: GlassType, ice: IceType): CocktailResult {
  const spirit = spiritById(spiritId) ?? SPIRITS[0];
  const seed = hashString(spiritId + glass + ice);
  const rng = makeRng(seed || 1);
  const { name, nameEn } = composeName(spirit.family, rng);
  const iceNote =
    ice === "none"
      ? "净饮以呈现最完整的香气层次"
      : ice === "sphere"
        ? "一颗手工大冰球缓释稀释，香气随温度层层舒展"
        : ice === "crushed"
          ? "碎冰带来即时的冰镇与霜雾"
          : "老式方冰沉稳冷却，结构清晰";
  return {
    name,
    nameEn,
    ingredients: [
      { name: spirit.name, nameEn: spirit.nameEn, amount: ice === "none" ? "45ml" : "60ml", parts: 1, family: spirit.family },
    ],
    ratio: [1],
    glass,
    ice,
    family: spirit.family,
    taste_profile: `${spirit.note}；${composeTaste(spirit.family, rng)}`,
    story: `${spirit.origin}的风土被封进这一杯。${iceNote}。${composeStory(spirit.family, rng)}`,
    emotion_mapping: `专注于本味，是对${spirit.nameEn}最坦诚的致敬。`,
  };
}
