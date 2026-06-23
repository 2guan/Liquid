/**
 * Remote font loader. IMPORTANT: wx.loadFontFace's `source` MUST be an http(s)
 * URL — it downloads the font itself and REJECTS local file paths (wxfile://)
 * with "loadFontFace:fail downloadFile protocol must be http or https". So we
 * just hand it the https URL directly. The host must be in the mini-program's
 * downloadFile 合法域名 (loadFontFace fetches via downloadFile under the hood);
 * in DevTools tick 不校验合法域名. Fonts are TTF (woff2 is unreliable on-device,
 * esp. Android) and Maoken is subset to ~2.5MB so the fetch is quick.
 */
export function loadServerFont(family: string, url: string) {
  try {
    wx.loadFontFace({
      global: true,
      family,
      source: `url("${url}")`,
      scopes: ["webview", "native"],
      success: () => {
        console.log(`[font] loaded ${family}`);
      },
      fail: (err: any) => {
        // On a real device a failure here is almost always the domain not being
        // in downloadFile 合法域名, or an unsupported font format.
        console.warn(`[font] loadFontFace failed ${family} (${url}) — check downloadFile 合法域名 / font format`, err);
      },
    });
  } catch (e) {
    console.warn(`[font] loadFontFace threw ${family}`, e);
  }
}
