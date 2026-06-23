/**
 * Share helpers. The web build also renders a canvas "tasting card" PNG
 * (src/lib/share.ts); on the mini-program that belongs in a future iteration
 * using wx canvas + wx.canvasToTempFilePath. For now we expose the text blurb,
 * used for clipboard share and the native onShareAppMessage payload.
 */
import type { CocktailResult } from "./types";

export function shareText(result: CocktailResult): string {
  const m = result.story.match(/——\s*([^\n]+)\s*$/);
  const sig = (m && m[1] ? m[1].trim() : "") || "微醺时刻";
  return `《${result.name} · ${result.nameEn}》\n${result.story.replace(/\n.*$/, "")}\n—— ${sig}（微醺时刻 The Sip & Sigh）`;
}
