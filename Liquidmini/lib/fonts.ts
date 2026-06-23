/**
 * Remote font loader. WeChat's renderer often fails `wx.loadFontFace` on a large
 * REMOTE url (net::ERR_CACHE_MISS / "Failed to decode", as the 7MB Maoken serif
 * hit). The reliable pattern is: download the file once, persist it to the
 * user-data dir, and loadFontFace from the LOCAL path — fast on every later
 * launch, no re-download. Falls back through temp-file → direct-URL so the worst
 * case still attempts a load (and otherwise the WXSS stack falls back to Songti).
 */

function loadFromPath(family: string, path: string, onOk?: () => void, onFail?: () => void) {
  try {
    wx.loadFontFace({
      global: true,
      family,
      source: `url("${path}")`,
      scopes: ["webview", "native"],
      success: () => { console.log(`[font] loaded ${family} from ${path}`); if (onOk) onOk(); },
      fail: (err: any) => { console.warn(`[font] loadFontFace failed ${family} from ${path}`, err); if (onFail) onFail(); },
    });
  } catch (e) {
    console.warn(`[font] loadFontFace threw ${family}`, e);
    if (onFail) onFail();
  }
}

/** djb2 — short stable hash so the cache invalidates when the font URL changes. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function loadServerFont(family: string, url: string) {
  // key includes the URL hash so changing the file (e.g. woff2 → ttf) forces a
  // fresh download instead of re-loading a stale cached file.
  const key = `fontfile_${family}_${hash(url)}`;
  // 1) already cached locally for THIS url?
  try {
    const cached = wx.getStorageSync(key);
    if (cached) {
      const fs = wx.getFileSystemManager();
      try {
        fs.accessSync(cached); // throws if missing
        loadFromPath(family, cached, undefined, () => downloadAndLoad(family, url, key));
        return;
      } catch (e) {
        /* file gone — re-download */
      }
    }
  } catch (e) { /* storage unavailable */ }
  downloadAndLoad(family, url, key);
}

function downloadAndLoad(family: string, url: string, key: string) {
  try {
    wx.downloadFile({
      url,
      success: (res: any) => {
        if (res.statusCode !== 200 || !res.tempFilePath) {
          console.warn(`[font] download ${family} bad status`, res && res.statusCode);
          loadFromPath(family, url); // last resort: direct URL
          return;
        }
        // persist for next launch, then load from the saved path
        try {
          const fs = wx.getFileSystemManager();
          const dest = `${wx.env.USER_DATA_PATH}/${family.replace(/\W+/g, "_")}.font`;
          fs.saveFile({
            tempFilePath: res.tempFilePath,
            filePath: dest,
            success: () => {
              try { wx.setStorageSync(key, dest); } catch (e) {}
              loadFromPath(family, dest, undefined, () => loadFromPath(family, res.tempFilePath));
            },
            fail: () => loadFromPath(family, res.tempFilePath),
          });
        } catch (e) {
          loadFromPath(family, res.tempFilePath);
        }
      },
      fail: (err: any) => {
        // downloadFile blocked on a real device almost always means the domain
        // isn't in the downloadFile 合法域名 allowlist (mp.weixin.qq.com → 开发设置).
        console.warn(`[font] downloadFile failed ${family} — check downloadFile 合法域名 for the host`, err);
        loadFromPath(family, url);
      },
    });
  } catch (e) {
    console.warn(`[font] downloadFile threw ${family}`, e);
    loadFromPath(family, url);
  }
}
