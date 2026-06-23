import type { IceType, ModeId, RankId } from "../types";

// Glassware lives in its own (parametric) module; re-exported here so existing
// imports of `GLASSES` / `glassById` from catalog keep working.
export {
  GLASSES,
  glassById,
  GLASS_CATEGORIES,
  GLASS_COUNT,
  glassesByCategory,
  searchGlasses,
  type GlassMeta,
  type GlassCategory,
} from "./glasses";

/** Ice catalogue used by the Pure Pour ice step. */
export interface IceMeta {
  id: IceType;
  name: string;
  nameEn: string;
  note: string;
}

export const ICES: IceMeta[] = [
  { id: "none", name: "净饮", nameEn: "Neat", note: "不加冰，纯粹的原始风味" },
  {
    id: "sphere",
    name: "手工大冰球",
    nameEn: "Hand-carved Sphere",
    note: "融化最慢，缓释稀释，保留香气",
  },
  {
    id: "cube",
    name: "老式方冰",
    nameEn: "Big Cube",
    note: "经典冷却，沉稳厚重",
  },
  {
    id: "cubes",
    name: "小方冰",
    nameEn: "Cubes",
    note: "多颗小方冰填满杯身，冰镇迅速",
  },
  {
    id: "bullets",
    name: "子弹冰",
    nameEn: "Bullet Ice",
    note: "圆柱冰粒堆叠满杯，入口清脆",
  },
  {
    id: "crushed",
    name: "碎冰",
    nameEn: "Crushed",
    note: "迅速冰镇，霜雾缭绕",
  },
];

export const iceById = (id: IceType) =>
  ICES.find((i) => i.id === id) ?? ICES[0];

/** The four core experience modes. */
export interface ModeMeta {
  id: ModeId;
  name: string;
  nameEn: string;
  tagline: string;
  accent: string; // hex accent used in cards / glow
}

export const MODES: ModeMeta[] = [
  {
    id: "pure",
    name: "纯饮",
    nameEn: "The Pure Pour",
    tagline: "回归本味，\n感受酒的本真之美",
    accent: "#D89C3A",
  },
  {
    id: "mixology",
    name: "酒谱",
    nameEn: "The Liquid Codex",
    tagline: "调和经典，\n书写风味的秩序",
    accent: "#8FA45A",
  },
  {
    id: "mood",
    name: "心事",
    nameEn: "Whisper of Mood",
    tagline: "将心绪酿成一杯酒，\n灵感酒单，映照此刻心情",
    accent: "#7E8FB8",
  },
  {
    id: "zen",
    name: "魔法",
    nameEn: "The Alchemy Atelier",
    tagline: "在未知中调和世界，\n创造独属于你的魔法配方",
    accent: "#A57BC0",
  },
];

export const modeById = (id: ModeId) =>
  MODES.find((m) => m.id === id) ?? MODES[0];

/** Workshop rank ladder (gamification §5.1). */
export interface RankMeta {
  id: string;
  name: string;
  nameEn: string;
  minXp: number;
}

export const RANKS: RankMeta[] = [
  { id: "barback", name: "见习吧台", nameEn: "Barback", minXp: 0 },
  { id: "bar-assistant", name: "吧台助理", nameEn: "Bar Assistant", minXp: 200 },
  { id: "apprentice", name: "调酒学徒", nameEn: "Apprentice Mixologist", minXp: 600 },
  { id: "junior", name: "初级调酒师", nameEn: "Junior Bartender", minXp: 1400 },
  { id: "adept", name: "风味学徒", nameEn: "Flavor Adept", minXp: 2800 },
  { id: "architect", name: "风味架构师", nameEn: "Flavor Architect", minXp: 5000 },
  { id: "aromancer", name: "调香师", nameEn: "Aromancer", minXp: 8500 },
  { id: "senior", name: "资深调酒师", nameEn: "Senior Mixologist", minXp: 13000 },
  { id: "maestro", name: "鸡尾酒大师", nameEn: "Cocktail Maestro", minXp: 20000 },
  { id: "master", name: "首席调酒师", nameEn: "Master Mixologist", minXp: 30000 },
  { id: "grandmaster", name: "调酒宗师", nameEn: "Grandmaster", minXp: 45000 },
  { id: "poet", name: "液体诗人", nameEn: "Liquid Poet", minXp: 65000 },
];

export function rankForXp(xp: number): { meta: RankMeta; next?: RankMeta; progress: number; index: number } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].minXp) idx = i;
  const meta = RANKS[idx];
  const next = RANKS[idx + 1];
  const progress = next
    ? (xp - meta.minXp) / (next.minXp - meta.minXp)
    : 1;
  return { meta, next, progress: Math.min(1, Math.max(0, progress)), index: idx };
}
