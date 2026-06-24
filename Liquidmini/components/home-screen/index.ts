/** Home — the landing: engraved title + four ornate mode cards + bottom nav. */
import { MODES } from "../../lib/data/catalog";
import type { ModeId } from "../../lib/types";
import { garnishesFor } from "../../lib/data/garnish";
import { store } from "../../lib/store";
import { sceneUrl } from "../../lib/config";

/** A gradient pour for the 心事 card — 红黄蓝, blended (bottom → top: blue → red). */
const RAINBOW = [
  { color: "#3F6FD8", ratio: 1 }, // 蓝
  { color: "#F4D03F", ratio: 1.35 }, // 黄 — a touch wider
  { color: "#E74C3C", ratio: 1 }, // 红
];

interface CardVM {
  id: ModeId;
  name: string;
  nameEn: string;
  tagline: string;
  wash0: string;
  wash1: string;
  glow: string;
  glassType: string;
  family: string;
  ice: string;
  fill: number;
  fizzy: boolean;
  garnishes: any[];
  layers: any[];
}

const THEME: Record<ModeId, { wash: [string, string]; glow: string; glass: string; family: string; ice: string; fill: number; fizzy?: boolean; garnish?: string[]; layers?: any[] }> = {
  pure: { wash: ["#5a4226", "#241809"], glow: "#D89C3A", glass: "glencairn", family: "whisky", ice: "none", fill: 0.52 },
  mixology: { wash: ["#3c4a30", "#171f12"], glow: "#9DB85F", glass: "martini", family: "gin", ice: "none", fill: 0.9, garnish: ["橄榄"] },
  mood: { wash: ["#2c3656", "#11162a"], glow: "#8AA0D8", glass: "highball", family: "cranberry", ice: "none", fill: 0.92, garnish: ["食用花"], layers: RAINBOW },
  zen: { wash: ["#3f3160", "#1a1230"], glow: "#B98AD8", glass: "coupe", family: "green", ice: "none", fill: 0.9, garnish: ["薄荷"] },
};

Component({
  options: { styleIsolation: "apply-shared" },
  properties: {
    statusBarHeight: { type: Number, value: 20 },
  },
  data: {
    cards: [] as CardVM[],
    bgUrl: sceneUrl("amber"),
  },
  lifetimes: {
    attached() {
      const cards: CardVM[] = MODES.map((m) => {
        const t = THEME[m.id];
        return {
          id: m.id,
          name: m.name,
          nameEn: m.nameEn,
          tagline: m.tagline,
          wash0: t.wash[0],
          wash1: t.wash[1],
          glow: t.glow,
          glassType: t.glass,
          family: t.family,
          ice: t.ice,
          fill: t.fill,
          fizzy: !!t.fizzy,
          garnishes: t.garnish ? garnishesFor(t.garnish.map((name) => ({ name }))) : [],
          layers: t.layers || [],
        };
      });
      this.setData({ cards });
    },
  },
  methods: {
    onCard(e: any) {
      const id = e.currentTarget.dataset.id as ModeId;
      store.enterMode(id);
    },
    go(e: any) {
      const v = e.currentTarget.dataset.v;
      store.go(v);
    },
  },
});
