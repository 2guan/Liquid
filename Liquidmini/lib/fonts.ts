/**
 * Remote font loader with a persistent local cache.
 *
 * `wx.loadFontFace` downloads the font from an http(s) URL (via downloadFile,
 * which honours the app.json `networkTimeout.downloadFile`, default 60s). To
 * avoid re-downloading the ~2.5MB TTF on every cold launch, we save it to the
 * user file system once and load from that local path on subsequent launches.
 * The host must be in the mini-program's downloadFile 合法域名; in DevTools tick
 * 不校验合法域名. Fonts are TTF (woff2 is unreliable on-device, esp. Android).
 *
 * Loading a font from a LOCAL path isn't supported on every WeChat base library
 * (older ones reject it with "downloadFile protocol must be http or https"), so
 * this is best-effort: if a local load ever fails we mark it broken, fall back to
 * the URL, and never try the local path again — i.e. it can only be as slow as
 * the old URL-only behaviour, never slower long-term.
 */
const CACHE_KEY = "font-cache-v1"; // { [url]: savedLocalPath }
const BROKEN_KEY = "font-local-broken"; // true once a local load has failed

function getCache(): Record<string, string> {
  try {
    return wx.getStorageSync(CACHE_KEY) || {};
  } catch (e) {
    return {};
  }
}
function setCache(c: Record<string, string>) {
  try { wx.setStorageSync(CACHE_KEY, c); } catch (e) { /* ignore quota */ }
}
function localBroken(): boolean {
  try { return wx.getStorageSync(BROKEN_KEY) === true; } catch (e) { return false; }
}

export function loadServerFont(family: string, url: string) {
  const fs = wx.getFileSystemManager();

  const loadFrom = (source: string, fromCache: boolean) => {
    try {
      wx.loadFontFace({
        global: true,
        family,
        source: `url("${source}")`,
        scopes: ["webview", "native"],
        success: () => {
          console.log(`[font] loaded ${family} (${fromCache ? "cache" : "net"})`);
        },
        fail: (err: any) => {
          if (fromCache) {
            // this base library can't load a local font — stop trying it and
            // fall back to the URL (which also downloads it for this session).
            try {
              wx.setStorageSync(BROKEN_KEY, true);
              const c = getCache();
              delete c[url];
              setCache(c);
            } catch (e) { /* ignore */ }
            loadFrom(url, false);
          } else {
            console.warn(`[font] loadFontFace failed ${family} (${url}) — check downloadFile 合法域名 / font format`, err);
          }
        },
      });
    } catch (e) {
      console.warn(`[font] loadFontFace threw ${family}`, e);
    }
  };

  const downloadAndCache = () => {
    // never cache once local loading is known-broken (avoids a re-download loop)
    if (localBroken()) return;
    try {
      wx.downloadFile({
        url,
        success: (res: any) => {
          if (res.statusCode !== 200) return;
          fs.saveFile({
            tempFilePath: res.tempFilePath,
            success: (s: any) => {
              const c = getCache();
              c[url] = s.savedFilePath;
              setCache(c);
            },
            fail: () => { /* saveFile quota — ignore, we'll just refetch next time */ },
          });
        },
      });
    } catch (e) { /* ignore */ }
  };

  const cached = getCache()[url];
  if (cached && !localBroken()) {
    // verify the saved file still exists, then load it (no network)
    fs.access({
      path: cached,
      success: () => loadFrom(cached, true),
      fail: () => {
        const c = getCache();
        delete c[url];
        setCache(c);
        loadFrom(url, false);
        downloadAndCache();
      },
    });
  } else {
    // first launch (or local unsupported): load from the URL and cache for later
    loadFrom(url, false);
    downloadAndCache();
  }
}
