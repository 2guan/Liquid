"use client";

import { create } from "zustand";
import type { ModeId } from "@/types";

export type View = "home" | "library" | "journal" | "result" | "achievements" | "settings" | ModeId;

interface NavState {
  view: View;
  /** where to return to when leaving a transient screen like result */
  origin: View;
  /** a spirit id handed from the Library to Pure Pour to preselect a base */
  pureSeed: string | null;
  go: (view: View) => void;
  /** open a mode, remembering where we came from */
  enterMode: (mode: ModeId) => void;
  /** jump into Pure Pour with a base spirit already chosen */
  enterPureWith: (spiritId: string) => void;
  consumePureSeed: () => void;
  showResult: () => void;
  home: () => void;
}

export const useNav = create<NavState>((set, get) => ({
  view: "home",
  origin: "home",
  pureSeed: null,
  go: (view) => set({ view }),
  enterMode: (mode) => set({ view: mode, origin: "home" }),
  enterPureWith: (spiritId) => set({ view: "pure", origin: "library", pureSeed: spiritId }),
  consumePureSeed: () => set({ pureSeed: null }),
  showResult: () => set({ origin: get().view, view: "result" }),
  home: () => set({ view: "home", origin: "home" }),
}));
