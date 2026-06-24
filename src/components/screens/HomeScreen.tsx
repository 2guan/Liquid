"use client";

import { motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { ModeId, GlassType, IceType } from "@/types";
import type { SpiritFamily, LiquidLayer } from "@/lib/tokens";
import { MODES, type ModeMeta } from "@/lib/data/catalog";
import { useNav } from "@/store/useNav";
import Glass from "@/components/art/Glass";
import { garnishesFor } from "@/lib/data/garnish";
import { Flourish, Diamond, Candle, NavMedallion } from "@/components/ui/ornaments";

/* ── per-mode card theme + the drinks that sit on its little shelf ── */
/** A gradient pour for the 心事 card — 红黄蓝, blended (bottom → top: blue → red). */
const RAINBOW: LiquidLayer[] = [
  { color: "#3F6FD8", ratio: 1 }, // 蓝
  { color: "#F4D03F", ratio: 1 }, // 黄
  { color: "#E74C3C", ratio: 1 }, // 红
];
interface DrinkSpec {
  glass: GlassType;
  family: SpiritFamily;
  ice: IceType;
  fill: number;
  size: number;
  fizzy?: boolean;
  garnish?: string[];
  layers?: LiquidLayer[];
}
const THEME: Record<ModeId, { wash: [string, string]; glow: string; drinks: DrinkSpec[] }> = {
  pure: {
    wash: ["#5a4226", "#241809"],
    glow: "#D89C3A",
    drinks: [{ glass: "glencairn", family: "whisky", ice: "none", fill: 0.52, size: 184 }],
  },
  mixology: {
    wash: ["#3c4a30", "#171f12"],
    glow: "#9DB85F",
    drinks: [{ glass: "martini", family: "gin", ice: "none", fill: 0.9, size: 178, garnish: ["橄榄"] }],
  },
  mood: {
    wash: ["#2c3656", "#11162a"],
    glow: "#8AA0D8",
    drinks: [{ glass: "highball", family: "cranberry", ice: "none", fill: 0.92, size: 168, garnish: ["食用花"], layers: RAINBOW }],
  },
  zen: {
    wash: ["#3f3160", "#1a1230"],
    glow: "#B98AD8",
    drinks: [{ glass: "coupe", family: "green", ice: "none", fill: 0.9, size: 182, garnish: ["薄荷"] }],
  },
};

/** A vintage wax-seal stamp emblem. */
function WaxSeal({ size = 58 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="text-gold">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" strokeDasharray="1 3" />
      <defs>
        <path id="seal-top" d="M16,50 A34 34 0 0 1 84,50" />
      </defs>
      <text fontSize="8.5" fill="currentColor" fillOpacity="0.85" letterSpacing="1.5" fontFamily="Georgia, serif">
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">THE SIP &amp; SIGH</textPath>
      </text>
      {/* martini in the middle */}
      <g stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.85" fill="none" strokeLinecap="round">
        <path d="M37,42 L63,42 L50,57 Z" />
        <path d="M50,57 L50,66" />
        <path d="M42,67 L58,67" />
        <circle cx="55" cy="46.5" r="1.8" fill="currentColor" stroke="none" />
      </g>
      <text x="50" y="78" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.7" letterSpacing="2" fontFamily="Georgia, serif">
        ✦ EST · 2024 ✦
      </text>
    </svg>
  );
}

function DrinkScene({ mode }: { mode: ModeId }) {
  const d = THEME[mode].drinks[0];
  // `fill` + `fit` → the glass scales to the card's available height (keeps the
  // whole page on one screen at any size), and stays detailed (garnish/optics).
  return (
    <Glass
      glassType={d.glass}
      family={d.family}
      layers={d.layers}
      ice={d.ice}
      fillLevel={d.fill}
      fizzy={d.fizzy}
      garnishes={d.garnish ? garnishesFor(d.garnish.map((name) => ({ name }))) : undefined}
      fill
      fit
      className="h-full w-auto max-w-full"
    />
  );
}

/** One ornate "tarot card" mode entry. */
function ModeCard({ mode }: { mode: ModeMeta }) {
  const enterMode = useNav((s) => s.enterMode);
  const t = THEME[mode.id];
  return (
    <motion.button
      onClick={() => enterMode(mode.id)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-gold/40 text-center shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition-colors hover:border-gold/65"
      style={{ background: `linear-gradient(180deg, ${t.wash[0]}, ${t.wash[1]})` }}
    >
      {/* whole-card lighting & texture */}
      <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 55% at 50% 0%, ${t.glow}22, transparent 55%)` }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[14px] shadow-[inset_0_0_55px_rgba(0,0,0,0.5)]" />
      {/* inner hairline frame */}
      <span className="pointer-events-none absolute inset-[3px] z-20 rounded-[11px] border border-gold/20" />

      {/* title */}
      <div className="relative z-10 px-3 pt-4">
        <div
          className="font-cn text-2xl leading-none"
          style={{
            letterSpacing: "0.08em",
            color: "#F1DCA4",
            textShadow: "0 1px 5px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.5)",
          }}
        >
          {mode.name}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1">
          <Flourish w={10} />
          <span className="flex-1 text-center font-serif text-[11px] italic leading-tight text-gold/85">
            {mode.nameEn}
          </span>
          <Flourish w={10} />
        </div>
      </div>

      {/* the drink, lit on its shelf (or a painted scene, if supplied) */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-1">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(54% 42% at 50% 80%, ${t.glow}3a, transparent 72%)` }}
        />
        <DrinkScene mode={mode.id} />
      </div>

      {/* description */}
      <p className="relative z-10 whitespace-pre-line px-4 pb-4 pt-2 font-cn text-xs leading-relaxed text-paper/75">{mode.tagline}</p>

      {/* soft hover glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 90% at 50% 50%, ${t.glow}1f, transparent 70%)` }}
      />
    </motion.button>
  );
}

/** The hanging paper tag, top-left — slender & tall, with an engraved frame. */
function PaperTag() {
  return (
    <div className="paper-texture relative w-[86px] rotate-[-5deg] rounded-[5px] px-2.5 py-4 text-center shadow-[0_10px_24px_-14px_rgba(0,0,0,0.9)]">
      {/* punch hole */}
      <span className="absolute -top-2.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-[#7a5e36] bg-bg-primary/30" />
      {/* engraved double frame */}
      <span className="pointer-events-none absolute inset-[5px] rounded-[3px] border border-[#7a5e36]/55" />
      <span className="pointer-events-none absolute inset-[8px] rounded-[2px] border border-[#7a5e36]/25" />
      {/* hourglass emblem */}
      <span className="relative mx-auto mb-2 mt-1 block h-6 w-6">
        <svg viewBox="0 0 24 24" fill="none" className="text-[#6b5333]">
          <path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
      <p className="relative font-serif text-[10px] italic leading-snug text-[#5a4326]">
        Live in
        <br />
        the moment,
        <br />
        sip by sip.
      </p>
    </div>
  );
}

/** A ✦ separator, fixed-width and the height of the medallion icon (48px) so it
 *  sits vertically on the icon centre and horizontally midway between circles. */
function NavSep() {
  return (
    <span className="flex h-12 w-6 shrink-0 items-center justify-center">
      <Diamond />
    </span>
  );
}

export default function HomeScreen({ layout }: { layout: LayoutMode }) {
  const go = useNav((s) => s.go);
  const home = useNav((s) => s.home);
  const portrait = layout === "portrait";

  return (
    <div className="relative h-full overflow-hidden">
      {/* photographic backdrop (auto-fits via object-cover) + dark scrim so the
          engraved title, cards and nav stay legible over it */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/scene-amber.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-primary/65 via-bg-primary/30 to-bg-primary/75" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 42%, transparent 42%, rgba(14,11,8,0.45) 100%)" }}
      />

      <div className={`relative z-10 mx-auto flex h-full max-w-[1280px] flex-col ${portrait ? "px-3 pb-3 pt-3" : "px-8 pb-4 pt-3"}`}>
        {/* ── header ── */}
        <header className="relative flex shrink-0 flex-col items-center pb-3">
          <div className={`absolute left-0 top-0 origin-top-left ${portrait ? "scale-[0.7]" : ""}`}>
            <PaperTag />
          </div>
          <div className={`absolute right-0 flex items-start gap-3 ${portrait ? "top-6" : "top-0"}`}>
            <div className="hidden pt-1 sm:block">
              <WaxSeal size={portrait ? 50 : 60} />
            </div>
            {/* 退出 button temporarily hidden (flip to true to restore) */}
            {false && (
              <button onClick={home} className="group flex flex-col items-center gap-1" aria-label="退出">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-bg-secondary/50 transition-colors group-hover:border-gold">
                  <Candle size={18} />
                </span>
                <span className="font-cn text-[10px] text-paper/65">退出</span>
              </button>
            )}
          </div>

          {/* title block — centred; pushed down in portrait to clear the tag & exit */}
          <div className={`flex w-full flex-col items-center ${portrait ? "mt-8" : "mt-16"}`}>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="title-engrave font-cn"
              style={{
                letterSpacing: "0.14em",
                fontSize: portrait ? "2.2rem" : "3.1rem",
                lineHeight: 1.1,
                // drop-shadow (not text-shadow) so the gold gradient text keeps its
                // colour while gaining a dark halo over the photo backdrop
                filter: "drop-shadow(0 2px 9px rgba(0,0,0,0.85)) drop-shadow(0 1px 2px rgba(0,0,0,0.75))",
              }}
            >
              微醺时刻
            </motion.h1>
            <div
              className="-mt-0.5 font-serif italic text-gold"
              style={{ fontSize: portrait ? "1.25rem" : "1.7rem", letterSpacing: "0.04em", textShadow: "0 1px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.7)" }}
            >
              The Sip &amp; Sigh
            </div>
            <div className="mt-2 flex items-center gap-1.5 whitespace-nowrap font-cn text-paper/70" style={{ fontSize: portrait ? "11px" : "14px" }}>
              <Flourish w={portrait ? 12 : 22} />
              <span style={{ letterSpacing: "0.08em" }}>一杯酒，一段心情，一场灵感</span>
              <Flourish w={portrait ? 12 : 22} />
            </div>
          </div>
        </header>

        {/* ── the four crafts (a centred cluster, breathing room around it) ── */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-1">
          <div
            className={`grid h-full w-full gap-3 ${portrait ? "grid-cols-2 grid-rows-2" : "grid-cols-4 grid-rows-1"}`}
            style={portrait ? { maxWidth: 372, maxHeight: 640 } : { maxWidth: 980, maxHeight: 520 }}
          >
            {MODES.map((m) => (
              <ModeCard key={m.id} mode={m} />
            ))}
          </div>
        </div>

        {/* ── bottom nav ── equal-width medallions so the icon centres are evenly
            spaced; each ✦ sits in a fixed-width box aligned to the icon row, so
            it lands exactly halfway between two circles ── */}
        <footer className="mx-auto mt-3 flex w-full max-w-[460px] shrink-0 items-start">
          <NavMedallion className="flex-1" icon="library" zh="酒库" en="Cellar" onClick={() => go("library")} />
          <NavSep />
          <NavMedallion className="flex-1" icon="journal" zh="日记" en="Journal" onClick={() => go("journal")} />
          <NavSep />
          <NavMedallion className="flex-1" icon="trophy" zh="成就" en="Achievements" onClick={() => go("achievements")} />
          <NavSep />
          <NavMedallion className="flex-1" icon="settings" zh="设置" en="Settings" onClick={() => go("settings")} />
        </footer>
      </div>
    </div>
  );
}
