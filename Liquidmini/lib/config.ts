/**
 * Remote endpoints — the existing web deployment serves the fonts, scene images
 * and AI API. Add `https://sip.guantools.top` to BOTH the mini-program's
 * request 合法域名 AND downloadFile 合法域名 (mp.weixin.qq.com → 开发管理 → 服务器域名);
 * in DevTools you can instead tick 「不校验合法域名」 to test.
 */
export const SERVER = "https://sip.guantools.top";

/** AI API base (Next.js route handlers proxy to the LLM, offline poet as fallback). */
export const API_BASE = `${SERVER}/api`;

/** Self-hosted display fonts. Maoken Fengyasong (猫啃网风雅宋) is the Chinese face.
 *  The Latin faces (Cinzel / Cormorant Garamond) are OPTIONAL — Google Fonts URLs
 *  404 in the mini-program, so leave them "" to fall back to Maoken/system serif,
 *  or self-host the woff2 on the deployment and point these at them, e.g.
 *  `${SERVER}/fonts/cinzel.woff2`. */
// TTF (not woff2): WeChat's on-device loadFontFace is unreliable with woff2,
// especially on Android — TTF works everywhere. Maoken is subset to GB2312 + all
// in-app text (7.2MB woff2 → 2.5MB ttf) so it downloads fast on mobile too.
export const FONT_MAOKEN = `${SERVER}/fonts/maoken-fengyasong.ttf`;
export const FONT_CINZEL = `${SERVER}/fonts/cinzel.ttf`;
export const FONT_CORMORANT = `${SERVER}/fonts/cormorant-garamond.ttf`;

/** Scene backdrops, keyed the same way as the web build's SceneBackdrop. */
export const SCENE_BASE = `${SERVER}/art`;

/* ── persistent local cache for remote images ──
 * Scene .webp files are downloaded once, saved to the user file system, and
 * served from the local path thereafter — so they don't re-download on every
 * cold launch. `<image>` renders local (wxfile://) paths reliably. */
const IMG_CACHE_KEY = "img-cache-v1";
let imgCache: Record<string, string> | null = null;
function imgCacheMap(): Record<string, string> {
  if (imgCache) return imgCache;
  let map: Record<string, string> = {};
  try {
    map = wx.getStorageSync(IMG_CACHE_KEY) || {};
    // drop entries whose saved file no longer exists
    const fs = wx.getFileSystemManager();
    let changed = false;
    for (const k of Object.keys(map)) {
      try { fs.accessSync(map[k]); } catch (e) { delete map[k]; changed = true; }
    }
    if (changed) wx.setStorageSync(IMG_CACHE_KEY, map);
  } catch (e) {
    map = {};
  }
  imgCache = map;
  return map;
}
export function cachedImage(url: string): string {
  const map = imgCacheMap();
  if (map[url]) return map[url];
  // return the network URL for now; fetch + save for the next launch
  try {
    wx.downloadFile({
      url,
      success: (res: any) => {
        if (res.statusCode !== 200) return;
        wx.getFileSystemManager().saveFile({
          tempFilePath: res.tempFilePath,
          success: (s: any) => {
            map[url] = s.savedFilePath;
            try { wx.setStorageSync(IMG_CACHE_KEY, map); } catch (e) { /* quota */ }
          },
          fail: () => { /* quota — refetch next time */ },
        });
      },
    });
  } catch (e) { /* ignore */ }
  return url;
}

export function sceneUrl(key: string): string {
  return cachedImage(`${SCENE_BASE}/scene-${key}.webp`);
}

/** Spirit family → scene key (mirrors the web SceneBackdrop; "amber" is reserved
 *  for the Home backdrop, so neutral drinks fall back to the hearth/highland). */
const SCENE_BY_FAMILY: Record<string, string> = {
  whiskyPeat: "coast", whisky: "highland", brandy: "highland",
  gin: "garden", absinthe: "garden", vodka: "snow",
  tequila: "desert", rum: "desert", campari: "night",
  vermouth: "coast", wine: "night", cream: "highland", default: "highland",
};
export function sceneForFamily(family: string): string {
  return sceneUrl(SCENE_BY_FAMILY[family] || "highland");
}
