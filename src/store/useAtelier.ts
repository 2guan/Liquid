"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CocktailResult, JournalEntry, ModeId } from "@/types";
import { rankForXp } from "@/lib/data/catalog";

export type View = "home" | "library" | "journal" | ModeId;

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
  recordPour: () => void;
  recordUnlock: (name: string) => void;
}

let idCounter = 0;
const makeId = () => `j_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

export const useAtelier = create<AtelierState>()(
  persist(
    (set, get) => ({
      xp: 640, // start the player part-way to Flavor Architect, as in the concept art
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      rank: () => rankForXp(get().xp),

      journal: [],
      saveToJournal: (entry) => {
        const full: JournalEntry = { ...entry, id: makeId(), createdAt: Date.now() };
        set((s) => ({ journal: [full, ...s.journal] }));
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
      recordPour: () => set((s) => ({ pours: s.pours + 1 })),
      recordUnlock: (name) =>
        set((s) => ({
          unlocked: s.unlocked.includes(name) ? s.unlocked : [...s.unlocked, name],
        })),
    }),
    {
      name: "liquid-atelier",
      // Only persist durable user data, not transient UI/result state.
      partialize: (s) => ({
        xp: s.xp,
        journal: s.journal,
        soundOn: s.soundOn,
        pours: s.pours,
        unlocked: s.unlocked,
      }),
    },
  ),
);
