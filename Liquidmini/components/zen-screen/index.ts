/**
 * The Alchemy Atelier (魔法模式) — a 4-step builder: glass → ingredients →
 * ice → generate. Ported from the web ZenScreen. Materials are poured in order;
 * the drink layers by default and only blends once stirred; every mutation is
 * undoable. Garnish-only / zero-proof creations get an honest, witty card.
 */
import type { GlassType, IceType, CocktailResult } from "../../lib/types";
import type { SpiritFamily } from "../../lib/tokens";
import { isFizzy } from "../../lib/tokens";
import {
  FLAVOR_CATEGORIES,
  FLAVOR_COUNT,
  flavorById,
  flavorsByCategory,
  searchFlavors,
} from "../../lib/data/flavors";
import { ICES } from "../../lib/data/catalog";
import { GLASS_CATEGORIES, GLASS_COUNT, glassesByCategory, searchGlasses } from "../../lib/data/glasses";
import { garnishesFor } from "../../lib/data/garnish";
import { iceSwatch } from "../../lib/svg/ice";
import { svgToDataUri } from "../../lib/svg/helpers";
import { cocktailAI } from "../../lib/ai/cocktailAI";
import {
  amountLabel,
  amountStep,
  blendForItems,
  buildLayers,
  classifyMix,
  defaultAmount,
  dominantFamily,
  fillForVolume,
  itemVolumeMl,
  totalVolumeMl,
  type AmountedPick,
  type MixUnit,
} from "../../lib/ai/magicMix";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";
import { logoDataUri } from "../../lib/svg/logo";

const STEPS = [
  { key: "glass", label: "选择杯型" },
  { key: "build", label: "调制酒液" },
  { key: "ice", label: "选择冰块" },
];
const MAX_ITEMS = 10;
const VEIL_LINES = ["正在聆听你的灵感…", "调酒师在分层斟酒…", "诗人在斟酌词句…", "化学家在校准风味…"];
let uidc = 0;

interface BuildItem {
  uid: string;
  flavorId: string;
  category: string;
  name: string;
  nameEn: string;
  color: string;
  family?: SpiritFamily;
  qty: number;
  unit: MixUnit;
}
interface Snapshot {
  items: BuildItem[];
  stirred: boolean;
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    step: "glass" as string,
    stepIndex: 0,
    steps: STEPS,
    glassType: "rocks" as GlassType,
    items: [] as BuildItem[],
    rows: [] as any[], // display rows for the added list
    stirred: false,
    stirring: false,
    ice: "none" as IceType,
    busy: false,
    veilLine: "",
    veilLogo: logoDataUri(64),

    glassCat: "tumbler",
    glassQuery: "",
    glassCats: GLASS_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    glassCount: GLASS_COUNT,
    glassList: [] as any[],

    category: "spirit",
    query: "",
    cats: FLAVOR_CATEGORIES.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    count: FLAVOR_COUNT,
    list: [] as any[],
    max: MAX_ITEMS,

    ices: ICES.map((i) => ({ id: i.id, name: i.name, nameEn: i.nameEn, swatch: svgToDataUri(iceSwatch(i.id, 56)) })),

    // preview (live glass)
    family: "absinthe",
    previewColor: "",
    previewLayers: [] as any[],
    previewFill: 0,
    fizzy: false,
    garnishes: [] as any[],
    layerBadge: "",
    canStir: false,
    canUndo: false,
    compact: false, // glass preview hidden to give the picker more room
  },

  _history: [] as Snapshot[],
  _veil: null as null | number,
  _stir: null as null | number,
  _hStartY: 0,

  lifetimes: {
    attached() {
      // WeChat Component doesn't copy top-level custom fields onto the instance,
      // so the array must be created here before pushHistory() reads it.
      this._history = [];
      this._veil = null;
      this._stir = null;
      this._hStartY = 0;
      this.refreshGlassList();
      this.refreshList();
      this.recompute();
    },
    detached() {
      if (this._veil) clearInterval(this._veil);
      if (this._stir) clearTimeout(this._stir);
    },
  },

  methods: {
    /* ── pickers ── */
    refreshGlassList() {
      const q = this.data.glassQuery.trim();
      const list = q ? searchGlasses(q) : glassesByCategory(this.data.glassCat as any);
      this.setData({ glassList: list });
    },
    refreshList() {
      const q = this.data.query.trim();
      const picked = new Set(this.data.items.map((it) => it.flavorId));
      const list = (q ? searchFlavors(q) : flavorsByCategory(this.data.category as any)).map((f) => ({
        id: f.id,
        name: f.name,
        nameEn: f.nameEn,
        color: f.color,
        sub: `${f.nameEn} · ${f.flavor.slice(0, 2).join("·")}`,
        picked: picked.has(f.id),
      }));
      this.setData({ list });
    },
    onGlassQuery(e: any) { this.setData({ glassQuery: e.detail.value }, () => this.refreshGlassList()); },
    onQuery(e: any) { this.setData({ query: e.detail.value }, () => this.refreshList()); },
    pickGlassCat(e: any) { this.setData({ glassCat: e.currentTarget.dataset.id }, () => this.refreshGlassList()); },
    pickCat(e: any) { this.setData({ category: e.currentTarget.dataset.id }, () => this.refreshList()); },
    pickGlass(e: any) {
      sound.play("click");
      this.setData({ glassType: e.currentTarget.dataset.id }, () => this.recompute());
    },
    pickIce(e: any) {
      const id = e.currentTarget.dataset.id as IceType;
      this.setData({ ice: id }, () => this.recompute());
      if (id !== "none") sound.play("ice");
    },

    /* ── collapse / expand the glass stage (drag the handle, or tap it) ── */
    hStart(e: any) { this._hStartY = e.touches[0].clientY; },
    hMove() { /* tracked on end via changedTouches */ },
    hEnd(e: any) {
      const dy = e.changedTouches[0].clientY - this._hStartY;
      if (Math.abs(dy) < 10) { this.setData({ compact: !this.data.compact }); return; } // tap
      if (dy < -20) this.setData({ compact: true });   // swipe up → hide glass
      else if (dy > 20) this.setData({ compact: false }); // swipe down → show glass
    },

    /* ── history ── */
    pushHistory() {
      this._history.push({ items: this.data.items.map((it) => ({ ...it })), stirred: this.data.stirred });
      if (this._history.length > 30) this._history.shift();
      this.setData({ canUndo: this._history.length > 0 });
    },
    undo() {
      const prev = this._history.pop();
      if (!prev) return;
      sound.play("ice");
      this.setData({ items: prev.items, stirred: prev.stirred, canUndo: this._history.length > 0 }, () => this.recompute());
    },

    /* ── build mutations ── */
    addFlavor(e: any) {
      if (this.data.items.length >= MAX_ITEMS) return;
      const f = flavorById(e.currentTarget.dataset.id);
      if (!f) return;
      this.pushHistory();
      const amt = defaultAmount(f.category);
      const item: BuildItem = {
        uid: `m${uidc++}`, flavorId: f.id, category: f.category, name: f.name, nameEn: f.nameEn,
        color: f.color, family: f.family, qty: amt.qty, unit: amt.unit,
      };
      sound.play("pour");
      this.setData({ items: [...this.data.items, item], stirred: false }, () => this.recompute());
    },
    removeItem(e: any) {
      const uid = e.currentTarget.dataset.uid;
      this.pushHistory();
      this.setData({ items: this.data.items.filter((it) => it.uid !== uid) }, () => this.recompute());
    },
    bumpQty(e: any) {
      const { uid, dir } = e.currentTarget.dataset;
      const d = Number(dir);
      this.pushHistory();
      const items = this.data.items.map((it) => {
        if (it.uid !== uid) return it;
        const s = amountStep(it.unit);
        return { ...it, qty: Math.max(s, it.qty + d * s) };
      });
      this.setData({ items }, () => this.recompute());
    },
    move(e: any) {
      const { uid, dir } = e.currentTarget.dataset;
      const d = Number(dir);
      const items = this.data.items.slice();
      const i = items.findIndex((it) => it.uid === uid);
      const j = i + d;
      if (i < 0 || j < 0 || j >= items.length) return;
      this.pushHistory();
      const t = items[i]; items[i] = items[j]; items[j] = t;
      this.setData({ items, stirred: false }, () => this.recompute());
    },
    stir() {
      const liquids = this.data.items.filter((it) => itemVolumeMl(it) > 0);
      if (liquids.length < 2) return;
      this.pushHistory();
      sound.play("ice");
      this.setData({ stirred: true, stirring: true }, () => this.recompute());
      if (this._stir) clearTimeout(this._stir);
      this._stir = setTimeout(() => this.setData({ stirring: false }), 1200) as unknown as number;
    },

    /* ── recompute the live preview from items + stirred ── */
    recompute() {
      const items = this.data.items;
      const klass = classifyMix(items as any);
      const liquidItems = items.filter((it) => itemVolumeMl(it) > 0);
      const totalMl = totalVolumeMl(items as any);
      const family = items.length ? dominantFamily(items as any) : "absinthe";
      const layered = !this.data.stirred && liquidItems.length >= 2;
      const previewLayers = layered ? buildLayers(items as any) : [];
      const previewColor = layered
        ? ""
        : this.data.stirred
          ? blendForItems(items as any) || ""
          : liquidItems.length
            ? liquidItems[0].color
            : "";
      const previewFill = klass.onlyGarnish ? 0 : fillForVolume(totalMl);
      const garnishes = garnishesFor(items.map((it) => ({ name: it.name, category: it.category, amount: amountLabel(it.qty, it.unit) })));
      const fizzy = isFizzy(items.map((it) => ({ name: it.name, nameEn: it.nameEn })));
      const layerBadge = liquidItems.length >= 2
        ? (this.data.stirred ? "已搅匀 · 融合" : "未搅拌 · 分层")
        : liquidItems.length === 1 ? "单一酒液" : "";

      const rows = items.map((it, i) => ({
        uid: it.uid, n: i + 1, name: it.name, color: it.color,
        liquid: itemVolumeMl(it) > 0,
        amount: amountLabel(it.qty, it.unit),
        isFirst: i === 0, isLast: i === items.length - 1,
      }));

      this.setData({
        rows, family, previewColor, previewLayers, previewFill, garnishes, fizzy, layerBadge,
        canStir: liquidItems.length >= 2,
      });
      this.refreshList(); // keep the picker's selected highlights in sync
    },

    /* ── steps ── */
    prevStep() {
      const i = this.data.stepIndex - 1;
      if (i < 0) return;
      sound.play("click");
      this.setData({ step: STEPS[i].key, stepIndex: i });
    },
    nextStep() {
      const i = this.data.stepIndex + 1;
      if (i >= STEPS.length) return;
      if (this.data.step === "build" && this.data.items.length === 0) return;
      sound.play("click");
      this.setData({ step: STEPS[i].key, stepIndex: i });
    },

    async finish() {
      if (this.data.items.length === 0 || this.data.busy) return;
      this.setData({ busy: true, veilLine: VEIL_LINES[0] });
      let l = 0;
      this._veil = setInterval(() => { l = (l + 1) % VEIL_LINES.length; this.setData({ veilLine: VEIL_LINES[l] }); }, 900) as unknown as number;

      const items = this.data.items;
      const picks: AmountedPick[] = items.map((it) => ({
        id: it.flavorId, name: it.name, nameEn: it.nameEn, category: it.category,
        color: it.color, flavor: flavorById(it.flavorId)?.flavor || [], family: it.family,
        amount: amountLabel(it.qty, it.unit),
      }));
      const analysis = await cocktailAI.analyzeFlavorMix(picks);
      if (this._veil) { clearInterval(this._veil); this._veil = null; }

      // the card shows the player's exact recipe — order, measures and all
      analysis.ingredients = items.map((it) => ({
        name: it.name, nameEn: it.nameEn, amount: amountLabel(it.qty, it.unit), parts: 1, family: it.family,
      }));
      analysis.ratio = analysis.ingredients.map(() => 1);

      const klass = classifyMix(picks);
      const liquidItems = items.filter((it) => itemVolumeMl(it) > 0);
      const layered = !this.data.stirred && liquidItems.length >= 2;
      analysis.glass = this.data.glassType;
      analysis.ice = klass.onlyGarnish ? "none" : this.data.ice;
      analysis.family = items.length ? dominantFamily(items as any) : analysis.family;
      analysis.fillLevel = klass.onlyGarnish ? 0 : fillForVolume(totalVolumeMl(items as any));
      if (layered) {
        analysis.layers = buildLayers(items as any);
        analysis.liquidColor = undefined;
      } else {
        analysis.layers = undefined;
        analysis.liquidColor = klass.onlyGarnish ? undefined : (this.data.stirred ? blendForItems(items as any) || undefined : (liquidItems.length ? liquidItems[0].color : undefined));
      }

      sound.play(analysis.hidden ? "unlock" : "success");
      store.addXp(analysis.hidden ? 120 : 60);
      store.recordDrink(analysis as CocktailResult, "zen");
      if (analysis.hidden) store.recordUnlock(analysis.name);
      store.setLastResult(analysis as CocktailResult, "zen");
      this.setData({ busy: false });
      store.showResult();
    },
  },
});
