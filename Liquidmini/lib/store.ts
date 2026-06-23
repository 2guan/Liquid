/**
 * A tiny global state manager standing in for Zustand. Pages/components
 * subscribe and re-render (via setData) on change; durable user data is mirrored
 * to wx storage. Combines the web build's useNav + useAtelier into one store
 * since the mini-program is a single dynamic page.
 */

import type { CocktailResult, JournalEntry, ModeId } from "./types";
import { rankForXp, type RankMeta } from "./data/catalog";

export type View =
  | "home"
  | "library"
  | "journal"
  | "result"
  | "achievements"
  | "settings"
  | ModeId;

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
}

const STORAGE_KEY = "liquid-atelier";
const PERSIST_KEYS: (keyof AtelierState)[] = [
  "xp",
  "journal",
  "soundOn",
  "pours",
  "unlocked",
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
  xp: 640, // start the player part-way to Flavor Architect, as in the concept art
  journal: [],
  lastResult: null,
  soundOn: false,
  pours: 0,
  unlocked: [],
};

let state: AtelierState = { ...defaults, ...loadPersisted() };
const listeners = new Set<Listener>();

let idCounter = 0;
const makeId = () =>
  `j_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

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
  },
  rank(): { meta: RankMeta; next?: RankMeta; progress: number } {
    return rankForXp(state.xp);
  },

  // ── journal ──
  saveToJournal(entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry {
    const full: JournalEntry = { ...entry, id: makeId(), createdAt: Date.now() };
    set({ journal: [full, ...state.journal] });
    return full;
  },
  removeFromJournal(id: string) {
    set({ journal: state.journal.filter((e) => e.id !== id) });
  },

  // ── result carry-over ──
  setLastResult(result: CocktailResult, mode: ModeId) {
    set({ lastResult: { result, mode } });
  },

  // ── preferences ──
  toggleSound() {
    set({ soundOn: !state.soundOn });
  },

  // ── stats ──
  recordPour() {
    set({ pours: state.pours + 1 });
  },
  recordUnlock(name: string) {
    if (state.unlocked.includes(name)) return;
    set({ unlocked: [...state.unlocked, name] });
  },
};
