/**
 * The composer — turns a seed (mood / mix / pour) into a structured
 * CocktailResult. This is the "调酒师 + 诗人 + 化学家" rendered as pure functions.
 * Swap this for a real LLM by implementing the same return shape (see cocktailAI.ts).
 */
import type { CocktailResult, GlassType, IceType, Ingredient, Recipe } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { spiritById, SPIRITS } from "@/lib/data/spirits";
import { aromaticForFamily } from "@/lib/data/garnish";
import { makePrepSteps, normalizePrepStepsGlass } from "@/lib/prepSteps";
import { VOICE, SIGNATURES, EMOTION_BRIDGES, randomSignature } from "./lexicon";
import { makeRng, hashString, type Rng } from "./rng";

/** Modifiers & accents the chemist reaches for, grouped by purpose. `family`
 *  tags the modifier's colour (via liquidRamp) so a varied mix pours multi-colour. */
const MODIFIERS: { name: string; nameEn: string; family?: SpiritFamily }[] = [
  { name: "红味美思", nameEn: "Sweet Vermouth", family: "vermouth" },
  { name: "干味美思", nameEn: "Dry Vermouth", family: "vermouth" },
  { name: "君度橙酒", nameEn: "Cointreau", family: "orange" },
  { name: "黑樱桃利口酒", nameEn: "Maraschino", family: "cranberry" },
  { name: "接骨木花利口酒", nameEn: "Elderflower" },
  { name: "咖啡利口酒", nameEn: "Coffee Liqueur", family: "coffee" },
  { name: "蓝橙利口酒", nameEn: "Blue Curaçao", family: "blue" },
  { name: "蜜瓜利口酒", nameEn: "Midori", family: "green" },
  { name: "黑加仑利口酒", nameEn: "Crème de Cassis", family: "berry" },
  { name: "金巴利", nameEn: "Campari", family: "campari" },
  { name: "艾普罗", nameEn: "Aperol", family: "sunrise" },
];

/** Bright liqueurs / syrups added as a "splash" to tint a mix into a multi-colour pour. */
const COLORFUL_SPLASH: { name: string; nameEn: string; family: SpiritFamily }[] = [
  { name: "蓝橙利口酒", nameEn: "Blue Curaçao", family: "blue" },
  { name: "蜜瓜利口酒", nameEn: "Midori", family: "green" },
  { name: "石榴糖浆", nameEn: "Grenadine", family: "grenadine" },
  { name: "黑加仑利口酒", nameEn: "Crème de Cassis", family: "berry" },
  { name: "金巴利", nameEn: "Campari", family: "campari" },
  { name: "艾普罗", nameEn: "Aperol", family: "sunrise" },
  { name: "君度橙酒", nameEn: "Cointreau", family: "orange" },
  { name: "蝶豆花糖浆", nameEn: "Butterfly Pea", family: "blue" },
];

const ACCENTS: { name: string; nameEn: string; amount: string; family?: SpiritFamily }[] = [
  { name: "安格仕苦精", nameEn: "Angostura Bitters", amount: "2 dash" },
  { name: "橙味苦精", nameEn: "Orange Bitters", amount: "1 dash" },
  { name: "鲜柠檬汁", nameEn: "Lemon Juice", amount: "15ml" },
  { name: "青柠汁", nameEn: "Lime Juice", amount: "15ml" },
  { name: "蜂蜜糖浆", nameEn: "Honey Syrup", amount: "10ml" },
  { name: "薄荷叶", nameEn: "Fresh Mint", amount: "6 片" },
  { name: "迷迭香", nameEn: "Rosemary", amount: "1 枝" },
  { name: "苏打水", nameEn: "Soda", amount: "顶部补满" },
  { name: "石榴糖浆", nameEn: "Grenadine", amount: "10ml", family: "grenadine" },
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
  rum: "cubes",
  tequila: "none",
  absinthe: "crushed",
  campari: "cubes",
  vermouth: "cubes",
  wine: "none",
  cream: "cube",
  default: "cubes",
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
  // Two distinct scenes, joined by a soft turn, then a closing line — a longer,
  // more unspooled narrative than a single scene.
  const picks = rng.pickN(v.scenes, Math.min(2, v.scenes.length));
  const open = picks[0];
  const turn = picks[1] ?? rng.pick(v.scenes);
  const bridge = rng.pick(["而后，", "不知何时，", "再抬眼，", "恍惚间，", "与此同时，"]);
  const middle = rng.pick([
    "酒液在杯壁上挂出细长的泪，把时间拉得很慢",
    "香气一层层散开，像有人在耳边低声说着往事",
    "光顺着杯沿流转，将周遭的喧嚣都隔在了很远的地方",
    "第一口落下，喉间漫开的暖意替你松开了紧绷的肩",
  ]);
  const close = rng.pick([
    "把这一切收进杯底，便是此刻的你。",
    "于是我斟出这一杯，敬尚未说出口的那句话。",
    "请慢饮——它会替你把今晚妥帖地收好。",
    "举杯时，光会替你记住这个瞬间。",
  ]);
  return `${open}。${middle}。${bridge}${turn}。${close}\n—— ${rng.pick(SIGNATURES)}`;
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
  // a colourful splash — a bright liqueur/syrup of a new colour, so a varied mix
  // genuinely pours multi-colour (the gradient is built from these ingredients)
  if (rng.chance(0.5)) {
    const sp = rng.pick(COLORFUL_SPLASH);
    if (!ingredients.some((i) => i.family === sp.family)) {
      ingredients.push({ name: sp.name, nameEn: sp.nameEn, amount: `${rng.pick([8, 10, 15])}ml`, parts: 1, family: sp.family });
    }
  }
  // keyword-led accent (mint for calm, citrus for joy, etc.)
  const wantsHerb = keywords.some((k) => /薄荷|草|森林|呼吸/.test(k));
  const wantsCitrus = keywords.some((k) => /柑橘|阳光|气泡|微风|柠/.test(k));
  let accent;
  if (wantsHerb) accent = ACCENTS.find((a) => a.name === "薄荷叶")!;
  else if (wantsCitrus) accent = ACCENTS.find((a) => a.name === "鲜柠檬汁")!;
  else accent = rng.pick(ACCENTS);
  ingredients.push({ name: accent.name, nameEn: accent.nameEn, amount: accent.amount, parts: 1, family: accent.family });

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
  const result: CocktailResult = {
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
  result.steps = makePrepSteps(result);
  return result;
}

/** Pure Pour — describe a single spirit served in a chosen glass/ice. */
export function composePour(spiritId: string, glass: GlassType, ice: IceType): CocktailResult {
  const spirit = spiritById(spiritId) ?? SPIRITS[0];
  const seed = hashString(spiritId + glass + ice);
  const rng = makeRng(seed || 1);
  const { name, nameEn } = composeName(spirit.family, rng);
  const iceNote =
    {
      none: "净饮以呈现最完整的香气层次",
      sphere: "一颗手工大冰球缓释稀释，香气随温度层层舒展",
      crushed: "碎冰带来即时的冰镇与霜雾",
      cubes: "多颗小方冰填满杯身，迅速冰镇",
      bullets: "子弹冰粒堆叠满杯，入口清脆",
      cube: "老式方冰沉稳冷却，结构清晰",
    }[ice] ?? "老式方冰沉稳冷却，结构清晰";
  // a classic aromatic twist only finishes ~30% of pours, not every time
  const aromatic = rng.chance(0.3) ? aromaticForFamily(spirit.family) : null;
  const result: CocktailResult = {
    name,
    nameEn,
    ingredients: [
      { name: spirit.name, nameEn: spirit.nameEn, amount: ice === "none" ? "45ml" : "60ml", parts: 1, family: spirit.family },
      ...(aromatic ? [{ name: aromatic.name, amount: aromatic.amount, parts: 0 }] : []),
    ],
    ratio: [1],
    glass,
    ice,
    family: spirit.family,
    taste_profile: `${spirit.note}；${composeTaste(spirit.family, rng)}`,
    story: `${spirit.origin}的风土被封进这一杯。${iceNote}。${composeStory(spirit.family, rng)}`,
    emotion_mapping: `专注于本味，是对${spirit.nameEn}最坦诚的致敬。`,
  };
  result.steps = makePrepSteps(result);
  return result;
}

/**
 * Mixology — assemble the result for a recreated classic. Prose (品酒笔记 +
 * 散文叙事 + 落款) may come from the LLM via `prose`; whatever is missing falls
 * back to the offline poet. The recipe's own data (name / ingredients / glass /
 * ice / colour) is authoritative; the success line is appended after the story.
 */
export function assembleMixResult(
  recipe: Recipe,
  success: boolean,
  accuracy: number,
  prose?: { story?: string; taste_profile?: string; signature?: string; steps?: string[] },
): CocktailResult {
  // a deterministic offline draft, seeded by the recipe, used to fill any gaps
  const composed = composeFromMood({
    family: recipe.family,
    moodText: recipe.id,
    keywords: [...recipe.ingredients.map((i) => i.name), recipe.tasting].slice(0, 4),
  });
  const strip = (s: string) => s.replace(/\s*\n?\s*——[^\n]*$/, "").trimEnd();

  const sig =
    prose?.signature?.trim() ||
    composed.story.match(/——\s*([^\n]+)\s*$/)?.[1]?.trim() ||
    randomSignature();

  const aiStory = prose?.story?.trim();
  const composedBody = strip(composed.story);
  const recipeBody = recipe.story ? strip(recipe.story) : "";
  const baseStory = aiStory || (recipeBody ? `${recipeBody}\n${composedBody}` : composedBody);

  const lead = recipe.tasting.replace(/[。.]$/, "");
  const taste = prose?.taste_profile?.trim() || `${lead}。${composed.taste_profile}`;

  const tail = success
    ? `你以 ${Math.round(accuracy * 100)}% 的精准复刻了这杯${recipe.alcoholFree ? "特调" : "经典"}。`
    : "比例偏离了经典的轨道，却也调出了独属于你的版本——失败，有时是另一种配方的开始。";

  const result: CocktailResult = {
    name: success ? recipe.name : `${recipe.name}（即兴版）`,
    nameEn: recipe.nameEn,
    ingredients: recipe.ingredients,
    ratio: recipe.ingredients.map((i) => i.parts ?? 1),
    glass: recipe.glass,
    ice: recipe.ice,
    family: recipe.family,
    taste_profile: taste,
    story: `${baseStory}\n${tail}\n—— ${sig}`,
    emotion_mapping: success ? "对经典的敬意，藏在每一毫升的精确里。" : "偏差也是风格，干杯。",
    // carry colour-layering through so the glass renders B-52 / Black Velvet etc.
    layers: recipe.layers,
    steps: prose?.steps?.length ? prose.steps : recipe.steps?.length ? recipe.steps : undefined,
  };
  result.steps = result.steps?.length ? normalizePrepStepsGlass(result, result.steps) : makePrepSteps(result);
  return result;
}
