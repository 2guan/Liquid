"use client";

import { create } from "zustand";
import type { ModeId } from "@/types";

export type View = "home" | "library" | "journal" | "result" | "achievements" | "settings" | ModeId;

interface NavState {
  view: View;
  /** the view we came from (top of the history stack) — kept for callers that
   *  need to know the previous screen (e.g. Result hides Save when from Journal) */
  origin: View;
  /** back-stack of previously-visited views (does NOT include the current one) */
  history: View[];
  /** a spirit id handed from the Library to Pure Pour to preselect a base */
  pureSeed: string | null;
  /** navigate forward to a view, remembering where we came from */
  go: (view: View) => void;
  /** open a mode, remembering where we came from */
  enterMode: (mode: ModeId) => void;
  /** jump into Pure Pour with a base spirit already chosen */
  enterPureWith: (spiritId: string) => void;
  consumePureSeed: () => void;
  showResult: () => void;
  /** go back to the previous view (or home when the stack is empty) */
  back: () => void;
  /** reset to home, clearing the back-stack */
  home: () => void;
}

/** push the current view onto the stack and move to `view`. */
function push(view: View) {
  return (s: NavState) =>
    view === s.view ? {} : { history: [...s.history, s.view], origin: s.view, view };
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  origin: "home",
  history: [],
  pureSeed: null,
  go: (view) => set(push(view)),
  enterMode: (mode) => set(push(mode)),
  enterPureWith: (spiritId) => set((s) => ({ history: [...s.history, s.view], origin: s.view, view: "pure", pureSeed: spiritId })),
  consumePureSeed: () => set({ pureSeed: null }),
  showResult: () => set(push("result")),
  back: () =>
    set((s) => {
      if (!s.history.length) return { view: "home", origin: "home" };
      const history = s.history.slice(0, -1);
      const view = s.history[s.history.length - 1];
      const origin = history.length ? history[history.length - 1] : "home";
      return { history, view, origin };
    }),
  home: () => set({ view: "home", origin: "home", history: [] }),
}));
