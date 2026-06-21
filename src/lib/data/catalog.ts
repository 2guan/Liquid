import type { IceType, ModeId, RankId } from "@/types";

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
    tagline: "探索一杯纯粹的本味与材质之美",
    accent: "#D89C3A",
  },
  {
    id: "mixology",
    name: "酒谱",
    nameEn: "The Liquid Codex",
    tagline: "经典配方，精准配比，成就完美一杯",
    accent: "#9C5A33",
  },
  {
    id: "mood",
    name: "心事",
    nameEn: "Whisper of Mood",
    tagline: "输入你的心绪，交由灵感酝酿成酒",
    accent: "#C8A45D",
  },
  {
    id: "zen",
    name: "魔法",
    nameEn: "The Alchemy Atelier",
    tagline: "自由创造，探索无限风味的可能",
    accent: "#7E8C4E",
  },
];

export const modeById = (id: ModeId) =>
  MODES.find((m) => m.id === id) ?? MODES[0];

/** Workshop rank ladder (gamification §5.1). */
export interface RankMeta {
  id: RankId;
  name: string;
  nameEn: string;
  minXp: number;
}

export const RANKS: RankMeta[] = [
  { id: "barback", name: "见习吧台", nameEn: "Barback", minXp: 0 },
  { id: "apprentice", name: "调酒学徒", nameEn: "Apprentice Mixologist", minXp: 300 },
  { id: "architect", name: "风味架构师", nameEn: "Flavor Architect", minXp: 900 },
  { id: "master", name: "首席调酒师", nameEn: "Master Mixologist", minXp: 2000 },
];

export function rankForXp(xp: number): { meta: RankMeta; next?: RankMeta; progress: number } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].minXp) idx = i;
  const meta = RANKS[idx];
  const next = RANKS[idx + 1];
  const progress = next
    ? (xp - meta.minXp) / (next.minXp - meta.minXp)
    : 1;
  return { meta, next, progress: Math.min(1, Math.max(0, progress)) };
}
