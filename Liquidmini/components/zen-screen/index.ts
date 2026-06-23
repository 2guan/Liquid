/** The Alchemy Atelier — free-mix flavour graph. Ported from ZenScreen.tsx.
 *  Node positions don't affect the analysis (only which flavours are picked),
 *  so orbs auto-arrange in a ring rather than free-drag. */
import type { FlavorPick } from "../../lib/types";
import { FLAVOR_CATEGORIES, FLAVOR_COUNT, flavorById, flavorsByCategory, searchFlavors } from "../../lib/data/flavors";
import { cocktailAI } from "../../lib/ai/cocktailAI";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";
import { sceneForFamily } from "../../lib/config";
import { svgToDataUri } from "../../lib/svg/helpers";

const MAX_NODES = 8;
const VEIL_LINES = ["正在聆听你的心绪…", "调酒师在挑选基酒…", "诗人在斟酌词句…", "化学家在校准风味…"];
let nid = 0;

function edgesSvg(nodes: { x: number; y: number; color: string }[]): string {
  const lines = nodes
    .map((n) => `<line x1="50" y1="50" x2="${(n.x * 100).toFixed(1)}" y2="${(n.y * 100).toFixed(1)}" stroke="${n.color}" stroke-opacity="0.4" stroke-width="0.5" stroke-dasharray="1 2"/>`)
    .join("");
  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>`);
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    nodes: [] as any[],
    pickedIds: [] as string[],
    category: "spirit",
    query: "",
    cats: FLAVOR_CATEGORIES.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    list: [] as any[],
    count: FLAVOR_COUNT,
    max: MAX_NODES,
    busy: false,
    veilLine: "",
    edges: "",
    scene: sceneForFamily("absinthe"),
    hintComplex: false,
  },

  _veil: null as null | number,

  lifetimes: {
    attached() { this.refresh(); },
    detached() { if (this._veil) clearInterval(this._veil); },
  },

  methods: {
    refresh() {
      const q = this.data.query.trim();
      const picked = this.data.pickedIds;
      const full = this.data.nodes.length >= MAX_NODES;
      const list = (q ? searchFlavors(q) : flavorsByCategory(this.data.category as any)).map((f) => ({
        id: f.id, name: f.name, nameEn: f.nameEn, color: f.color,
        sub: `${f.nameEn} · ${f.flavor.slice(0, 2).join("·")}`,
        picked: picked.indexOf(f.id) > -1,
        disabled: full && picked.indexOf(f.id) === -1,
      }));
      this.setData({ list });
    },
    onQuery(e: any) { this.setData({ query: e.detail.value }, () => this.refresh()); },
    clearQuery() { this.setData({ query: "" }, () => this.refresh()); },
    pickCat(e: any) { this.setData({ category: e.currentTarget.dataset.id }, () => this.refresh()); },

    relayout(rawNodes: { id: string; flavorId: string }[]) {
      const n = rawNodes.length;
      const nodes = rawNodes.map((nd, i) => {
        const f = flavorById(nd.flavorId);
        const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
        const x = 0.5 + Math.cos(angle) * 0.3;
        const y = 0.5 + Math.sin(angle) * 0.34;
        return {
          id: nd.id, flavorId: nd.flavorId,
          x, y, leftPct: x * 100, topPct: y * 100,
          color: f ? f.color : "#C8A45D",
          name: f ? f.name : "",
          short: f ? f.name.slice(0, 2) : "",
        };
      });
      const dominant = nodes.length ? (flavorById(nodes[0].flavorId)?.family || "absinthe") : "absinthe";
      this.setData({
        nodes,
        pickedIds: nodes.map((x) => x.flavorId),
        edges: edgesSvg(nodes),
        scene: sceneForFamily(dominant),
        hintComplex: nodes.length > 3,
      });
      this.refresh();
    },

    toggleFlavor(e: any) {
      const id = e.currentTarget.dataset.id as string;
      const cur = this.data.nodes as { id: string; flavorId: string }[];
      if (cur.some((n) => n.flavorId === id)) {
        this.relayout(cur.filter((n) => n.flavorId !== id));
        return;
      }
      if (cur.length >= MAX_NODES) return;
      sound.play("ice");
      this.relayout([...cur, { id: `z${nid++}`, flavorId: id }]);
    },
    removeNode(e: any) {
      const id = e.currentTarget.dataset.id;
      this.relayout((this.data.nodes as any[]).filter((n) => n.id !== id));
    },

    async analyze() {
      if (this.data.busy || this.data.nodes.length < 1) return;
      this.setData({ busy: true, veilLine: VEIL_LINES[0] });
      let l = 0;
      this._veil = setInterval(() => { l = (l + 1) % VEIL_LINES.length; this.setData({ veilLine: VEIL_LINES[l] }); }, 900) as unknown as number;
      const picks: FlavorPick[] = this.data.nodes
        .map((n: any) => flavorById(n.flavorId))
        .filter(Boolean)
        .map((f: any) => ({ id: f.id, name: f.name, nameEn: f.nameEn, category: f.category, color: f.color, flavor: f.flavor, family: f.family }));
      const analysis = await cocktailAI.analyzeFlavorMix(picks);
      if (this._veil) { clearInterval(this._veil); this._veil = null; }
      sound.play(analysis.hidden ? "unlock" : "success");
      store.addXp(analysis.hidden ? 120 : 55);
      store.recordDrink(analysis, "zen");
      if (analysis.hidden) store.recordUnlock(analysis.name);
      store.setLastResult(analysis, "zen");
      this.setData({ busy: false });
      store.showResult();
    },
  },
});
