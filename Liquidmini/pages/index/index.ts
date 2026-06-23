/**
 * Single dynamic page — the SPA router. Holds the current `view` from the global
 * store and renders the matching screen component, plus the contextual top bar.
 * This keeps the procedural background music running uninterrupted (no page
 * navigation) and mirrors the web build's view-switching AppShell.
 */
import { store, type View } from "../../lib/store";
import { sound } from "../../lib/sound/index";

const SECTION: Record<string, { zh: string; en: string }> = {
  pure: { zh: "纯饮", en: "The Pure Pour" },
  mixology: { zh: "酒谱", en: "The Liquid Codex" },
  mood: { zh: "心事", en: "Whisper of Mood" },
  zen: { zh: "魔法", en: "The Alchemy Atelier" },
  library: { zh: "酒库", en: "The Cellar" },
  journal: { zh: "微醺日记", en: "Liquid Journal" },
  achievements: { zh: "工坊档案", en: "The Ledger" },
  result: { zh: "酒卡", en: "The Tasting Card" },
};

Page({
  data: {
    view: "home" as View,
    soundOn: false,
    section: null as null | { zh: string; en: string },
    statusBarHeight: 20,
    rankName: "",
    rankProgress: 0,
  },

  _unsub: null as null | (() => void),

  onLoad() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.setData({ statusBarHeight: info.statusBarHeight || 20 });
    } catch (e) { /* default */ }

    this._unsub = store.subscribe((s) => {
      const rank = store.rank();
      this.setData({
        view: s.view,
        soundOn: s.soundOn,
        section: SECTION[s.view] || null,
        rankName: rank.meta.name,
        rankProgress: Math.round(rank.progress * 100),
      });
    });
  },

  onUnload() {
    if (this._unsub) this._unsub();
  },

  goHome() {
    store.home();
  },
  toggleSound() {
    store.toggleSound();
    sound.setEnabled(store.get().soundOn);
  },
  goAchievements() {
    store.go("achievements");
  },
  goJournal() {
    store.go("journal");
  },
});
