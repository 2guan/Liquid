/**
 * CocktailAI — the AI orchestration surface used by the whole app.
 *
 *   UI = f(state, AI_output)
 *
 * Ported for the mini-program: the default export is the offline
 * `MockCocktailAI`, which composes structured results with zero network — the
 * same procedural poet the web build falls back to. A `RemoteCocktailAI`
 * (wx.request) is included to show how a real LLM endpoint can be swapped in
 * without touching any screen, but is not wired up by default.
 */
import type { CocktailResult, FlavorPick, GlassType, IceType, MoodInput, Recipe } from "../types";
import type { SpiritFamily } from "../tokens";
import { inferLiquidFamily, blendColors } from "../tokens";
import { MOOD_SEEDS } from "../data/moods";
import { composeFromMood, composePour, assembleMixResult } from "./composer";
import { randomSignature, withSignature } from "./lexicon";
import { hashString, makeRng } from "./rng";
import { classifyMix, dominantFamily, type AmountedPick } from "./magicMix";
import { API_BASE } from "../config";

/** Result of a Zen-mode flavour analysis. */
export interface MixAnalysis extends CocktailResult {
  harmony: number; // 0..1 — how well the chosen ingredients sit together
  verdict: string; // chemist's one-line judgement
}

export interface CocktailAI {
  /** Mood Pour: emotion → drink. */
  generateFromMood(input: MoodInput): Promise<CocktailResult>;
  /** Pure Pour: a single spirit, dressed in glass + ice. */
  describePour(spiritId: string, glass: GlassType, ice: IceType): Promise<CocktailResult>;
  /** Zen Atelier: free-mix flavour validation, may unlock a hidden recipe. */
  analyzeFlavorMix(picks: FlavorPick[]): Promise<MixAnalysis>;
  /** Mixology: write the prose for a recreated classic (success/accuracy aware). */
  describeMix(recipe: Recipe, success: boolean, accuracy: number): Promise<CocktailResult>;
}

/* ── Hidden recipes unlocked by specific family combinations (gamification §5.2) ── */
interface HiddenDef {
  families: SpiritFamily[];
  name: string;
  nameEn: string;
  story: string;
  taste: string;
  /** colour the finished drink takes — independent of the dominant base */
  color: SpiritFamily;
  glass: GlassType;
  ice: IceType;
}
const HIDDEN: HiddenDef[] = [
  {
    families: ["gin", "campari", "vermouth"],
    name: "猩红仪式",
    nameEn: "The Crimson Rite",
    color: "campari",
    glass: "rocks",
    ice: "cube",
    story:
      "你无意间复现了 1919 年佛罗伦萨的那一杯——苦与甜在杯中达成了一场古老的和解。\n—— The Sip & Sigh",
    taste: "苦橙与草本盛开，杜松收束于干爽悠长的尾韵。",
  },
  {
    families: ["whiskyPeat", "vermouth"],
    name: "盐雾挽歌",
    nameEn: "Brine Elegy",
    color: "whiskyPeat",
    glass: "rocks",
    ice: "sphere",
    story:
      "泥煤的烟与味美思的草本相遇，海风把这首挽歌吹得又咸又暖。\n—— The Sip & Sigh",
    taste: "篝火烟熏裹着香草与苦橙，咸鲜在喉间久久回荡。",
  },
  {
    families: ["tequila", "absinthe"],
    name: "幽绿黎明",
    nameEn: "Verdant Daybreak",
    color: "absinthe",
    glass: "coupe",
    ice: "none",
    story:
      "龙舌兰的烈日撞上苦艾的幽绿，一场清醒而危险的黎明就此降临。\n—— The Sip & Sigh",
    taste: "茴香与青草交织，烈日的明亮里藏着一缕薄荷的凉。",
  },
  {
    families: ["rum", "cream"],
    name: "云端甘蔗",
    nameEn: "Sugarcane Cloud",
    color: "cream",
    glass: "coupe",
    ice: "none",
    story:
      "热带的甘蔗被云絮般的奶油托起，甜得让人想起某个慵懒的午后。\n—— The Sip & Sigh",
    taste: "太妃糖与香草奶油绵密交融，尾韵是烤香蕉的暖。",
  },
];

/** Harmony heuristic: shared flavour descriptors raise it, too many distinct families/picks lower it. */
function computeHarmony(picks: FlavorPick[]): number {
  if (picks.length <= 1) return 0.92;
  const flavors = picks.flatMap((p) => p.flavor);
  const unique = new Set(flavors).size;
  const overlap = flavors.length - unique; // shared notes
  const families = new Set(picks.map((p) => p.family).filter(Boolean)).size;
  const base = 0.5 + overlap * 0.07 - Math.max(0, families - 1) * 0.05 - Math.max(0, picks.length - 4) * 0.07;
  return Math.min(0.98, Math.max(0.15, base));
}

export class MockCocktailAI implements CocktailAI {
  private latency: number;
  constructor(latency = 0) {
    this.latency = latency;
  }
  private async think<T>(value: T): Promise<T> {
    if (this.latency > 0) await new Promise((r) => setTimeout(r, this.latency));
    return value;
  }

  async generateFromMood(input: MoodInput): Promise<CocktailResult> {
    // pick the seed whose keywords best resonate with the text + tags
    const text = input.text || "";
    let best = MOOD_SEEDS[0];
    let bestScore = -1;
    for (const seed of MOOD_SEEDS) {
      let score = input.tags.includes(seed.tag) ? 5 : 0;
      for (const k of seed.keywords) if (text.includes(k)) score += 2;
      score += (hashString(text + seed.tag) % 100) / 100; // gentle tiebreaker
      if (score > bestScore) {
        bestScore = score;
        best = seed;
      }
    }
    const result = composeFromMood({
      family: best.family,
      moodText: text,
      keywords: [...best.keywords],
    });
    result.family = inferLiquidFamily(result.ingredients, result.family);
    return this.think(result);
  }

  async describePour(spiritId: string, glass: GlassType, ice: IceType): Promise<CocktailResult> {
    return this.think(composePour(spiritId, glass, ice));
  }

  async describeMix(recipe: Recipe, success: boolean, accuracy: number): Promise<CocktailResult> {
    return this.think(assembleMixResult(recipe, success, accuracy));
  }

  async analyzeFlavorMix(picks: FlavorPick[]): Promise<MixAnalysis> {
    const families = new Set(picks.map((p) => p.family).filter(Boolean) as SpiritFamily[]);
    const hidden = HIDDEN.find(
      (h) => h.families.every((f) => families.has(f)) && families.size <= h.families.length + 1,
    );
    const family = dominantFamily(picks);
    const harmony = computeHarmony(picks);

    // Long-drink heuristic: a sparkling/soft mixer pushes toward a highball.
    const hasMixer = picks.some((p) => p.category === "mixer");
    // honour the player's own measure when the builder passes one through
    const ingredients = picks.map((p) => ({
      name: p.name,
      nameEn: p.nameEn,
      amount: (p as AmountedPick).amount ?? amountFor(p.category),
      parts: 1,
      family: p.family,
    }));

    // ── honest, witty branches (Magic builder) ──
    const klass = classifyMix(picks);
    if (klass.onlyGarnish) return this.think(wittyGarnishOnly(picks, ingredients, harmony));
    if (klass.mocktail) return this.think(wittyMocktail(picks, ingredients, family, harmony));

    if (hidden) {
      return this.think({
        name: hidden.name,
        nameEn: hidden.nameEn,
        ingredients,
        ratio: ingredients.map(() => 1),
        glass: hidden.glass,
        ice: hidden.ice,
        family: hidden.color,
        taste_profile: hidden.taste,
        story: withSignature(hidden.story, randomSignature()),
        emotion_mapping: "你触发了一段被封存的配方记忆。",
        hidden: true,
        harmony: Math.max(harmony, 0.9),
        verdict: "隐藏配方解锁——这是大师才懂的平衡。",
      });
    }

    const base = composeFromMood({
      family,
      moodText: picks.map((p) => p.name).join("+"),
      keywords: picks.flatMap((p) => p.flavor).slice(0, 4),
    });
    const verdict =
      harmony > 0.78
        ? "结构和谐，风味彼此成全。"
        : harmony > 0.5
          ? "略有张力，但张力本身也是一种风格。"
          : "组合大胆——勇敢者的实验，未必失败。";
    // colour the free mix by blending the picked ingredients' own colours
    const blended = blendColors(picks.map((p) => p.color));
    return this.think({
      ...base,
      ingredients,
      ratio: ingredients.map(() => 1),
      glass: hasMixer ? "highball" : base.glass,
      family: inferLiquidFamily(ingredients, family),
      liquidColor: blended ?? undefined,
      harmony,
      verdict,
    });
  }
}

/** A sensible pour size per ingredient category. */
function amountFor(category: string): string {
  switch (category) {
    case "spirit":
      return "30ml";
    case "liqueur":
    case "fortified":
      return "20ml";
    case "syrup":
      return "10ml";
    case "bitters":
      return "2 dash";
    case "fruit":
      return "20ml";
    case "mixer":
      return "顶部补满";
    case "herb":
    case "garnish":
      return "适量";
    case "spice":
      return "1 撮";
    default:
      return "适量";
  }
}

type MixIngredient = { name: string; nameEn?: string; amount: string; parts?: number; family?: SpiritFamily };

/** Witty card for an empty glass dressed only in garnish — it owns the joke. */
function wittyGarnishOnly(picks: FlavorPick[], ingredients: MixIngredient[], harmony: number): MixAnalysis {
  const rng = makeRng(hashString(picks.map((p) => p.id).join("|")) || 1);
  const adorn = picks.map((p) => p.name).slice(0, 3).join("、");
  const cards = [
    {
      name: "皇帝的新酒",
      nameEn: "The Emperor's New Pour",
      story: `杯子是空的，可点缀一丝不苟——${adorn}郑重其事地停在杯沿。\n这不是一杯酒，而是一场关于「想象力」的行为艺术：请用目光把它斟满。`,
      taste: "气氛浓郁，酒精为零，余味全凭脑补。",
      emotion: "有时候，仪式感本身就足够醉人。",
    },
    {
      name: "空杯协奏曲",
      nameEn: "Ode to an Empty Glass",
      story: `没有酒，只有${adorn}在杯口打转。它像一封不写正文的信，把所有内容都留给了你。`,
      taste: "前调是期待，中段是留白，尾韵是一记会心的微笑。",
      emotion: "留白，是另一种丰盈。",
    },
    {
      name: "禅意虚无",
      nameEn: "Zen of Nothing",
      story: `你一丝不苟地装饰了一只空杯，缀上${adorn}。它什么也不是，却也因此可以是任何东西。`,
      taste: "无味之味，至味也——这话不一定对，但听起来很对。",
      emotion: "放空，也是一种调制。",
    },
  ];
  const c = rng.pick(cards);
  return {
    name: c.name,
    nameEn: c.nameEn,
    ingredients,
    ratio: ingredients.map(() => 1),
    glass: "coupe",
    ice: "none",
    family: "default",
    taste_profile: c.taste,
    story: withSignature(c.story, randomSignature()),
    emotion_mapping: c.emotion,
    harmony: Math.max(harmony, 0.8),
    verdict: "这是一只非常体面的空杯——严格来说，并不是酒。",
  };
}

/** Witty card for a zero-proof creation — honest that there's no alcohol. */
function wittyMocktail(picks: FlavorPick[], ingredients: MixIngredient[], family: SpiritFamily, harmony: number): MixAnalysis {
  const rng = makeRng(hashString(picks.map((p) => p.id).join("|") + "mock") || 1);
  const lead = picks.map((p) => p.name).slice(0, 3).join("、");
  const firstNote = picks[0]?.flavor?.[0] ?? "清新";
  const names = [
    { name: "清醒的诚实", nameEn: "Sober & Honest" },
    { name: "无酒之名", nameEn: "No-Proof Manifesto" },
    { name: "零度宣言", nameEn: "Zero-Proof Declaration" },
    { name: "不醉者联盟", nameEn: "The Teetotaler's Toast" },
  ];
  const n = rng.pick(names);
  const story =
    `没有一滴酒精，却装满了诚意。${lead}在杯中各自发声，谁也没醉，谁也不吵。\n` +
    `这是一杯无酒精特调——清醒，正是它最大的秘密。`;
  const taste = `入口是${firstNote}的明亮，中段顺滑饱满，尾韵干净利落，不留半分宿醉。`;
  return {
    name: n.name,
    nameEn: n.nameEn,
    ingredients,
    ratio: ingredients.map(() => 1),
    glass: picks.some((p) => p.category === "mixer") ? "highball" : "rocks",
    ice: "cubes",
    family: inferLiquidFamily(ingredients, family),
    liquidColor: blendColors(picks.map((p) => p.color)) ?? undefined,
    taste_profile: taste,
    story: withSignature(story, randomSignature()),
    emotion_mapping: "清醒着，也可以很尽兴。",
    harmony: Math.max(harmony, 0.7),
    verdict: "零酒精，满分真诚——这是一杯无酒精特调。",
  };
}

/**
 * RemoteCocktailAI — posts to an LLM endpoint via wx.request (the same
 * CocktailResult / MixAnalysis contract). Not used by default; provided so a
 * real backend can be wired up later without touching any screen. The endpoint
 * domain must be added to the mini-program's request 合法域名 allowlist.
 */
export class RemoteCocktailAI implements CocktailAI {
  constructor(private endpoint: string) {}
  private post<T>(path: string, body: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      wx.request({
        url: `${this.endpoint}${path}`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: body,
        success: (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data as T);
          else reject(new Error(`AI endpoint ${path} failed: ${res.statusCode}`));
        },
        fail: (err: any) => reject(err),
      });
    });
  }
  generateFromMood(input: MoodInput) {
    return this.post<CocktailResult>("/mood-pour", input);
  }
  describePour(spiritId: string, glass: GlassType, ice: IceType) {
    return this.post<CocktailResult>("/pure-pour", { spiritId, glass, ice });
  }
  analyzeFlavorMix(picks: FlavorPick[]) {
    return this.post<MixAnalysis>("/zen-mix", { picks });
  }
  describeMix(recipe: Recipe, success: boolean, accuracy: number) {
    return this.post<CocktailResult>("/mixology", { recipe, success, accuracy });
  }
}

/**
 * HybridCocktailAI — what the app uses. Calls the real LLM via the deployed
 * /api routes (wx.request) and transparently falls back to the offline poet on
 * any failure (network down, domain not whitelisted, malformed reply), so the
 * experience never breaks.
 */
class HybridCocktailAI implements CocktailAI {
  private remote: RemoteCocktailAI;
  private fallback = new MockCocktailAI(600);
  constructor(endpoint: string) {
    this.remote = new RemoteCocktailAI(endpoint);
  }
  private async withFallback<T>(remote: () => Promise<T>, offline: () => Promise<T>): Promise<T> {
    try {
      return await remote();
    } catch (err) {
      if (typeof console !== "undefined") console.warn("[CocktailAI] LLM unavailable, using offline poet:", err);
      return offline();
    }
  }
  generateFromMood(input: MoodInput) {
    return this.withFallback(() => this.remote.generateFromMood(input), () => this.fallback.generateFromMood(input));
  }
  describePour(spiritId: string, glass: GlassType, ice: IceType) {
    return this.withFallback(() => this.remote.describePour(spiritId, glass, ice), () => this.fallback.describePour(spiritId, glass, ice));
  }
  analyzeFlavorMix(picks: FlavorPick[]) {
    // Garnish-only / zero-proof creations still go to the LLM (the deployed
    // /zen-mix prompt makes it write a witty card that's honest about being
    // non-alcoholic / not-a-drink); the offline poet stays as the fallback.
    return this.withFallback(() => this.remote.analyzeFlavorMix(picks), () => this.fallback.analyzeFlavorMix(picks));
  }
  describeMix(recipe: Recipe, success: boolean, accuracy: number) {
    return this.withFallback(() => this.remote.describeMix(recipe, success, accuracy), () => this.fallback.describeMix(recipe, success, accuracy));
  }
}

/** The app imports this. Real LLM via the deployed /api, offline poet as fallback. */
export const cocktailAI: CocktailAI = new HybridCocktailAI(API_BASE);

/** Zero-latency offline variant for internal callers that don't want the think delay. */
export const offlineAI = new MockCocktailAI(0);
