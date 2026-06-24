/**
 * Achievements — the badge system + XP economy that sits on top of the rank
 * ladder (catalog.ts RANKS). Badges are grouped, tiered, grant XP on unlock,
 * and expose progress (cur/goal) so the UI can show a bar for locked ones.
 *
 * Every group holds a multiple of three badges (3 / 6 / 9). Shared verbatim
 * between the web app and the mini-program (only import paths differ).
 */
import { rankForXp } from "./catalog";
import { GLASS_COUNT } from "./glasses";

/** A snapshot of the player's progress, derived from the persisted store. */
export interface AchStat {
  xp: number;
  pours: number;
  journal: number;
  unlocked: number; // hidden recipes discovered
  pure: number;
  mixology: number;
  mood: number;
  zen: number;
  glasses: number; // distinct glass types used
  families: number; // distinct colour families produced
  ices: number; // distinct ice styles used
  ingredients: number; // distinct ingredient names encountered
  shares: number;
  rankIndex: number;
}

/** The raw, persisted shape the store keeps (arrays for the distinct sets). */
export interface AchSource {
  xp: number;
  pours: number;
  journal: number;
  unlocked: number;
  modes: { pure: number; mixology: number; mood: number; zen: number };
  glassesUsed: string[];
  familiesUsed: string[];
  icesUsed: string[];
  ingredientsUsed: string[];
  shares: number;
}

export function statsFrom(src: AchSource): AchStat {
  return {
    xp: src.xp,
    pours: src.pours,
    journal: src.journal,
    unlocked: src.unlocked,
    pure: src.modes.pure,
    mixology: src.modes.mixology,
    mood: src.modes.mood,
    zen: src.modes.zen,
    glasses: src.glassesUsed.length,
    families: src.familiesUsed.length,
    ices: src.icesUsed.length,
    ingredients: src.ingredientsUsed.length,
    shares: src.shares,
    rankIndex: rankForXp(src.xp).index,
  };
}

export type Tier = "bronze" | "silver" | "gold" | "legend";
export const TIER_XP: Record<Tier, number> = { bronze: 60, silver: 180, gold: 450, legend: 1200 };
export const TIER_COLOR: Record<Tier, string> = {
  bronze: "#C58A5A",
  silver: "#C9CDD4",
  gold: "#E3C684",
  legend: "#B98AD8",
};

export interface BadgeGroup {
  id: string;
  name: string; // zh
  nameEn: string;
  icon: string; // icon name (engraved-gold set)
}

export const BADGE_GROUPS: BadgeGroup[] = [
  { id: "start", name: "启程", nameEn: "Beginnings", icon: "sparkle" },
  { id: "volume", name: "产量", nameEn: "Volume", icon: "droplet" },
  { id: "pure", name: "纯饮之道", nameEn: "The Pure Pour", icon: "droplet" },
  { id: "mixology", name: "酒谱之道", nameEn: "The Codex", icon: "journal" },
  { id: "mood", name: "心事之道", nameEn: "Whisper of Mood", icon: "mic" },
  { id: "zen", name: "魔法之道", nameEn: "The Alchemy", icon: "stir" },
  { id: "glass", name: "杯具收藏", nameEn: "Glassware", icon: "library" },
  { id: "color", name: "风味色谱", nameEn: "The Spectrum", icon: "sparkle" },
  { id: "ice", name: "冰的艺术", nameEn: "On the Rocks", icon: "snow" },
  { id: "flavor", name: "风味探索", nameEn: "Flavours", icon: "plus" },
  { id: "journal", name: "微醺典藏", nameEn: "The Journal", icon: "journal" },
  { id: "secret", name: "隐藏秘方", nameEn: "Secrets", icon: "lock" },
  { id: "social", name: "微醺分享", nameEn: "Social", icon: "share" },
  { id: "rank", name: "段位里程", nameEn: "Ranks", icon: "trophy" },
  { id: "fun", name: "趣味成就", nameEn: "Curios", icon: "sparkle" },
];

export interface Badge {
  id: string;
  group: string;
  name: string;
  nameEn: string;
  hint: string;
  tier: Tier;
  goal: number;
  cur: (s: AchStat) => number;
}
const b = (
  id: string,
  group: string,
  name: string,
  nameEn: string,
  hint: string,
  tier: Tier,
  goal: number,
  cur: (s: AchStat) => number,
): Badge => ({ id, group, name, nameEn, hint, tier, goal, cur });

export const xpOf = (badge: Badge): number => TIER_XP[badge.tier];

export const BADGES: Badge[] = [
  // ── 启程 (3) ──
  b("first_pour", "start", "初次斟酌", "First Pour", "完成你的第一杯", "bronze", 1, (s) => s.pours),
  b("first_save", "start", "初次封存", "First Memory", "把一杯酒存入日记", "bronze", 1, (s) => s.journal),
  b("four_crafts", "start", "四艺初探", "Four Crafts", "四种模式各调一次", "silver", 4, (s) => [s.pure, s.mixology, s.mood, s.zen].filter((n) => n > 0).length),

  // ── 产量 (9) ──
  b("vol_5", "volume", "渐入佳境", "Getting Warm", "累计调制 5 杯", "bronze", 5, (s) => s.pours),
  b("vol_10", "volume", "小试身手", "Warmed Up", "累计调制 10 杯", "bronze", 10, (s) => s.pours),
  b("vol_25", "volume", "熟能生巧", "Practised", "累计调制 25 杯", "silver", 25, (s) => s.pours),
  b("vol_50", "volume", "半百之酿", "Half-Century", "累计调制 50 杯", "silver", 50, (s) => s.pours),
  b("vol_100", "volume", "百杯不醉", "Centurion", "累计调制 100 杯", "gold", 100, (s) => s.pours),
  b("vol_200", "volume", "酒过两百", "Double Ton", "累计调制 200 杯", "gold", 200, (s) => s.pours),
  b("vol_350", "volume", "三百半醉", "Three Hundred", "累计调制 350 杯", "gold", 350, (s) => s.pours),
  b("vol_500", "volume", "五百佳酿", "Five Hundred", "累计调制 500 杯", "legend", 500, (s) => s.pours),
  b("vol_1000", "volume", "千杯不倒", "Unshakable", "累计调制 1000 杯", "legend", 1000, (s) => s.pours),

  // ── 纯饮 (6) ──
  b("pure_1", "pure", "纯饮初心", "Neat Start", "完成 1 杯纯饮", "bronze", 1, (s) => s.pure),
  b("pure_10", "pure", "独饮者", "The Solitary Sip", "完成 10 杯纯饮", "silver", 10, (s) => s.pure),
  b("pure_30", "pure", "纯饮行家", "Connoisseur", "完成 30 杯纯饮", "silver", 30, (s) => s.pure),
  b("pure_50", "pure", "纯饮老饕", "Pure Gourmand", "完成 50 杯纯饮", "gold", 50, (s) => s.pure),
  b("pure_75", "pure", "纯饮宗师", "Pure Master", "完成 75 杯纯饮", "gold", 75, (s) => s.pure),
  b("pure_120", "pure", "纯饮传奇", "Pure Legend", "完成 120 杯纯饮", "legend", 120, (s) => s.pure),

  // ── 酒谱 (6) ──
  b("mix_1", "mixology", "照本调酒", "By the Book", "复刻 1 杯经典", "bronze", 1, (s) => s.mixology),
  b("mix_10", "mixology", "酒谱学徒", "Codex Apprentice", "复刻 10 杯经典", "silver", 10, (s) => s.mixology),
  b("mix_30", "mixology", "配方行家", "Recipe Adept", "复刻 30 杯经典", "silver", 30, (s) => s.mixology),
  b("mix_50", "mixology", "配方大师", "Recipe Master", "复刻 50 杯经典", "gold", 50, (s) => s.mixology),
  b("mix_75", "mixology", "经典守护者", "Keeper of Classics", "复刻 75 杯经典", "gold", 75, (s) => s.mixology),
  b("mix_120", "mixology", "酒谱传奇", "Codex Legend", "复刻 120 杯经典", "legend", 120, (s) => s.mixology),

  // ── 心事 (6) ──
  b("mood_1", "mood", "初诉心事", "First Whisper", "倾诉 1 次心情", "bronze", 1, (s) => s.mood),
  b("mood_10", "mood", "情绪调香", "Mood Alchemist", "倾诉 10 次心情", "silver", 10, (s) => s.mood),
  b("mood_30", "mood", "心事收集者", "Heart Collector", "倾诉 30 次心情", "silver", 30, (s) => s.mood),
  b("mood_50", "mood", "心绪导师", "Mood Mentor", "倾诉 50 次心情", "gold", 50, (s) => s.mood),
  b("mood_75", "mood", "共情大师", "The Empath", "倾诉 75 次心情", "gold", 75, (s) => s.mood),
  b("mood_120", "mood", "情绪传奇", "Empath Legend", "倾诉 120 次心情", "legend", 120, (s) => s.mood),

  // ── 魔法 (6) ──
  b("zen_1", "zen", "初探魔法", "First Spark", "自由调配 1 次", "bronze", 1, (s) => s.zen),
  b("zen_10", "zen", "自由调配", "Free Mixer", "自由调配 10 次", "silver", 10, (s) => s.zen),
  b("zen_30", "zen", "炼金行家", "Alchemy Adept", "自由调配 30 次", "silver", 30, (s) => s.zen),
  b("zen_50", "zen", "炼金大师", "Alchemy Master", "自由调配 50 次", "gold", 50, (s) => s.zen),
  b("zen_75", "zen", "炼金宗师", "Grand Alchemist", "自由调配 75 次", "gold", 75, (s) => s.zen),
  b("zen_120", "zen", "炼金传奇", "Alchemy Legend", "自由调配 120 次", "legend", 120, (s) => s.zen),

  // ── 杯具 (6) ──
  b("glass_1", "glass", "第一只杯", "First Glass", "使用 1 种杯型", "bronze", 1, (s) => s.glasses),
  b("glass_5", "glass", "杯型收藏", "Collector", "使用 5 种杯型", "bronze", 5, (s) => s.glasses),
  b("glass_10", "glass", "玻璃陈列柜", "Cabinet", "使用 10 种杯型", "silver", 10, (s) => s.glasses),
  b("glass_15", "glass", "杯具珍藏", "Curated Glass", "使用 15 种杯型", "silver", 15, (s) => s.glasses),
  b("glass_20", "glass", "杯具行家", "Glassware Adept", "使用 20 种杯型", "gold", 20, (s) => s.glasses),
  b("glass_all", "glass", "全套杯具", "The Full Cabinet", "使用全部杯型", "legend", GLASS_COUNT, (s) => s.glasses),

  // ── 色谱 (6) ──
  b("color_1", "color", "第一抹色", "First Hue", "调出 1 种色系", "bronze", 1, (s) => s.families),
  b("color_5", "color", "调色板", "Palette", "调出 5 种色系", "silver", 5, (s) => s.families),
  b("color_8", "color", "斑斓", "Vivid", "调出 8 种色系", "silver", 8, (s) => s.families),
  b("color_10", "color", "色谱探索", "Spectrum Seeker", "调出 10 种色系", "gold", 10, (s) => s.families),
  b("color_15", "color", "风味光谱", "Full Spectrum", "调出 15 种色系", "gold", 15, (s) => s.families),
  b("color_20", "color", "万色之主", "Prism Lord", "调出 20 种色系", "legend", 20, (s) => s.families),

  // ── 冰 (3) ──
  b("ice_2", "ice", "冰之初识", "On the Rocks", "尝试 2 种冰型", "bronze", 2, (s) => s.ices),
  b("ice_4", "ice", "冰型玩家", "Ice Enthusiast", "尝试 4 种冰型", "silver", 4, (s) => s.ices),
  b("ice_6", "ice", "万冰归一", "Master of Ice", "尝试全部 6 种冰型", "gold", 6, (s) => s.ices),

  // ── 原料 (6) ──
  b("flavor_5", "flavor", "风味入门", "Tasting Notes", "接触 5 种原料", "bronze", 5, (s) => s.ingredients),
  b("flavor_15", "flavor", "风味猎手", "Flavour Hunter", "接触 15 种原料", "silver", 15, (s) => s.ingredients),
  b("flavor_30", "flavor", "风味老饕", "Flavour Gourmand", "接触 30 种原料", "silver", 30, (s) => s.ingredients),
  b("flavor_40", "flavor", "风味博物", "Flavour Curator", "接触 40 种原料", "gold", 40, (s) => s.ingredients),
  b("flavor_70", "flavor", "风味学者", "Flavour Scholar", "接触 70 种原料", "gold", 70, (s) => s.ingredients),
  b("flavor_100", "flavor", "风味百科", "Encyclopedia", "接触 100 种原料", "legend", 100, (s) => s.ingredients),

  // ── 典藏 (6) ──
  b("journal_5", "journal", "微醺收藏", "Curator", "日记封存 5 段", "bronze", 5, (s) => s.journal),
  b("journal_10", "journal", "小有典藏", "Keepsakes", "日记封存 10 段", "bronze", 10, (s) => s.journal),
  b("journal_15", "journal", "记忆酿造", "Memory Keeper", "日记封存 15 段", "silver", 15, (s) => s.journal),
  b("journal_30", "journal", "流体编年", "Chronicler", "日记封存 30 段", "gold", 30, (s) => s.journal),
  b("journal_45", "journal", "编年史官", "Annalist", "日记封存 45 段", "gold", 45, (s) => s.journal),
  b("journal_60", "journal", "微醺典藏", "The Archive", "日记封存 60 段", "legend", 60, (s) => s.journal),

  // ── 秘方 (3) ──
  b("secret_1", "secret", "秘方猎人", "Secret Hunter", "解锁 1 个隐藏配方", "silver", 1, (s) => s.unlocked),
  b("secret_2", "secret", "双重秘藏", "Double Secret", "解锁 2 个隐藏配方", "gold", 2, (s) => s.unlocked),
  b("secret_all", "secret", "秘方全集", "All Secrets", "解锁全部隐藏配方", "legend", 4, (s) => s.unlocked),

  // ── 分享 (3) ──
  b("share_1", "social", "初次分享", "First Share", "分享 1 次作品", "bronze", 1, (s) => s.shares),
  b("share_5", "social", "乐于分享", "Sharing Spirit", "分享 5 次作品", "silver", 5, (s) => s.shares),
  b("share_20", "social", "微醺传播者", "Evangelist", "分享 20 次作品", "gold", 20, (s) => s.shares),

  // ── 段位 (6) ──
  b("rank_junior", "rank", "崭露头角", "Rising Talent", "晋升至初级调酒师", "silver", 3, (s) => s.rankIndex),
  b("rank_architect", "rank", "风味架构师", "Flavor Architect", "晋升至风味架构师", "gold", 5, (s) => s.rankIndex),
  b("rank_senior", "rank", "资深调酒师", "Senior Mixologist", "晋升至资深调酒师", "gold", 7, (s) => s.rankIndex),
  b("rank_maestro", "rank", "鸡尾酒大师", "Cocktail Maestro", "晋升至鸡尾酒大师", "gold", 8, (s) => s.rankIndex),
  b("rank_master", "rank", "首席调酒师", "Master Mixologist", "晋升至首席调酒师", "legend", 9, (s) => s.rankIndex),
  b("rank_poet", "rank", "液体诗人", "Liquid Poet", "登顶液体诗人", "legend", 11, (s) => s.rankIndex),

  // ── 趣味 (6) ──
  b("fun_balanced", "fun", "雨露均沾", "Well-Rounded", "四种模式各达 10 杯", "gold", 10, (s) => Math.min(s.pure, s.mixology, s.mood, s.zen)),
  b("fun_balanced25", "fun", "样样精通", "Jack of All", "四种模式各达 25 杯", "legend", 25, (s) => Math.min(s.pure, s.mixology, s.mood, s.zen)),
  b("fun_xp5k", "fun", "初入佳境", "Five-K Sips", "累计经验达 5000", "silver", 5000, (s) => s.xp),
  b("fun_xp10k", "fun", "万分微醺", "Ten-Thousand Sips", "累计经验达 10000", "silver", 10000, (s) => s.xp),
  b("fun_xp30k", "fun", "三万真意", "Deep in the Cups", "累计经验达 30000", "gold", 30000, (s) => s.xp),
  b("fun_xp50k", "fun", "夜的尽头", "End of the Night", "累计经验达 50000", "legend", 50000, (s) => s.xp),
];

export const BADGE_COUNT = BADGES.length;

export interface BadgeView {
  id: string;
  group: string;
  name: string;
  nameEn: string;
  hint: string;
  tier: Tier;
  tierColor: string;
  xp: number;
  goal: number;
  cur: number;
  done: boolean;
  progress: number; // 0..1
}

/** Evaluate every badge against a stat snapshot → view models (clamped). */
export function evaluateBadges(stats: AchStat): BadgeView[] {
  return BADGES.map((badge) => {
    const cur = Math.max(0, Math.min(badge.goal, Math.round(badge.cur(stats))));
    const done = cur >= badge.goal;
    return {
      id: badge.id,
      group: badge.group,
      name: badge.name,
      nameEn: badge.nameEn,
      hint: badge.hint,
      tier: badge.tier,
      tierColor: TIER_COLOR[badge.tier],
      xp: TIER_XP[badge.tier],
      goal: badge.goal,
      cur,
      done,
      progress: badge.goal ? cur / badge.goal : done ? 1 : 0,
    };
  });
}

/** Ids of every badge currently satisfied — used by the store to award XP once. */
export function unlockedBadgeIds(stats: AchStat): string[] {
  return BADGES.filter((badge) => badge.cur(stats) >= badge.goal).map((x) => x.id);
}
