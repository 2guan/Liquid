/**
 * Mood Pour — preset emotional seeds. Each tag tilts the AI generator toward a
 * spirit family + colour, so the offline generator stays evocative and on-theme.
 */
import type { SpiritFamily } from "../tokens";

export interface MoodSeed {
  tag: string;
  label: string;
  family: SpiritFamily;
  keywords: string[];
}

export const MOOD_SEEDS: MoodSeed[] = [
  { tag: "melancholy", label: "深夜的惆怅", family: "whiskyPeat", keywords: ["孤独", "雨", "回忆", "烟"] },
  { tag: "joy", label: "雀跃与轻盈", family: "gin", keywords: ["阳光", "柑橘", "气泡", "微风"] },
  { tag: "nostalgia", label: "旧时光", family: "brandy", keywords: ["木质", "信件", "黄昏", "唱片"] },
  { tag: "passion", label: "炽热的悸动", family: "campari", keywords: ["红色", "心跳", "热烈", "夜色"] },
  { tag: "calm", label: "宁静致远", family: "absinthe", keywords: ["森林", "薄荷", "呼吸", "草木"] },
  { tag: "celebration", label: "值得庆祝", family: "tequila", keywords: ["烟花", "盛宴", "金色", "欢聚"] },
  { tag: "longing", label: "遥远的思念", family: "vermouth", keywords: ["海", "信号", "距离", "暮色"] },
  { tag: "courage", label: "孤勇前行", family: "whisky", keywords: ["篝火", "山岭", "坚定", "远征"] },
];

/** A few example prompts shown as hints in the input field. */
export const MOOD_PROMPTS = [
  "今天加班到深夜，疲惫却带着一点成就感",
  "想念一个很久没联系的老朋友",
  "雨后的傍晚，空气里有泥土和青草的味道",
  "刚刚完成了一件酝酿很久的事",
  "一个人旅行，站在陌生城市的天台上",
];
