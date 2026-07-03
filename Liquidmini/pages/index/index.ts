/**
 * The app's router. Each page instance renders ONE fixed view (passed via the
 * `?v=` query), and navigating deeper pushes another real page. That gives the
 * phone's system/hardware back button natural level-by-level behaviour (it pops a
 * page → the previous view). The global store still holds the shared data
 * (journal, xp, last result) and its history depth drives the page stack.
 *
 * NOTE: the left-right slide between pages is WeChat's built-in navigateTo/Back
 * animation — there is no API to disable it or swap it for a fade. We soften it
 * by fading each screen's content in on mount (see the .screen-anim rule).
 */
import { store, type View } from "../../lib/store";
import { loadServerFont } from "../../lib/fonts";
import { FONT_MAOKEN, FONT_CINZEL, FONT_CORMORANT } from "../../lib/config";

let fontsLoaded = false;

Page({
  data: {
    // start blank (not "home") so a freshly-pushed page never flashes the home
    // screen before onLoad sets its real view — no screen matches "".
    view: "" as View,
    statusBarHeight: 20,
  },

  _unsub: null as null | (() => void),
  // is this page the active (top) one, and the nav-depth it last saw — used to
  // mirror the store back-stack into the real WeChat page stack (see onLoad).
  _active: false,
  _depth: 0,

  onLoad(query: Record<string, string>) {
    // this page renders its OWN fixed view — no flash, no following the global
    // view. The base (launch) page is whatever the store says (home). Set the
    // view + status bar in ONE setData up front so the first paint is correct.
    const view = ((query && query.v) as View) || store.get().view || "home";
    let statusBarHeight = 20;
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      statusBarHeight = info.statusBarHeight || 20;
    } catch (e) { /* default */ }
    this.setData({ view, statusBarHeight });

    this._depth = store.get().history.length;
    this._unsub = store.subscribe((s) => {
      // Only the active (top) page drives navigation. A forward push opens a new
      // page for the new view; a home() reset (multi-step decrease) pops back.
      const depth = s.history.length;
      if (!this._active) {
        this._depth = depth;
        return;
      }
      try {
        if (depth > this._depth) {
          wx.navigateTo({
            url: `/pages/index/index?v=${s.view}`,
            // couldn't push (e.g. the 10-page limit) → switch this page in place
            fail: () => this.setData({ view: s.view }),
          });
        } else if (depth < this._depth) {
          wx.navigateBack({ delta: this._depth - depth, fail: () => {} });
        }
        this._depth = depth;
      } catch (e) { /* best-effort */ }
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
    if (this.data.view === "result" && s.lastResult) {
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
    if (this.data.view === "result" && s.lastResult) {
      return { title: s.shareTitle || s.lastResult.result.name, imageUrl: s.shareImage || undefined };
    }
    return { title: "微醺时刻 · The Sip & Sigh" };
  },

  onUnload() {
    if (this._unsub) this._unsub();
    // this page was popped (system/hardware back, gesture, or our navigateBack) →
    // walk the store back-stack in sync. Guard the app-exit case (already home).
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
