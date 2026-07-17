/** Whisper of Mood — emotion → drink. Ported from MoodScreen.tsx. */
import { MOOD_PROMPTS, sampleSeeds, randomPrompt } from "../../lib/data/moods";
import { cocktailAI } from "../../lib/ai/cocktailAI";
import { maybeGradientPour } from "../../lib/tokens";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";
import { emblemDataUri } from "../../lib/svg/emblem";
import { logoDataUri } from "../../lib/svg/logo";

const VEIL_LINES = [
  "正在聆听你的心绪…",
  "调酒师在挑选基酒…",
  "诗人在斟酌词句…",
  "化学家在校准风味…",
];

function seedItems(count: number, selected: string[] = []) {
  return sampleSeeds(count).map((m) => ({ tag: m.tag, label: m.label, on: selected.indexOf(m.tag) > -1 }));
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    text: "",
    tags: [] as string[],
    busy: false,
    veilLine: "",
    placeholder: MOOD_PROMPTS[0],
    seeds: seedItems(8),
    emblem: emblemDataUri("mood", 54, "#D89C3A"),
    veilLogo: logoDataUri(64),
    charCount: 0,
  },

  _promptTimer: null as null | number,
  _veilTimer: null as null | number,

  lifetimes: {
    attached() {
      // a fresh random 7–8 chips each time the screen opens
      this.setData({ seeds: seedItems(7 + Math.floor(Math.random() * 2), this.data.tags) });
      let i = 0;
      this._promptTimer = setInterval(() => {
        i = (i + 1) % MOOD_PROMPTS.length;
        this.setData({ placeholder: MOOD_PROMPTS[i] });
      }, 3800) as unknown as number;
    },
    detached() {
      if (this._promptTimer) clearInterval(this._promptTimer);
      if (this._veilTimer) clearInterval(this._veilTimer);
    },
  },

  methods: {
    onInput(e: any) {
      const v = e.detail.value;
      this.setData({ text: v, charCount: v.length });
    },
    toggleTag(e: any) {
      const t = e.currentTarget.dataset.tag as string;
      const tags = this.data.tags.includes(t)
        ? this.data.tags.filter((x) => x !== t)
        : [...this.data.tags, t];
      const seeds = this.data.seeds.map((m: any) => ({ ...m, on: tags.indexOf(m.tag) > -1 }));
      this.setData({ tags, seeds });
      sound.play("click");
    },
    inspire() {
      // drop in a random mood line; replace whatever is already in the box
      const p = randomPrompt(this.data.text.trim());
      this.setData({ text: p, charCount: p.length });
      sound.play("click");
    },
    async generate() {
      if (this.data.busy) return;
      if (!this.data.text.trim() && this.data.tags.length === 0) return;
      this.setData({ busy: true, veilLine: VEIL_LINES[0] });
      sound.play("shake");
      let l = 0;
      this._veilTimer = setInterval(() => {
        l = (l + 1) % VEIL_LINES.length;
        this.setData({ veilLine: VEIL_LINES[l] });
      }, 900) as unknown as number;

      const result = await cocktailAI.generateFromMood({ text: this.data.text.trim(), tags: this.data.tags });
      maybeGradientPour(result); // ~20% get a smooth two-tone gradient body
      if (this._veilTimer) { clearInterval(this._veilTimer); this._veilTimer = null; }
      store.addXp(50);
      store.recordDrink(result, "mood");
      store.setLastResult(result, "mood");
      this.setData({ busy: false });
      store.showResult();
    },
  },
});
