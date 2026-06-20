"use client";

import RankBadge from "./RankBadge";
import { IconButton } from "@/components/ui/atoms";
import { useNav } from "@/store/useNav";
import { useAtelier } from "@/store/useAtelier";

/** Landscape top HUD: contextual back, spacer, rank badge + global actions. */
export default function TopBar() {
  const view = useNav((s) => s.view);
  const go = useNav((s) => s.go);
  const home = useNav((s) => s.home);
  const soundOn = useAtelier((s) => s.soundOn);
  const toggleSound = useAtelier((s) => s.toggleSound);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gold/12 px-6">
      <div className="flex items-center gap-3">
        {view !== "home" && (
          <IconButton icon="back" label="返回首页" onClick={home} />
        )}
        <span className="font-title text-[11px] uppercase tracking-title text-gold/40">
          {view === "home" ? "今日创作 · Today’s Craft" : ""}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <RankBadge />
        <div className="flex items-center gap-1.5">
          <IconButton icon="trophy" label="成就" active={view === "achievements"} onClick={() => go("achievements")} />
          <IconButton icon="journal" label="微醺日记" active={view === "journal"} onClick={() => go("journal")} />
          <IconButton icon={soundOn ? "sound-on" : "sound-off"} label={soundOn ? "静音" : "开启音效"} onClick={toggleSound} />
          <IconButton icon="settings" label="设置" onClick={() => go("achievements")} />
        </div>
      </div>
    </header>
  );
}
