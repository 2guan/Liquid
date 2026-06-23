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
import { hashString } from "./rng";
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

/** Colour ramp fallback when no base spirit is in the mix, keyed by category. */
const CATEGORY_FAMILY: Record<string, SpiritFamily> = {
  spirit: "whisky",
  liqueur: "brandy",
  fortified: "vermouth",
  bitters: "campari",
  fruit: "tequila",
  herb: "absinthe",
  spice: "brandy",
  syrup: "cream",
  mixer: "gin",
  garnish: "default",
};

/** The drink's colour family: the most common base family, else by dominant category. */
function familyForPicks(picks: FlavorPick[]): SpiritFamily {
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
    const family = familyForPicks(picks);
    const harmony = computeHarmony(picks);

    // Long-drink heuristic: a sparkling/soft mixer pushes toward a highball.
    const hasMixer = picks.some((p) => p.category === "mixer");
    const ingredients = picks.map((p) => ({
      name: p.name,
      nameEn: p.nameEn,
      amount: amountFor(p.category),
      parts: 1,
      family: p.family,
    }));

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
