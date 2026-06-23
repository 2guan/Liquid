"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CocktailResult, JournalEntry, ModeId } from "@/types";
import { rankForXp } from "@/lib/data/catalog";
import { statsFrom, unlockedBadgeIds, BADGES, xpOf, type AchSource } from "@/lib/data/achievements";

export type View = "home" | "library" | "journal" | ModeId;

interface ModeCounts {
  pure: number;
  mixology: number;
  mood: number;
  zen: number;
}

interface AtelierState {
  // ── progression ──
  xp: number;
  addXp: (n: number) => void;
  rank: () => ReturnType<typeof rankForXp>;

  // ── liquid journal ──
  journal: JournalEntry[];
  saveToJournal: (entry: Omit<JournalEntry, "id" | "createdAt">) => JournalEntry;
  removeFromJournal: (id: string) => void;

  // ── result carry-over (the last drink produced by any mode) ──
  lastResult: { result: CocktailResult; mode: ModeId } | null;
  setLastResult: (result: CocktailResult, mode: ModeId) => void;

  // ── preferences ──
  soundOn: boolean;
  toggleSound: () => void;

  // ── stats for achievements ──
  pours: number;
  unlocked: string[]; // hidden recipe ids/names discovered
  modes: ModeCounts;
  glassesUsed: string[];
  familiesUsed: string[];
  icesUsed: string[];
  ingredientsUsed: string[];
  shares: number;
  awardedBadges: string[];

  /** record a freshly-made drink (not a journal re-open): bumps every stat. */
  recordDrink: (result: CocktailResult, mode: ModeId) => void;
  recordShare: () => void;
  recordUnlock: (name: string) => void;
  /** evaluate badges, award XP for newly-unlocked ones (cascades through ranks). */
  syncAchievements: () => void;
}

let idCounter = 0;
const makeId = () => `j_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const uniq = (arr: string[], v: string | undefined): string[] =>
  !v || arr.includes(v) ? arr : [...arr, v];

export const useAtelier = create<AtelierState>()(
  persist(
    (set, get) => {
      /** Snapshot for the achievement engine. */
      const source = (s: AtelierState): AchSource => ({
        xp: s.xp,
        pours: s.pours,
        journal: s.journal.length,
        unlocked: s.unlocked.length,
        modes: s.modes,
        glassesUsed: s.glassesUsed,
        familiesUsed: s.familiesUsed,
        icesUsed: s.icesUsed,
        ingredientsUsed: s.ingredientsUsed,
        shares: s.shares,
      });

      return {
        xp: 200, // a fresh barback, just past the first sip
        addXp: (n) => {
          set((s) => ({ xp: s.xp + n }));
          get().syncAchievements();
        },
        rank: () => rankForXp(get().xp),

        journal: [],
        saveToJournal: (entry) => {
          const full: JournalEntry = { ...entry, id: makeId(), createdAt: Date.now() };
          set((s) => ({ journal: [full, ...s.journal] }));
          get().syncAchievements();
          return full;
        },
        removeFromJournal: (id) =>
          set((s) => ({ journal: s.journal.filter((e) => e.id !== id) })),

        lastResult: null,
        setLastResult: (result, mode) => set({ lastResult: { result, mode } }),

        soundOn: false,
        toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

        pours: 0,
        unlocked: [],
        modes: { pure: 0, mixology: 0, mood: 0, zen: 0 },
        glassesUsed: [],
        familiesUsed: [],
        icesUsed: [],
        ingredientsUsed: [],
        shares: 0,
        awardedBadges: [],

        recordDrink: (result, mode) => {
          set((s) => {
            let ingredientsUsed = s.ingredientsUsed;
            for (const ing of result.ingredients ?? []) ingredientsUsed = uniq(ingredientsUsed, ing.name);
            return {
              pours: s.pours + 1,
              modes: { ...s.modes, [mode]: s.modes[mode] + 1 },
              glassesUsed: uniq(s.glassesUsed, result.glass),
              familiesUsed: uniq(s.familiesUsed, result.family),
              icesUsed: uniq(s.icesUsed, result.ice),
              ingredientsUsed,
            };
          });
          get().syncAchievements();
        },
        recordShare: () => {
          set((s) => ({ shares: s.shares + 1 }));
          get().syncAchievements();
        },
        recordUnlock: (name) => {
          set((s) => ({
            unlocked: s.unlocked.includes(name) ? s.unlocked : [...s.unlocked, name],
          }));
          get().syncAchievements();
        },

        syncAchievements: () => {
          // Award XP for every newly-satisfied badge; granting XP can raise the
          // rank and satisfy rank badges, so loop until it settles.
          for (let guard = 0; guard < BADGES.length + 2; guard++) {
            const s = get();
            const ids = unlockedBadgeIds(statsFrom(source(s)));
            const fresh = ids.filter((id) => !s.awardedBadges.includes(id));
            if (fresh.length === 0) break;
            const gain = fresh.reduce((sum, id) => {
              const def = BADGES.find((x) => x.id === id);
              return sum + (def ? xpOf(def) : 0);
            }, 0);
            set({ xp: s.xp + gain, awardedBadges: [...s.awardedBadges, ...fresh] });
          }
        },
      };
    },
    {
      name: "liquid-atelier",
      // Only persist durable user data, not transient UI/result state.
      partialize: (s) => ({
        xp: s.xp,
        journal: s.journal,
        soundOn: s.soundOn,
        pours: s.pours,
        unlocked: s.unlocked,
        modes: s.modes,
        glassesUsed: s.glassesUsed,
        familiesUsed: s.familiesUsed,
        icesUsed: s.icesUsed,
        ingredientsUsed: s.ingredientsUsed,
        shares: s.shares,
        awardedBadges: s.awardedBadges,
      }),
      // older persisted blobs won't have the new fields — backfill on hydrate
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AtelierState>;
        return {
          ...current,
          ...p,
          modes: { pure: 0, mixology: 0, mood: 0, zen: 0, ...(p.modes ?? {}) },
          glassesUsed: p.glassesUsed ?? [],
          familiesUsed: p.familiesUsed ?? [],
          icesUsed: p.icesUsed ?? [],
          ingredientsUsed: p.ingredientsUsed ?? [],
          shares: p.shares ?? 0,
          awardedBadges: p.awardedBadges ?? [],
        } as AtelierState;
      },
    },
  ),
);
