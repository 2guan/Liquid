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
export const FONT_MAOKEN = `${SERVER}/fonts/maoken-fengyasong.woff2`;
export const FONT_CINZEL = `${SERVER}/fonts/cinzel.woff2`;
export const FONT_CORMORANT = `${SERVER}/fonts/cormorant-garamond.woff2`;

/** Scene backdrops, keyed the same way as the web build's SceneBackdrop. */
export const SCENE_BASE = `${SERVER}/art`;
export function sceneUrl(key: string): string {
  return `${SCENE_BASE}/scene-${key}.webp`;
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
