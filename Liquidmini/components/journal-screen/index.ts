/** Liquid Journal — saved tasting cards. Ported from JournalScreen.tsx. */
import type { CocktailResult, JournalEntry } from "../../lib/types";
import { modeById } from "../../lib/data/catalog";
import { servedFill } from "../../lib/data/glasses";
import { isFizzy } from "../../lib/tokens";
import { garnishesFor } from "../../lib/data/garnish";
import { sceneForFamily } from "../../lib/config";
import { store } from "../../lib/store";

function entryToResult(e: JournalEntry): CocktailResult {
  return {
    name: e.title,
    nameEn: e.titleEn,
    ingredients: e.recipe,
    ratio: e.recipe.map((i) => i.parts || 1),
    glass: e.glass,
    ice: e.ice,
    family: e.family,
    taste_profile: e.tasting_notes,
    story: e.ai_poem,
    emotion_mapping: "",
    liquidColor: e.liquidColor,
    fillLevel: e.fillLevel,
    hidden: e.hidden,
    layers: e.layers,
    steps: e.steps,
    iceSeed: e.iceSeed || e.createdAt,
  };
}

const PAD = (n: number) => (n < 10 ? `0${n}` : `${n}`);
function fmtDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${PAD(d.getHours())}:${PAD(d.getMinutes())}`;
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    count: 0,
    cards: [] as any[],
  },

  _unsub: null as null | (() => void),

  lifetimes: {
    attached() {
      this._unsub = store.subscribe((s) => this.rebuild(s.journal));
    },
    detached() {
      if (this._unsub) this._unsub();
    },
  },

  methods: {
    rebuild(journal: JournalEntry[]) {
      const cards = journal.map((e) => ({
        id: e.id,
        title: e.title,
        titleEn: e.titleEn,
        modeName: modeById(e.mode).name,
        poem: e.ai_poem.replace(/\n[\s\S]*$/, ""),
        date: fmtDate(e.createdAt),
        hidden: !!e.hidden,
        scene: sceneForFamily(e.family),
        glass: e.glass,
        family: e.family,
        liquidColor: e.liquidColor || "",
        ice: e.ice,
        iceSeed: e.iceSeed || e.createdAt,
        fill: e.fillLevel != null ? e.fillLevel : servedFill(e.glass),
        fizzy: isFizzy(e.recipe),
        garnishes: garnishesFor(e.recipe),
        layers: e.layers || [],
      }));
      this.setData({ cards, count: journal.length });
    },
    open(e: any) {
      const id = e.currentTarget.dataset.id;
      const entry = store.get().journal.find((j) => j.id === id);
      if (!entry) return;
      store.setLastResult(entryToResult(entry), entry.mode);
      store.showResult();
    },
    remove(e: any) {
      const id = e.currentTarget.dataset.id;
      store.removeFromJournal(id);
    },
    goHome() {
      store.home();
    },
  },
});
