"use client";

import ModeEmblem from "@/components/art/ModeEmblem";
import { Icon } from "@/components/art/icons";
import type { ModeMeta } from "@/lib/data/catalog";
import { useNav } from "@/store/useNav";

/** Illustrated entry card for a mode. `variant` tunes density for hero vs list. */
export default function ModeCard({
  mode,
  variant = "tile",
}: {
  mode: ModeMeta;
  variant?: "tile" | "row";
}) {
  const enterMode = useNav((s) => s.enterMode);

  if (variant === "row") {
    return (
      <button
        onClick={() => enterMode(mode.id)}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border border-gold/20 wood-panel px-4 py-3.5 text-left transition-all duration-300 hover:border-gold/45 active:scale-[0.99]"
      >
        <span
          className="absolute inset-y-0 left-0 w-1 opacity-70 transition-opacity group-hover:opacity-100"
          style={{ background: `linear-gradient(${mode.accent}, transparent)` }}
        />
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-gold/25"
          style={{ color: mode.accent }}
        >
          <ModeEmblem mode={mode.id} size={32} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-cn text-base text-paper group-hover:text-gold-bright">{mode.name}</span>
          <span className="block font-title text-[9px] uppercase tracking-wide text-gold/55">{mode.nameEn}</span>
          <span className="mt-0.5 block truncate font-cn text-xs text-paper/55">{mode.tagline}</span>
        </span>
        <Icon name="forward" size={18} className="text-gold/50 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
      </button>
    );
  }

  return (
    <button
      onClick={() => enterMode(mode.id)}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-gold/20 wood-panel p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-plate"
    >
      <span
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: mode.accent }}
      />
      <span className="grid h-14 w-14 place-items-center rounded-lg border border-gold/25 transition-colors group-hover:border-gold/50" style={{ color: mode.accent }}>
        <ModeEmblem mode={mode.id} size={38} />
      </span>
      <span className="mt-4">
        <span className="block font-cn text-lg text-paper group-hover:text-gold-bright">{mode.name}</span>
        <span className="block font-title text-[10px] uppercase tracking-title text-gold/60">{mode.nameEn}</span>
        <span className="mt-2 block font-cn text-xs leading-relaxed text-paper/55">{mode.tagline}</span>
      </span>
      <span className="mt-4 inline-flex items-center gap-1 font-title text-[10px] uppercase tracking-wide text-gold/60 transition-colors group-hover:text-gold">
        进入 · Enter
        <Icon name="forward" size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
