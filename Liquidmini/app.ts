/**
 * 微醺时刻 — app entry. Loads the Chinese display webfont at runtime (downloaded
 * once then cached locally — see lib/fonts.ts) and restores the persisted sound
 * preference. Global state lives in lib/store.ts.
 */
import { store } from "./lib/store";
import { sound } from "./lib/sound/index";

App({
  onLaunch() {
    // NOTE: fonts are loaded from the index page's onReady, NOT here — a global
    // wx.loadFontFace called in App.onLaunch (before any page/renderer exists)
    // fails on-device with "loadFontFace:fail A network error occurred."

    // Restore the persisted sound preferences and arm the synth accordingly.
    const s = store.get();
    if (s.musicOn) sound.setMusicEnabled(true);
    if (s.sfxOn) sound.setSfxEnabled(true);
  },
  onShow() {
    sound.resumeIfEnabled();
  },
});
