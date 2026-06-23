/**
 * DeepSeek LLM integration — SERVER ONLY (imported by /api route handlers).
 *
 * The API key lives in DEEPSEEK_API_KEY (server env) and never reaches the
 * browser. Each function asks the model for the exact CocktailResult JSON
 * contract, then normalises the reply into safe, typed values. On any failure
 * the route handler falls back to the offline composer, so the app always works.
 */
import type { CocktailResult, FlavorPick, GlassType, IceType, Ingredient, MoodInput, Recipe } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { liquidRamp, inferLiquidFamily, blendColors } from "@/lib/tokens";
import { GLASSES, isGlassId } from "@/lib/data/glasses";
import { spiritById } from "@/lib/data/spirits";
import { aromaticForFamily } from "@/lib/data/garnish";
import { randomSignature, withSignature } from "./lexicon";
import { assembleMixResult } from "./composer";
import type { MixAnalysis } from "./cocktailAI";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export const deepseekConfigured = Boolean(API_KEY);

/* ── allowed enum values handed to the model & used to normalise its reply ── */
const FAMILIES: SpiritFamily[] = [
  "whisky", "whiskyPeat", "gin", "rum", "tequila", "vodka", "brandy",
  "absinthe", "campari", "vermouth", "wine", "cream",
];
const ICES: IceType[] = ["none", "sphere", "cube", "cubes", "bullets", "crushed"];
// a curated glass shortlist for the prompt (the model may use any; we coerce)
const GLASS_HINT = [
  "glencairn", "rocks", "double-rocks", "highball", "collins", "martini",
  "coupe", "nick-nora", "margarita", "wine-red", "flute", "sour", "snifter",
  "hurricane", "tiki-mug", "copper-mug",
];

interface DSMessage {
  role: "system" | "user";
  content: string;
}

async function callDeepSeek(messages: DSMessage[], maxTokens = 1400): Promise<Record<string, unknown>> {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY not set");
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 40_000);
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        response_format: { type: "json_object" },
        temperature: 1.0,
        max_tokens: maxTokens,
        // Disable the model's chain-of-thought ("思考模式") — direct answer,
        // no reasoning_content, much faster. Verified against deepseek-v4-flash.
        thinking: { type: "disabled" },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`DeepSeek ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return parseJsonObject(content);
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("DeepSeek returned non-JSON content");
  }
}

/* ── normalisation helpers ── */
const str = (v: unknown, fallback = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fallback);

function coerceFamily(v: unknown): SpiritFamily {
  const s = str(v).replace(/\s+/g, "");
  const hit = FAMILIES.find((f) => f.toLowerCase() === s.toLowerCase());
  return hit ?? "default";
}
function coerceIce(v: unknown): IceType {
  const s = str(v).toLowerCase();
  return (ICES as string[]).includes(s) ? (s as IceType) : "none";
}
function coerceGlass(v: unknown): GlassType {
  const s = str(v).trim();
  if (isGlassId(s)) return s;
  // try matching by name / nameEn
  const byName = GLASSES.find(
    (g) => g.name === s || g.nameEn.toLowerCase() === s.toLowerCase() || g.nameEn.toLowerCase().includes(s.toLowerCase()),
  );
  return byName?.id ?? "rocks";
}
function partsForAmount(amount: string): number {
  const m = amount.match(/(\d+(?:\.\d+)?)\s*ml/i);
  if (m) return Math.max(1, Math.round(parseFloat(m[1]) / 10));
  return 0;
}
function coerceIngredients(v: unknown, fallback: Ingredient[]): Ingredient[] {
  if (!Array.isArray(v)) return fallback;
  const out: Ingredient[] = v
    .map((it): Ingredient | null => {
      if (typeof it === "string") return { name: it, amount: "适量", parts: 0 };
      if (it && typeof it === "object") {
        const o = it as Record<string, unknown>;
        const name = str(o.name);
        if (!name) return null;
        const amount = str(o.amount, "适量");
        return {
          name,
          nameEn: str(o.nameEn) || undefined,
          amount,
          parts: partsForAmount(amount),
          family: o.family ? coerceFamily(o.family) : undefined,
        };
      }
      return null;
    })
    .filter((x): x is Ingredient => x !== null);
  return out.length ? out : fallback;
}
function normalizeResult(
  raw: Record<string, unknown>,
  defaults: { glass: GlassType; ice: IceType; family: SpiritFamily; ingredients: Ingredient[] },
): CocktailResult {
  const ingredients = coerceIngredients(raw.ingredients, defaults.ingredients);
  // Witty sign-off: prefer the model's own, else a random persona from the pool.
  const sig = str(raw.signature ?? raw.signoff) || randomSignature();
  // Colour the glass by the actual mix, not just the model's chosen base family.
  const baseFamily = raw.family ? coerceFamily(raw.family) : defaults.family;
  return {
    name: str(raw.name, "无名之作"),
    nameEn: str(raw.nameEn ?? raw.name_en, "Untitled"),
    ingredients,
    ratio: ingredients.map((i) => i.parts ?? 1),
    glass: raw.glass ? coerceGlass(raw.glass) : defaults.glass,
    ice: raw.ice ? coerceIce(raw.ice) : defaults.ice,
    family: inferLiquidFamily(ingredients, baseFamily),
    taste_profile: str(raw.taste_profile ?? raw.tasting, "层次丰富，回味悠长。"),
    story: withSignature(str(raw.story, "光在杯中缓缓流动。"), sig),
    emotion_mapping: str(raw.emotion_mapping ?? raw.emotion, ""),
    hidden: Boolean(raw.hidden),
  };
}

/* ── shared system persona ── */
const SYSTEM = `你是「微醺时刻 The Sip & Sigh」的 AI 调酒师，同时是诗人与风味化学家。
你的回答必须是**一个 JSON 对象**，且只包含以下字段（不要多余文本）：
{
  "name": "中文酒名（写意、有画面感，4-8字）",
  "nameEn": "对应的英文名（与中文意象一致）",
  "ingredients": [{"name":"中文原料名","nameEn":"英文名","amount":"如 60ml / 2 dash / 1 片"}],
  "glass": "杯型id，从给定列表中选最合适的",
  "ice": "none | sphere(大冰球) | cube(老式大方冰) | cubes(多颗小方冰填满杯) | bullets(子弹冰粒填满杯) | crushed(碎冰)，长饮/气泡类多用 cubes，休闲清爽可用 bullets",
  "family": "酒液主色，从给定列表中选：${FAMILIES.join(" | ")}",
  "taste_profile": "中文品酒笔记，3-4句、约90-130字，依次描写香气、入口、中段口感与尾韵，细腻具体、富有画面感",
  "story": "中文散文式叙事，4-6句、约90-140字，铺陈意象与情绪的起承转合，画面层层展开、有呼吸感与留白（不要在结尾署名）",
  "emotion_mapping": "中文一句，把用户的心情/选择映射到这杯酒",
  "signature": "一个风趣俏皮的酒评人化名/落款，自带人设与梗，6-14字，最好与这杯酒或用户心情呼应。风格参考（请勿照抄）：千杯不醉的白领酒评师 / 深夜便利店哲学家 / 把周一调成周五的魔法师。每次都要原创、新鲜、有反差萌"
}
可选杯型id：${GLASS_HINT.join(", ")}。
语气复古、温暖、克制而富诗意；但 signature 落款要俏皮幽默、有反差萌。只输出 JSON。`;

/* ── 1. Mood Pour ── */
export async function dsMoodPour(input: MoodInput): Promise<CocktailResult> {
  const user = `用户此刻的心情：「${input.text || "（未填写）"}」
${input.tags.length ? `心绪标签：${input.tags.join("、")}` : ""}
请为这份心情创作一杯专属鸡尾酒，让酒成为情绪的化身。`;
  const raw = await callDeepSeek([
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ]);
  return normalizeResult(raw, { glass: "coupe", ice: "none", family: "default", ingredients: [] });
}

/* ── 2. Pure Pour (single spirit, fixed glass + ice) ── */
export async function dsPurePour(spiritId: string, glass: GlassType, ice: IceType): Promise<CocktailResult> {
  const sp = spiritById(spiritId);
  const spiritName = sp ? `${sp.name}（${sp.nameEn}，${sp.origin}，ABV ${sp.abv}%，风味：${sp.flavor.join("、")}）` : spiritId;
  const iceText = { none: "净饮不加冰", sphere: "一颗手工大冰球", cube: "老式方冰", cubes: "多颗小方冰", bullets: "子弹冰粒", crushed: "碎冰" }[ice];
  const user = `这是一杯纯饮，基酒为：${spiritName}。
盛具：${glass}；冰：${iceText}。
请为这次纯饮品鉴命名并撰写品酒笔记与叙事。
注意：ingredients 只包含这一支基酒；glass 必须是 "${glass}"；ice 必须是 "${ice}"。`;
  const raw = await callDeepSeek([
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ]);
  const result = normalizeResult(raw, {
    glass,
    ice,
    family: sp?.family ?? "whisky",
    ingredients: sp ? [{ name: sp.name, nameEn: sp.nameEn, amount: ice === "none" ? "45ml" : "60ml", parts: 1, family: sp.family }] : [],
  });
  // honour the player's explicit glass/ice/base choices
  result.glass = glass;
  result.ice = ice;
  if (sp) result.family = sp.family;
  // finish ~30% of pours with a classic aromatic garnish (twist / wedge), not
  // every time, and only if the model hasn't already added one
  const aromatic = Math.random() < 0.3 ? aromaticForFamily(sp?.family) : null;
  if (aromatic && !result.ingredients.some((i) => /皮|柠檬|青柠|橙|肉豆蔻|薄荷|樱桃/.test(i.name))) {
    result.ingredients = [...result.ingredients, { name: aromatic.name, amount: aromatic.amount, parts: 0 }];
  }
  return result;
}

/* ── 3. Zen Atelier (free-mix flavour analysis) ── */
export async function dsZenMix(picks: FlavorPick[]): Promise<MixAnalysis> {
  const list = picks.map((p) => `${p.name}${p.family ? `(${p.family})` : ""}：${p.flavor.join("、")}`).join("\n");
  const baseIngredients: Ingredient[] = picks.map((p) => ({ name: p.name, nameEn: p.nameEn, amount: "30ml", parts: 1, family: p.family }));
  const dominant = picks.find((p) => p.family)?.family ?? "default";
  const user = `用户在自由创作画布上组合了以下风味原料：
${list}
请以风味化学家和诗人的视角分析这个组合，并产出一杯成品。额外要求：
- 在 JSON 中再加两个字段："harmony"（0~1 的数字，表示风味和谐度），"verdict"（一句中文点评）。
- 若该组合恰好构成某款知名经典鸡尾酒（如金酒+金巴利+红味美思=尼格罗尼），把 "hidden" 设为 true，并用该经典之名命名。
- ingredients 使用上面列出的原料。`;
  const raw = await callDeepSeek(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    1600,
  );
  const result = normalizeResult(raw, { glass: "rocks", ice: "cube", family: dominant, ingredients: baseIngredients });
  const harmonyRaw = typeof raw.harmony === "number" ? raw.harmony : Number(raw.harmony);
  const harmony = Number.isFinite(harmonyRaw) ? Math.min(1, Math.max(0, harmonyRaw)) : 0.7;
  // colour a free mix by blending its ingredients (classics keep their family hue)
  const blended = blendColors(picks.map((p) => p.color));
  return {
    ...result,
    ingredients: result.ingredients.length ? result.ingredients : baseIngredients,
    liquidColor: result.hidden ? undefined : blended ?? undefined,
    harmony,
    verdict: str(raw.verdict, harmony > 0.7 ? "结构和谐，风味彼此成全。" : "大胆的实验，自有其风格。"),
  };
}

/* ── 4. Mixology (write prose for a recreated classic) ── */
const MIX_SYSTEM = `你是「微醺时刻 The Sip & Sigh」的 AI 调酒师，同时是诗人与风味化学家。
只输出一个 JSON 对象，不要多余文本。语气复古、温暖、克制而富诗意；signature 落款要俏皮幽默、有反差萌。`;

export async function dsMixology(recipe: Recipe, success: boolean, accuracy: number): Promise<CocktailResult> {
  const ing = recipe.ingredients.map((i) => `${i.name} ${i.amount}`).join("、");
  const user = `这是一杯经典鸡尾酒「${recipe.name} ${recipe.nameEn}」。
配方：${ing}。
盛具：${recipe.glass}；冰：${recipe.ice}。
请为这杯酒撰写品鉴文字，只输出 JSON：{"taste_profile":"…","story":"…","signature":"…"}
- taste_profile：中文品酒笔记，3-4句、约90-140字，依次描写香气、入口、中段口感与尾韵，细腻具体；
- story：中文散文式叙事，4-6句、约90-140字，富有画面与情绪，不要署名、不要提及百分比或“复刻/精准”等字眼；
- signature：风趣俏皮的酒评人化名/落款，6-14字，自带人设与反差萌。`;
  const raw = await callDeepSeek([
    { role: "system", content: MIX_SYSTEM },
    { role: "user", content: user },
  ]);
  return assembleMixResult(recipe, success, accuracy, {
    story: str(raw.story),
    taste_profile: str(raw.taste_profile ?? raw.tasting),
    signature: str(raw.signature ?? raw.signoff),
  });
}
