/** The Cellar — browse the spirit library. Ported from LibraryScreen.tsx. */
import { SPIRITS, SPIRIT_CATEGORIES, SPIRIT_COUNT, spiritsByCategory, searchSpirits, spiritById } from "../../lib/data/spirits";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";

function toDetail(s: any) {
  return {
    id: s.id, name: s.name, nameEn: s.nameEn, label: s.nameEn[0],
    family: s.family, origin: s.origin, abv: s.abv, note: s.note, flavor: s.flavor,
  };
}
function toTile(s: any) {
  return { id: s.id, name: s.name.replace(/\s*\d.*$/, ""), label: s.nameEn[0], family: s.family };
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    count: SPIRIT_COUNT,
    cats: SPIRIT_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    category: "whisky",
    query: "",
    list: [] as any[],
    selectedId: SPIRITS[0].id,
    selected: toDetail(SPIRITS[0]),
  },

  lifetimes: {
    attached() { this.refresh(); },
  },

  methods: {
    refresh() {
      const q = this.data.query.trim();
      const list = (q ? searchSpirits(q) : spiritsByCategory(this.data.category as any)).map(toTile);
      this.setData({ list });
    },
    onQuery(e: any) { this.setData({ query: e.detail.value }, () => this.refresh()); },
    clearQuery() { this.setData({ query: "" }, () => this.refresh()); },
    pickCat(e: any) { this.setData({ category: e.currentTarget.dataset.id }, () => this.refresh()); },
    pickSpirit(e: any) {
      const id = e.currentTarget.dataset.id;
      const sp = spiritById(id);
      if (!sp) return;
      sound.play("click");
      this.setData({ selectedId: id, selected: toDetail(sp) });
    },
    pour() {
      sound.play("click");
      store.enterPureWith(this.data.selectedId);
    },
  },
});
