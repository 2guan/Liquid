/**
 * A tiny global state manager standing in for Zustand. Pages/components
 * subscribe and re-render (via setData) on change; durable user data is mirrored
 * to wx storage. Combines the web build's useNav + useAtelier into one store
 * since the mini-program is a single dynamic page.
 */

import type { CocktailResult, JournalEntry, ModeId } from "./types";
import { rankForXp, type RankMeta } from "./data/catalog";
import { statsFrom, unlockedBadgeIds, BADGES, xpOf, type AchSource } from "./data/achievements";

export type View =
  | "home"
  | "library"
  | "journal"
  | "result"
  | "achievements"
  | "settings"
  | ModeId;

interface ModeCounts {
  pure: number;
  mixology: number;
  mood: number;
  zen: number;
}

export interface AtelierState {
  // ── routing ──
  view: View;
  origin: View;
  pureSeed: string | null;

  // ── progression ──
  xp: number;

  // ── liquid journal ──
  journal: JournalEntry[];

  // ── result carry-over (the last drink produced by any mode) ──
  lastResult: { result: CocktailResult; mode: ModeId } | null;

  // ── preferences ──
  soundOn: boolean;

  // ── stats for achievements ──
  pours: number;
  unlocked: string[];
  modes: ModeCounts;
  glassesUsed: string[];
  familiesUsed: string[];
  icesUsed: string[];
  ingredientsUsed: string[];
  shares: number;
  awardedBadges: string[];

  // ── share (transient): the result page pre-renders a 酒名+酒杯 thumbnail
  // and the page reads these in onShareAppMessage / onShareTimeline ──
  shareImage: string;
  shareTitle: string;
}

const STORAGE_KEY = "liquid-atelier";
const PERSIST_KEYS: (keyof AtelierState)[] = [
  "xp",
  "journal",
  "soundOn",
  "pours",
  "unlocked",
  "modes",
  "glassesUsed",
  "familiesUsed",
  "icesUsed",
  "ingredientsUsed",
  "shares",
  "awardedBadges",
];

type Listener = (s: AtelierState) => void;

function loadPersisted(): Partial<AtelierState> {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === "object") return raw as Partial<AtelierState>;
  } catch (e) {
    /* storage unavailable — start fresh */
  }
  return {};
}

const defaults: AtelierState = {
  view: "home",
  origin: "home",
  pureSeed: null,
  xp: 200, // a fresh barback, just past the first sip
  journal: [],
  lastResult: null,
  soundOn: false,
  pours: 0,
  unlocked: [],
  modes: { pure: 0, mixology: 0, mood: 0, zen: 0 },
  glassesUsed: [],
  familiesUsed: [],
  icesUsed: [],
  ingredientsUsed: [],
  shares: 0,
  awardedBadges: [],
  shareImage: "",
  shareTitle: "",
};

const persisted = loadPersisted();
let state: AtelierState = {
  ...defaults,
  ...persisted,
  // backfill nested/array fields older blobs won't have
  modes: { ...defaults.modes, ...(persisted.modes || {}) },
  glassesUsed: persisted.glassesUsed || [],
  familiesUsed: persisted.familiesUsed || [],
  icesUsed: persisted.icesUsed || [],
  ingredientsUsed: persisted.ingredientsUsed || [],
  awardedBadges: persisted.awardedBadges || [],
};
const listeners = new Set<Listener>();

let idCounter = 0;
const makeId = () =>
  `j_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const uniq = (arr: string[], v: string | undefined): string[] =>
  !v || arr.indexOf(v) > -1 ? arr : [...arr, v];

function persist() {
  try {
    const slice: any = {};
    for (const k of PERSIST_KEYS) slice[k] = state[k];
    wx.setStorageSync(STORAGE_KEY, slice);
  } catch (e) {
    /* ignore quota / unavailable */
  }
}

function set(partial: Partial<AtelierState>) {
  state = { ...state, ...partial };
  persist();
  listeners.forEach((l) => l(state));
}

function source(): AchSource {
  return {
    xp: state.xp,
    pours: state.pours,
    journal: state.journal.length,
    unlocked: state.unlocked.length,
    modes: state.modes,
    glassesUsed: state.glassesUsed,
    familiesUsed: state.familiesUsed,
    icesUsed: state.icesUsed,
    ingredientsUsed: state.ingredientsUsed,
    shares: state.shares,
  };
}

/** Award XP for every newly-satisfied badge; cascades through rank badges. */
function syncAchievements() {
  for (let guard = 0; guard < BADGES.length + 2; guard++) {
    const ids = unlockedBadgeIds(statsFrom(source()));
    const fresh = ids.filter((id) => state.awardedBadges.indexOf(id) === -1);
    if (fresh.length === 0) break;
    const gain = fresh.reduce((sum, id) => {
      const def = BADGES.find((x) => x.id === id);
      return sum + (def ? xpOf(def) : 0);
    }, 0);
    set({ xp: state.xp + gain, awardedBadges: [...state.awardedBadges, ...fresh] });
  }
}

export const store = {
  /** current snapshot */
  get(): AtelierState {
    return state;
  },
  /** subscribe; returns an unsubscribe fn. Fires immediately with current. */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn(state);
    return () => {
      listeners.delete(fn);
    };
  },

  // ── routing ──
  go(view: View) {
    set({ view });
  },
  enterMode(mode: ModeId) {
    set({ view: mode, origin: "home" });
  },
  enterPureWith(spiritId: string) {
    set({ view: "pure", origin: "library", pureSeed: spiritId });
  },
  consumePureSeed() {
    set({ pureSeed: null });
  },
  showResult() {
    set({ origin: state.view, view: "result" });
  },
  home() {
    set({ view: "home", origin: "home" });
  },

  // ── progression ──
  addXp(n: number) {
    set({ xp: state.xp + n });
    syncAchievements();
  },
  rank(): { meta: RankMeta; next?: RankMeta; progress: number; index: number } {
    return rankForXp(state.xp);
  },

  // ── journal ──
  saveToJournal(entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry {
    const full: JournalEntry = { ...entry, id: makeId(), createdAt: Date.now() };
    set({ journal: [full, ...state.journal] });
    syncAchievements();
    return full;
  },
  removeFromJournal(id: string) {
    set({ journal: state.journal.filter((e) => e.id !== id) });
  },

  // ── result carry-over ──
  setLastResult(result: CocktailResult, mode: ModeId) {
    set({ lastResult: { result, mode }, shareImage: "", shareTitle: "" });
  },

  // ── share thumbnail (set by the result screen once rendered) ──
  setShare(image: string, title: string) {
    set({ shareImage: image, shareTitle: title });
  },

  // ── preferences ──
  toggleSound() {
    set({ soundOn: !state.soundOn });
  },

  // ── stats ──
  /** record a freshly-made drink (not a journal re-open): bumps every stat. */
  recordDrink(result: CocktailResult, mode: ModeId) {
    let ingredientsUsed = state.ingredientsUsed;
    const ings = result.ingredients || [];
    for (const ing of ings) ingredientsUsed = uniq(ingredientsUsed, ing.name);
    const modes = { ...state.modes, [mode]: state.modes[mode] + 1 };
    set({
      pours: state.pours + 1,
      modes,
      glassesUsed: uniq(state.glassesUsed, result.glass),
      familiesUsed: uniq(state.familiesUsed, result.family),
      icesUsed: uniq(state.icesUsed, result.ice),
      ingredientsUsed,
    });
    syncAchievements();
  },
  recordShare() {
    set({ shares: state.shares + 1 });
    syncAchievements();
  },
  recordUnlock(name: string) {
    if (state.unlocked.indexOf(name) > -1) return;
    set({ unlocked: [...state.unlocked, name] });
    syncAchievements();
  },
};
