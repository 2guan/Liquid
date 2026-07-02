/**
 * Single dynamic page — the SPA router. Holds the current `view` from the global
 * store and renders the matching screen component, plus the contextual top bar.
 * This keeps the procedural background music running uninterrupted (no page
 * navigation) and mirrors the web build's view-switching AppShell.
 */
import { store, type View } from "../../lib/store";
import { loadServerFont } from "../../lib/fonts";
import { FONT_MAOKEN, FONT_CINZEL, FONT_CORMORANT } from "../../lib/config";

let fontsLoaded = false;

const SECTION: Record<string, { zh: string; en: string }> = {
  pure: { zh: "纯饮", en: "The Pure Pour" },
  mixology: { zh: "酒谱", en: "The Liquid Codex" },
  mood: { zh: "心事", en: "Whisper of Mood" },
  zen: { zh: "魔法", en: "The Alchemy Atelier" },
  library: { zh: "酒库", en: "The Cellar" },
  journal: { zh: "日记", en: "Journal" },
  achievements: { zh: "成就", en: "The Ledger" },
  settings: { zh: "设置", en: "Settings" },
  result: { zh: "酒卡", en: "The Tasting Card" },
};

Page({
  data: {
    view: "home" as View,
    section: null as null | { zh: string; en: string },
    statusBarHeight: 20,
    rankName: "",
    rankProgress: 0,
  },

  _unsub: null as null | (() => void),
  // ── hardware/system back support ──
  // The app is a single dynamic page, so the system back button would exit it.
  // We mirror the store's nav back-stack (history depth) into a REAL WeChat page
  // stack: navigating forward pushes an identical page, and popping one (system
  // back, gesture, or our own navigateBack) walks the store back one step. Only
  // the active (top) page drives navigation. It's best-effort (wrapped in
  // try/catch) — the view itself always renders from the store regardless.
  _active: false,
  _depth: 0,

  onLoad() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.setData({ statusBarHeight: info.statusBarHeight || 20 });
    } catch (e) { /* default */ }

    this._depth = store.get().history.length;
    this._unsub = store.subscribe((s) => {
      const rank = store.rank();
      this.setData({
        view: s.view,
        section: SECTION[s.view] || null,
        rankName: rank.meta.name,
        rankProgress: Math.round(rank.progress * 100),
      });
      // mirror the back-stack depth into the real page stack (best-effort)
      try {
        const depth = s.history.length;
        if (this._active) {
          if (depth > this._depth) {
            wx.navigateTo({ url: "/pages/index/index", fail: () => {} });
          } else if (depth < this._depth) {
            wx.navigateBack({ delta: this._depth - depth, fail: () => {} });
          }
        }
        this._depth = depth;
      } catch (e) { /* mirror is best-effort */ }
    });
  },

  onShow() {
    this._active = true;
    this._depth = store.get().history.length;
  },
  onHide() {
    this._active = false;
  },

  onReady() {
    // Load display fonts AFTER the first render — a global wx.loadFontFace called
    // earlier (app.onLaunch) fails on-device with "A network error occurred."
    if (!fontsLoaded) {
      fontsLoaded = true;
      loadServerFont("Maoken Fengyasong", FONT_MAOKEN);
      if (FONT_CINZEL) loadServerFont("Cinzel", FONT_CINZEL);
      if (FONT_CORMORANT) loadServerFont("Cormorant Garamond", FONT_CORMORANT);
    }
    // enable 转发 / 分享到朋友圈 on every page instance (not just the first)
    try {
      wx.showShareMenu({ withShareTicket: false, menus: ["shareAppMessage", "shareTimeline"] });
    } catch (e) { /* older base lib */ }
  },

  /** 分享给朋友. On the result page → 酒名+酒杯 image; elsewhere → the app. */
  onShareAppMessage() {
    const s = store.get();
    if (s.view === "result" && s.lastResult) {
      store.recordShare();
      return {
        title: s.shareTitle || s.lastResult.result.name,
        path: "/pages/index/index",
        imageUrl: s.shareImage || undefined,
      };
    }
    return {
      title: "微醺时刻 · The Sip & Sigh — 把心情酿成一杯酒",
      path: "/pages/index/index",
    };
  },

  /** 分享到朋友圈 (must be synchronous — uses the pre-rendered image if present). */
  onShareTimeline() {
    const s = store.get();
    if (s.view === "result" && s.lastResult) {
      return { title: s.shareTitle || s.lastResult.result.name, imageUrl: s.shareImage || undefined };
    }
    return { title: "微醺时刻 · The Sip & Sigh" };
  },

  onUnload() {
    if (this._unsub) this._unsub();
    // this page was popped (system/hardware back, gesture, or our navigateBack) →
    // walk the app back-stack in sync. Guard the app-exit case (already at home).
    try {
      if (store.get().history.length > 0) store.back();
    } catch (e) { /* ignore */ }
  },

  /** top-bar back arrow — pop a real page so it shares the system-back path. */
  goBack() {
    wx.navigateBack({ fail: () => { try { store.back(); } catch (e) { /* ignore */ } } });
  },
  goHome() {
    store.home();
  },
  goAchievements() {
    store.go("achievements");
  },
  goJournal() {
    store.go("journal");
  },
});
