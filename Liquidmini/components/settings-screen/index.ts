/** Settings — split out of the workshop ledger; reached from the Home 设置 entry. */
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    soundOn: false,
  },
  _unsub: null as null | (() => void),
  lifetimes: {
    attached() {
      this._unsub = store.subscribe((s) => this.setData({ soundOn: s.soundOn }));
    },
    detached() {
      if (this._unsub) this._unsub();
    },
  },
  methods: {
    toggleSound() {
      store.toggleSound();
      sound.setEnabled(store.get().soundOn);
    },
  },
});
