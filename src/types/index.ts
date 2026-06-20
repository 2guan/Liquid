/**
 * Domain model for The Sip & Sigh.
 * The product is "UI = f(state, AI_output)" — these types are the contract
 * between the state machines, the AI layer and the pure render components.
 */

import type { SpiritFamily } from "@/lib/tokens";

/** A glass id from the glassware cabinet (src/lib/data/glasses.ts). */
export type GlassType = string;

export type IceType = "none" | "sphere" | "cube" | "crushed";

export type LiquidState = "still" | "pouring" | "swirling" | "chilled";

export type ModeId = "pure" | "mixology" | "mood" | "zen";

export type RankId = "barback" | "apprentice" | "architect" | "master";

export interface Spirit {
  id: string;
  name: string; // 中文
  nameEn: string;
  category: string; // SpiritCategory id (src/lib/data/spirits.ts)
  family: SpiritFamily; // maps to liquidRamp
  abv: number;
  origin: string;
  note: string; // short tasting hook
  /** richer aromatic descriptors used by the AI flavour-graph */
  flavor: string[];
}

export interface Ingredient {
  name: string;
  nameEn?: string;
  amount: string; // human readable, e.g. "60ml", "1 dash"
  parts?: number; // for ratio visualisation
  family?: SpiritFamily;
}

export type RecipeCategory = "golden" | "prohibition" | "tiki" | "modern" | "zero";

export interface Recipe {
  id: string;
  name: string;
  nameEn: string;
  category: RecipeCategory;
  glass: GlassType;
  ice: IceType;
  family: SpiritFamily; // dominant colour family
  difficulty: 1 | 2 | 3;
  ingredients: Ingredient[];
  tasting: string;
  /** optional — the result page composes one when absent */
  story?: string;
  steps?: string[];
  /** true for the zero-proof category */
  alcoholFree?: boolean;
}

/** The canonical AI output structure (product_spec §4.2). */
export interface CocktailResult {
  name: string;
  nameEn: string;
  ingredients: Ingredient[];
  ratio: number[];
  glass: GlassType;
  ice: IceType;
  family: SpiritFamily;
  taste_profile: string;
  story: string;
  emotion_mapping: string;
  /** true when a hidden / signature recipe was unlocked */
  hidden?: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  titleEn: string;
  mode: ModeId;
  drink: string;
  glass: GlassType;
  ice: IceType;
  family: SpiritFamily;
  recipe: Ingredient[];
  tasting_notes: string;
  ai_poem: string;
  createdAt: number;
  hidden?: boolean;
}

export interface MoodInput {
  text: string;
  tags: string[];
}

/** A flavour ingredient the player has placed on the Zen canvas. */
export interface FlavorPick {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  color: string;
  flavor: string[];
  family?: SpiritFamily;
}

/** A node in the Zen Atelier free-mix flavour graph. */
export interface ZenNode {
  id: string;
  /** id into the flavour library (src/lib/data/flavors.ts) */
  flavorId: string;
  x: number; // 0..1 normalised canvas coords
  y: number;
}

export interface ZenEdge {
  from: string;
  to: string;
}
