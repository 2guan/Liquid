/**
 * 微醺时刻 — app entry. Loads the Chinese display webfont at runtime (downloaded
 * once then cached locally — see lib/fonts.ts) and restores the persisted sound
 * preference. Global state lives in lib/store.ts.
 */
import { store } from "./lib/store";
import { sound } from "./lib/sound/index";
import { FONT_MAOKEN, FONT_CINZEL, FONT_CORMORANT } from "./lib/config";
import { loadServerFont } from "./lib/fonts";

App({
  onLaunch() {
    // Maoken Fengyasong (猫啃网风雅宋) — the Chinese display serif, self-hosted on
    // the deployment. Download-then-cache-local because WeChat's renderer fails a
    // large REMOTE loadFontFace (net::ERR_CACHE_MISS on the 7MB file).
    loadServerFont("Maoken Fengyasong", FONT_MAOKEN);
    // Latin display faces — only loaded if the deployment serves them (the old
    // Google Fonts URLs 404 in the mini-program); otherwise the WXSS stack falls
    // back to Maoken / system serif, so these are best-effort.
    if (FONT_CINZEL) loadServerFont("Cinzel", FONT_CINZEL);
    if (FONT_CORMORANT) loadServerFont("Cormorant Garamond", FONT_CORMORANT);

    // Restore the persisted sound preference and arm the synth if it was on.
    if (store.get().soundOn) {
      sound.setEnabled(true);
    }
  },
  onShow() {
    sound.resumeIfEnabled();
  },
});
