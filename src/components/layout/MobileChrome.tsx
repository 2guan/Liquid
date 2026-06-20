"use client";

import LogoMark from "@/components/art/Logo";
import ModeEmblem from "@/components/art/ModeEmblem";
import { Icon } from "@/components/art/icons";
import { IconButton } from "@/components/ui/atoms";
import RankBadge from "./RankBadge";
import { MODES } from "@/lib/data/catalog";
import { useNav } from "@/store/useNav";
import type { ModeId } from "@/types";

/** Portrait top header — compact brand + rank + back. */
export function MobileHeader() {
  const view = useNav((s) => s.view);
  const home = useNav((s) => s.home);
  const go = useNav((s) => s.go);

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-gold/12 px-4">
      {view === "home" ? (
        <button onClick={home} className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="font-cn text-base text-paper" style={{ letterSpacing: "0.06em" }}>
            微醺时刻
          </span>
        </button>
      ) : (
        <IconButton icon="back" label="返回" onClick={home} />
      )}
      <div className="flex items-center gap-2">
        <RankBadge compact />
        <IconButton icon="journal" label="日记" size={18} onClick={() => go("journal")} />
      </div>
    </header>
  );
}

/** Portrait bottom tab bar — four modes + library. */
export function MobileTabBar() {
  const view = useNav((s) => s.view);
  const enterMode = useNav((s) => s.enterMode);
  const go = useNav((s) => s.go);

  const tabs: { id: ModeId | "library"; label: string }[] = [
    ...MODES.map((m) => ({ id: m.id, label: m.name.replace("模式", "") })),
    { id: "library", label: "酒库" },
  ];

  return (
    <nav className="flex items-stretch justify-around border-t border-gold/15 bg-bg-secondary/80 px-1 py-1.5 backdrop-blur-md">
      {tabs.map((t) => {
        const active = view === t.id;
        return (
          <button
            key={t.id}
            onClick={() => (t.id === "library" ? go("library") : enterMode(t.id))}
            className={`flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 transition-colors ${
              active ? "text-gold-bright" : "text-paper/55"
            }`}
          >
            <span className="grid h-6 place-items-center">
              {t.id === "library" ? <Icon name="library" size={22} /> : <ModeEmblem mode={t.id} size={24} />}
            </span>
            <span className="font-cn text-[10px]">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
