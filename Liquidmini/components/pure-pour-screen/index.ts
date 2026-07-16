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
import { liquidRamp } from "../../lib/tokens";
import { logoDataUri } from "../../lib/svg/logo";

const STEPS = [
  { key: "glass", label: "选择杯型" },
  { key: "spirit", label: "倒入基酒" },
  { key: "pour", label: "斟酒" },
  { key: "ice", label: "选择冰型" },
];
const POUR_TARGET = 0.58;
const VEIL_LINES = [
  "正在斟酌这杯纯饮…",
  "调酒师在端详酒色…",
  "诗人在斟酌词句…",
  "化学家在校准风味…",
];

const CLEAR = ["#EEF6F8", "#D6E6EC", "#A2BAC4"] as const;
function rgba(hex: string, a: number): string {
  const m = hex.replace("#", "");
  return `rgba(${parseInt(m.slice(0, 2), 16)},${parseInt(m.slice(2, 4), 16)},${parseInt(m.slice(4, 6), 16)},${a})`;
}
/** Pour-stream gradient that matches the spirit's liquid colour in the glass. */
function streamGradient(family: string): string {
  const clear = family === "gin" || family === "vodka" || family === "sparkling" || family === "rumWhite";
  const ramp = clear ? CLEAR : (liquidRamp[family] ?? liquidRamp.default);
  return `linear-gradient(180deg, ${rgba(ramp[0], 0)} 0%, ${rgba(ramp[0], 0.85)} 14%, ${rgba(ramp[1], 0.92)} 100%)`;
}

function iceList() {
  return ICES.map((i) => ({ ...i, swatch: svgToDataUri(iceSwatch(i.id, 56, true)) }));
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
    streamBg: streamGradient("whisky"),
    fill: 0,
    glassFill: 0, // quantised fill fed to the <glass> so it rebuilds less often
    pouring: false,
    ice: "none" as IceType,
    busy: false,
    veilLine: "",
    veilLogo: logoDataUri(64),
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
  _veil: null as null | number,

  lifetimes: {
    attached() {
      this.refreshGlassList();
      this.refreshSpiritList();
      const seed = store.get().pureSeed;
      if (seed) {
        const sp = spiritById(seed);
        const fam = sp ? sp.family : "whisky";
        this.setData({ spiritId: seed, step: "spirit", stepIndex: 1, family: fam, streamBg: streamGradient(fam) });
        store.consumePureSeed();
      }
    },
    detached() {
      if (this._timer) clearInterval(this._timer);
      if (this._veil) clearInterval(this._veil);
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
      const fam = sp ? sp.family : "whisky";
      this.setData({ spiritId: id, family: fam, streamBg: streamGradient(fam) });
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
      const data: any = { fill, pourPct: Math.round(fill * 100), pourMsg: msg };
      // only rebuild the heavy glass SVG when the fill moves a visible step (~0.04)
      const gq = Math.round(fill / 0.04) * 0.04;
      if (gq !== this.data.glassFill) data.glassFill = gq;
      this.setData(data);
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
      this.setData({ busy: true, veilLine: VEIL_LINES[0] });
      sound.play("success");
      store.addXp(40);
      let l = 0;
      this._veil = setInterval(() => {
        l = (l + 1) % VEIL_LINES.length;
        this.setData({ veilLine: VEIL_LINES[l] });
      }, 900) as unknown as number;
      const result = await cocktailAI.describePour(this.data.spiritId, this.data.glassType, this.data.ice);
      if (this._veil) { clearInterval(this._veil); this._veil = null; }
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
