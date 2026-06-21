"use client";

import LogoMark from "@/components/art/Logo";
import ModeEmblem from "@/components/art/ModeEmblem";
import { Icon } from "@/components/art/icons";
import { Flourish } from "@/components/ui/ornaments";
import { MODES } from "@/lib/data/catalog";
import { useNav } from "@/store/useNav";

/**
 * Landscape sidebar — brand emblem, the four mode entries, and the library
 * shortcut. Selected mode glows amber (design_system §6.1 hover/selected).
 */
export default function Sidebar() {
  const view = useNav((s) => s.view);
  const enterMode = useNav((s) => s.enterMode);
  const go = useNav((s) => s.go);
  const home = useNav((s) => s.home);

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-4 border-r border-gold/15 bg-bg-secondary/55 px-4 py-6 backdrop-blur-sm">
      {/* brand */}
      <button onClick={home} className="flex items-center gap-3 px-1 text-left">
        <LogoMark size={42} />
        <div>
          <div className="title-engrave font-cn text-lg leading-none" style={{ letterSpacing: "0.08em" }}>
            微醺时刻
          </div>
          <div className="font-serif text-[12px] italic text-gold/75">The Sip &amp; Sigh</div>
        </div>
      </button>

      <div className="flex justify-center py-0.5">
        <Flourish w={72} />
      </div>

      {/* mode nav */}
      <nav className="flex flex-1 flex-col gap-2">
        {MODES.map((m) => {
          const active = view === m.id;
          return (
            <button
              key={m.id}
              onClick={() => enterMode(m.id)}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? "border-gold/55 bg-gold/10 shadow-amber-soft"
                  : "border-transparent hover:border-gold/25 hover:bg-gold/5"
              }`}
            >
              {/* inner engraved hairline on the active entry */}
              {active && <span className="pointer-events-none absolute inset-[3px] rounded-[7px] border border-gold/20" aria-hidden />}
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors"
                style={{
                  borderColor: active ? "rgba(200,164,93,0.5)" : "rgba(200,164,93,0.18)",
                  color: active ? m.accent : "rgba(231,214,177,0.7)",
                }}
              >
                <ModeEmblem mode={m.id} size={30} />
              </span>
              <span className="min-w-0">
                <span className={`block font-cn text-[15px] ${active ? "title-engrave" : "text-paper/90"}`} style={{ letterSpacing: "0.04em" }}>
                  {m.name}
                </span>
                <span className="block truncate font-serif text-[11px] italic text-gold/65">{m.nameEn}</span>
              </span>
              {active && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-amber-glow animate-breathe" />}
            </button>
          );
        })}
      </nav>

      <div className="flex justify-center py-0.5">
        <Flourish w={72} />
      </div>

      {/* library + journal shortcuts */}
      <div className="flex flex-col gap-1.5">
        <SideLink active={view === "library"} icon="library" zh="酒库" en="Library" onClick={() => go("library")} />
        <SideLink active={view === "journal"} icon="journal" zh="微醺日记" en="Liquid Journal" onClick={() => go("journal")} />
      </div>
    </aside>
  );
}

function SideLink({
  active,
  icon,
  zh,
  en,
  onClick,
}: {
  active?: boolean;
  icon: "library" | "journal";
  zh: string;
  en: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
        active ? "bg-gold/10 text-gold-bright" : "text-paper/70 hover:bg-gold/5 hover:text-paper"
      }`}
    >
      <Icon name={icon} size={20} />
      <span>
        <span className="block font-cn text-sm">{zh}</span>
        <span className="block font-serif text-[11px] italic text-gold/55">{en}</span>
      </span>
    </button>
  );
}
