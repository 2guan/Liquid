"use client";

import RankBadge from "./RankBadge";
import { IconButton } from "@/components/ui/atoms";
import { Flourish } from "@/components/ui/ornaments";
import { useNav } from "@/store/useNav";
import { useAtelier } from "@/store/useAtelier";

const SECTION: Record<string, { zh: string; en: string }> = {
  pure: { zh: "纯饮", en: "The Pure Pour" },
  mixology: { zh: "酒谱", en: "The Liquid Codex" },
  mood: { zh: "心事", en: "Whisper of Mood" },
  zen: { zh: "魔法", en: "The Alchemy Atelier" },
  library: { zh: "酒库", en: "The Cellar" },
  journal: { zh: "日记", en: "Journal" },
  achievements: { zh: "成就", en: "The Ledger" },
  settings: { zh: "设置", en: "Settings" },
  result: { zh: "酒卡", en: "The Tasting Card" },
};

/** Landscape top HUD: contextual back, engraved section title, rank + actions. */
export default function TopBar() {
  const view = useNav((s) => s.view);
  const go = useNav((s) => s.go);
  const home = useNav((s) => s.home);
  const soundOn = useAtelier((s) => s.soundOn);
  const toggleSound = useAtelier((s) => s.toggleSound);
  const section = SECTION[view];

  return (
    <header className="relative flex h-16 items-center justify-between gap-4 px-6">
      <span className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gold-line" aria-hidden />
      <div className="flex items-center gap-3">
        {view !== "home" && <IconButton icon="back" label="返回首页" onClick={home} />}
        {section && (
          <span className="flex items-baseline gap-2">
            <span className="title-engrave font-cn text-lg" style={{ letterSpacing: "0.08em" }}>
              {section.zh}
            </span>
            <span className="font-serif text-[13px] italic text-gold/65">{section.en}</span>
          </span>
        )}
      </div>

      {view === "home" && (
        <span className="absolute left-1/2 -translate-x-1/2">
          <Flourish w={28} />
        </span>
      )}

      <div className="flex items-center gap-4">
        <RankBadge />
        <div className="flex items-center gap-1.5">
          <IconButton icon="trophy" label="成就" active={view === "achievements"} onClick={() => go("achievements")} />
          <IconButton icon="journal" label="日记" active={view === "journal"} onClick={() => go("journal")} />
          <IconButton icon={soundOn ? "sound-on" : "sound-off"} label={soundOn ? "静音" : "开启音效"} onClick={toggleSound} />
          <IconButton icon="settings" label="设置" active={view === "settings"} onClick={() => go("settings")} />
        </div>
      </div>
    </header>
  );
}
