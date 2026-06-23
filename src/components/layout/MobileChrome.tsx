"use client";

import ModeEmblem from "@/components/art/ModeEmblem";
import { Icon } from "@/components/art/icons";
import { IconButton } from "@/components/ui/atoms";
import { MODES } from "@/lib/data/catalog";
import { useNav } from "@/store/useNav";
import type { ModeId } from "@/types";

/** Portrait top header — back + brand on the left, journal + achievements right. */
export function MobileHeader() {
  const home = useNav((s) => s.home);
  const go = useNav((s) => s.go);

  return (
    <header className="relative flex h-14 items-center justify-between gap-2 px-4">
      {/* engraved gold hairline along the bottom edge */}
      <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gold-line" aria-hidden />

      <div className="flex items-center gap-2.5">
        <IconButton icon="back" label="返回首页" onClick={home} />
        <span className="title-engrave font-cn text-lg" style={{ letterSpacing: "0.08em" }}>
          微醺时刻
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <IconButton icon="journal" label="日记" size={18} onClick={() => go("journal")} />
        <IconButton icon="trophy" label="成就" size={18} onClick={() => go("achievements")} />
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
    <nav className="relative flex items-stretch justify-around bg-bg-secondary/85 px-1 pb-1.5 pt-2 backdrop-blur-md">
      {/* engraved gold hairline along the top edge */}
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gold-line" aria-hidden />
      {tabs.map((t) => {
        const active = view === t.id;
        return (
          <button
            key={t.id}
            onClick={() => (t.id === "library" ? go("library") : enterMode(t.id))}
            className="group flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ${
                active
                  ? "border-gold bg-gold/15 text-gold-bright shadow-[0_0_16px_-4px_rgba(216,156,58,0.7)]"
                  : "border-gold/30 bg-bg-primary/40 text-paper/60 group-hover:border-gold/55 group-hover:text-gold-bright"
              }`}
            >
              {t.id === "library" ? <Icon name="library" size={18} /> : <ModeEmblem mode={t.id} size={20} />}
            </span>
            <span className={`font-cn text-[10px] transition-colors ${active ? "text-gold-bright" : "text-paper/55"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
