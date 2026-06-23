/** The Liquid Codex — recipe → ratio → timing → result. Ported from MixologyScreen.tsx. */
import type { Recipe } from "../../lib/types";
import { RECIPE_CATEGORIES, RECIPE_COUNT, recipesByCategory, searchRecipes } from "../../lib/data/recipes";
import { cocktailAI } from "../../lib/ai/cocktailAI";
import { isFizzy } from "../../lib/tokens";
import { garnishesFor } from "../../lib/data/garnish";
import { servedFill } from "../../lib/data/glasses";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";

const STEPS = [
  { key: "recipe", label: "选择配方" },
  { key: "ratio", label: "配比层叠" },
  { key: "timing", label: "手法定时" },
];
const VEIL_LINES = ["正在聆听你的心绪…", "调酒师在挑选基酒…", "诗人在斟酌词句…", "化学家在校准风味…"];

function recipeTile(r: Recipe) {
  return {
    id: r.id, name: r.name, nameEn: r.nameEn,
    glass: r.glass, family: r.family, ice: r.ice,
    fill: servedFill(r.glass), fizzy: isFizzy(r.ingredients), garnishes: garnishesFor(r.ingredients),
    diff: [r.difficulty >= 1, r.difficulty >= 2, r.difficulty >= 3],
    alcoholFree: !!r.alcoholFree, tasting: r.tasting,
  };
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    step: "recipe" as string,
    stepIndex: 0,
    steps: STEPS,
    count: RECIPE_COUNT,
    cats: RECIPE_CATEGORIES.map((c) => ({ id: c.id, name: c.name, nameEn: c.nameEn, accent: c.accent })),
    category: "whisky",
    query: "",
    recipeList: [] as any[],
    recipe: null as null | Recipe,
    rGlass: "rocks", rFamily: "whisky", rIce: "none", rName: "", rNameEn: "",
    showHint: true,
    ratioItems: [] as any[],
    pours: [] as number[],
    ratioAccuracyPct: 0,
    fillLevel: 0,
    fizzy: false,
    garnishes: [] as any[],
    markerPct: 50,
    timingQuality: -1,
    timingMsg: "",
    timingScorePct: 0,
    actionLabel: "停！",
    busy: false,
    veilLine: "",
  },

  _timing: null as null | number,
  _veil: null as null | number,
  _marker: 0,
  _dir: 1,

  lifetimes: {
    attached() { this.refresh(); },
    detached() {
      if (this._timing) clearInterval(this._timing);
      if (this._veil) clearInterval(this._veil);
    },
  },

  methods: {
    refresh() {
      const q = this.data.query.trim();
      const list = (q ? searchRecipes(q) : recipesByCategory(this.data.category as any)).map(recipeTile);
      this.setData({ recipeList: list });
    },
    onQuery(e: any) { this.setData({ query: e.detail.value }, () => this.refresh()); },
    clearQuery() { this.setData({ query: "" }, () => this.refresh()); },
    pickCat(e: any) { this.setData({ category: e.currentTarget.dataset.id }, () => this.refresh()); },

    pickRecipe(e: any) {
      const id = e.currentTarget.dataset.id;
      const pool = this.data.query.trim() ? searchRecipes(this.data.query) : recipesByCategory(this.data.category as any);
      const r = pool.find((x) => x.id === id);
      if (!r) return;
      sound.play("click");
      const pours = r.ingredients.map(() => 0);
      this.setData({
        recipe: r,
        rGlass: r.glass, rFamily: r.family, rIce: r.ice, rName: r.name, rNameEn: r.nameEn,
        fizzy: isFizzy(r.ingredients), garnishes: garnishesFor(r.ingredients),
        pours, step: "ratio", stepIndex: 1,
      });
      this.computeRatio();
    },

    toggleHint() { this.setData({ showHint: !this.data.showHint }); },

    onSlider(e: any) {
      const idx = Number(e.currentTarget.dataset.idx);
      const v = e.detail.value;
      const pours = this.data.pours.slice();
      pours[idx] = v;
      this.setData({ pours }, () => this.computeRatio());
    },

    computeRatio() {
      const r = this.data.recipe;
      if (!r) return;
      const pours = this.data.pours;
      let err = 0, n = 0, totalTarget = 0;
      const items = r.ingredients.map((ing, idx) => {
        const target = ing.parts || 0;
        const editable = target > 0;
        totalTarget += target;
        if (editable) {
          err += Math.min(1, Math.abs((pours[idx] || 0) - target) / Math.max(1, target));
          n++;
        }
        return { name: ing.name, amount: ing.amount, editable, target, max: target * 2, value: pours[idx] || 0 };
      });
      const accuracy = n ? Math.max(0, 1 - err / n) : 0;
      const totalPour = pours.reduce((a, b) => a + b, 0);
      const fillLevel = Math.min(0.9, totalPour / Math.max(1, totalTarget * 1.3));
      this.setData({ ratioItems: items, ratioAccuracyPct: Math.round(accuracy * 100), fillLevel });
    },

    prevStep() {
      const i = Math.max(0, this.data.stepIndex - 1);
      sound.play("click");
      this.stopTiming();
      this.setData({ step: STEPS[i].key, stepIndex: i });
    },
    goTiming() {
      sound.play("click");
      this.setData({ step: "timing", stepIndex: 2, timingQuality: -1, actionLabel: this.data.rIce === "none" ? "摇匀！" : "停！" });
      this.startTiming();
    },

    startTiming() {
      this.stopTiming();
      this._marker = 0; this._dir = 1;
      const SPEED = 0.42; const dt = 0.03;
      this._timing = setInterval(() => {
        this._marker += this._dir * SPEED * dt;
        if (this._marker >= 1) { this._marker = 1; this._dir = -1; }
        else if (this._marker <= 0) { this._marker = 0; this._dir = 1; }
        this.setData({ markerPct: Math.round(this._marker * 100) });
      }, 30) as unknown as number;
    },
    stopTiming() {
      if (this._timing) { clearInterval(this._timing); this._timing = null; }
    },
    lockTiming() {
      this.stopTiming();
      const q = Math.max(0, 1 - Math.abs(this._marker - 0.5) / 0.5);
      sound.play(this.data.rIce === "none" ? "shake" : "ice");
      this.setData({
        timingQuality: q,
        timingScorePct: Math.round(q * 100),
        timingMsg: q > 0.8 ? "手法精湛 ✦" : q > 0.5 ? "稳健的一手" : "稍有偏差",
      });
    },

    async finish() {
      const r = this.data.recipe;
      if (!r || this.data.busy) return;
      const accuracy = (this.data.ratioAccuracyPct / 100) * 0.6 + (this.data.timingQuality < 0 ? 0 : this.data.timingQuality) * 0.4;
      const success = accuracy >= 0.7;
      this.setData({ busy: true, veilLine: VEIL_LINES[0] });
      sound.play("success");
      store.addXp(success ? 60 : 30);
      store.recordPour();
      let l = 0;
      this._veil = setInterval(() => { l = (l + 1) % VEIL_LINES.length; this.setData({ veilLine: VEIL_LINES[l] }); }, 900) as unknown as number;
      const result = await cocktailAI.describeMix(r, success, accuracy);
      if (this._veil) { clearInterval(this._veil); this._veil = null; }
      this.setData({ busy: false });
      store.setLastResult(result, "mixology");
      store.showResult();
    },
  },
});
