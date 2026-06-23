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
      success: () => { if (onOk) onOk(); },
      fail: () => { if (onFail) onFail(); },
    });
  } catch (e) {
    if (onFail) onFail();
  }
}

export function loadServerFont(family: string, url: string) {
  const key = `fontfile_${family}`;
  // 1) already cached locally?
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
      fail: () => loadFromPath(family, url),
    });
  } catch (e) {
    loadFromPath(family, url);
  }
}
