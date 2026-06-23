/**
 * The Pure Pour — a 4-step machine: glass → spirit → hold-to-pour → ice → result.
 * Ported from src/components/screens/PurePourScreen.tsx. The long-press pour
 * ramps the fill with a timer (rAF isn't available in the logic layer).
 */
import type { GlassType, IceType, CocktailResult } from "../../lib/types";
import { ICES } from "../../lib/data/catalog";
import { GLASS_CATEGORIES, GLASS_COUNT, glassesByCategory, searchGlasses } from "../../lib/data/glasses";
import { SPIRIT_CATEGORIES, SPIRIT_COUNT, spiritById, spiritsByCategory, searchSpirits } from "../../lib/data/spirits";
import { iceSwatch } from "../../lib/svg/ice";
import { svgToDataUri } from "../../lib/svg/helpers";
import { cocktailAI } from "../../lib/ai/cocktailAI";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";

const STEPS = [
  { key: "glass", label: "选择杯型" },
  { key: "spirit", label: "倒入基酒" },
  { key: "pour", label: "斟酒" },
  { key: "ice", label: "选择冰型" },
];
const POUR_TARGET = 0.58;

function iceList() {
  return ICES.map((i) => ({ ...i, swatch: svgToDataUri(iceSwatch(i.id, 56)) }));
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    step: "glass" as string,
    stepIndex: 0,
    steps: STEPS,
    glassType: "rocks" as GlassType,
    spiritId: "",
    family: "whisky",
    fill: 0,
    pouring: false,
    ice: "none" as IceType,
    busy: false,
    glassCat: "tumbler",
    glassQuery: "",
    spiritCat: "whisky",
    spiritQuery: "",
    glassCount: GLASS_COUNT,
    spiritCount: SPIRIT_COUNT,
    glassCats: GLASS_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    spiritCats: SPIRIT_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    glassList: [] as any[],
    spiritList: [] as any[],
    ices: iceList(),
    pourPct: 0,
    pourMsg: "杯子还是空的",
    targetLeft: (POUR_TARGET - 0.12) * 100,
  },

  _timer: null as null | number,

  lifetimes: {
    attached() {
      this.refreshGlassList();
      this.refreshSpiritList();
      const seed = store.get().pureSeed;
      if (seed) {
        const sp = spiritById(seed);
        this.setData({ spiritId: seed, step: "spirit", stepIndex: 1, family: sp ? sp.family : "whisky" });
        store.consumePureSeed();
      }
    },
    detached() {
      if (this._timer) clearInterval(this._timer);
    },
  },

  methods: {
    refreshGlassList() {
      const q = this.data.glassQuery.trim();
      const list = q ? searchGlasses(q) : glassesByCategory(this.data.glassCat as any);
      this.setData({ glassList: list });
    },
    refreshSpiritList() {
      const q = this.data.spiritQuery.trim();
      const list = q ? searchSpirits(q) : spiritsByCategory(this.data.spiritCat as any);
      this.setData({ spiritList: list });
    },

    onGlassQuery(e: any) { this.setData({ glassQuery: e.detail.value }, () => this.refreshGlassList()); },
    onSpiritQuery(e: any) { this.setData({ spiritQuery: e.detail.value }, () => this.refreshSpiritList()); },
    pickGlassCat(e: any) { this.setData({ glassCat: e.currentTarget.dataset.id }, () => this.refreshGlassList()); },
    pickSpiritCat(e: any) { this.setData({ spiritCat: e.currentTarget.dataset.id }, () => this.refreshSpiritList()); },

    pickGlass(e: any) {
      sound.play("click");
      this.setData({ glassType: e.currentTarget.dataset.id });
    },
    pickSpirit(e: any) {
      sound.play("click");
      const id = e.currentTarget.dataset.id;
      const sp = spiritById(id);
      this.setData({ spiritId: id, family: sp ? sp.family : "whisky" });
    },
    pickIce(e: any) {
      const id = e.currentTarget.dataset.id as IceType;
      this.setData({ ice: id });
      if (id !== "none") sound.play("ice");
    },

    startPour() {
      if (this.data.pouring) return;
      this.setData({ pouring: true });
      sound.play("pour");
      let prev = Date.now();
      this._timer = setInterval(() => {
        const now = Date.now();
        const dt = (now - prev) / 1000;
        prev = now;
        const fill = Math.min(0.92, this.data.fill + dt * 0.32);
        this.applyFill(fill);
      }, 50) as unknown as number;
    },
    stopPour() {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      if (this.data.pouring) this.setData({ pouring: false });
    },
    resetFill() {
      this.applyFill(0);
    },
    applyFill(fill: number) {
      const quality = Math.max(0, 1 - Math.abs(fill - POUR_TARGET) / 0.5);
      const msg = fill < 0.05 ? "杯子还是空的" : quality > 0.8 ? "完美的注酒线 ✦" : fill > 0.8 ? "斟得有些满了" : "继续……";
      this.setData({ fill, pourPct: Math.round(fill * 100), pourMsg: msg });
    },

    prevStep() {
      const i = this.data.stepIndex - 1;
      if (i < 0) return;
      sound.play("click");
      this.setData({ step: STEPS[i].key, stepIndex: i });
    },
    nextStep() {
      const i = this.data.stepIndex + 1;
      if (i >= STEPS.length) return;
      if (this.data.step === "spirit" && !this.data.spiritId) return;
      if (this.data.step === "pour" && this.data.fill < 0.08) return;
      sound.play("click");
      this.setData({ step: STEPS[i].key, stepIndex: i });
    },

    async finish() {
      if (!this.data.spiritId || this.data.busy) return;
      this.setData({ busy: true });
      sound.play("success");
      store.addXp(40);
      const result = await cocktailAI.describePour(this.data.spiritId, this.data.glassType, this.data.ice);
      const ml = Math.max(15, Math.round((this.data.fill * 90) / 5) * 5);
      const poured: CocktailResult = {
        ...result,
        fillLevel: this.data.fill,
        ingredients: result.ingredients.map((ing, i) => (i === 0 ? { ...ing, amount: `${ml}ml` } : ing)),
      };
      store.recordDrink(poured, "pure");
      store.setLastResult(poured, "pure");
      this.setData({ busy: false });
      store.showResult();
    },
  },
});
