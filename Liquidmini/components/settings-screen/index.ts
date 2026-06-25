/** Settings — split out of the workshop ledger; reached from the Home 设置 entry. */
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    musicOn: false,
    sfxOn: false,
  },
  _unsub: null as null | (() => void),
  lifetimes: {
    attached() {
      this._unsub = store.subscribe((s) => this.setData({ musicOn: s.musicOn, sfxOn: s.sfxOn }));
    },
    detached() {
      if (this._unsub) this._unsub();
    },
  },
  methods: {
    toggleMusic() {
      const on = !store.get().musicOn;
      store.setMusic(on);
      sound.setMusicEnabled(on);
    },
    toggleSfx() {
      const on = !store.get().sfxOn;
      store.setSfx(on);
      sound.setSfxEnabled(on);
    },
  },
});
