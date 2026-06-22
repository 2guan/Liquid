"use client";

import { Icon, type IconName } from "@/components/art/icons";

/**
 * Shared decorative vocabulary for the whole app — the same hand-drawn,
 * apothecary-bar ornaments used on the Home landing (Flourish dividers, brass
 * medallions, candle marks). Centralised here so every screen and the chrome
 * read as one continuous world.
 */

/** A thin gold rule flanking a tiny ✦, used as an inline divider/underline. */
export function Flourish({ w = 18 }: { w?: number }) {
  return (
    <span className="inline-flex items-center text-gold/55" aria-hidden>
      <span style={{ width: w }} className="h-px bg-gradient-to-r from-transparent to-gold/55" />
      <span className="mx-1 text-[8px]">✦</span>
      <span style={{ width: w }} className="h-px bg-gradient-to-l from-transparent to-gold/55" />
    </span>
  );
}

/** A lone faint ✦ used to separate nav medallions. */
export function Diamond() {
  return (
    <span className="select-none text-[10px] text-gold/30" aria-hidden>
      ✦
    </span>
  );
}

/** A small lit-candle glyph (the "exit / home" mark). */
export function Candle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5.5" rx="2" ry="3" fill="#F0B14B" opacity="0.4" />
      <path d="M12 3.2c1.4 1 1.4 2.6 0 3.6-1.4-1-1.4-2.6 0-3.6Z" fill="#F6D27A" />
      <path d="M12 4.4c.7.6.7 1.5 0 2.1-.7-.6-.7-1.5 0-2.1Z" fill="#FFF3D0" />
      <rect x="9.4" y="8" width="5.2" height="11" rx="1.4" fill="none" stroke="#C8A45D" strokeWidth="1.2" />
      <path d="M9.4 12c1.6 1.2 3.6 1.2 5.2 0" stroke="#C8A45D" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

/**
 * A circular brass medallion with an icon + bilingual caption — the Home
 * footer nav unit, reused for the portrait tab bar and any in-world nav.
 */
export function NavMedallion({
  icon,
  zh,
  en,
  active,
  size = 48,
  className = "",
  onClick,
}: {
  icon: IconName;
  zh: string;
  en?: string;
  active?: boolean;
  size?: number;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`group flex flex-col items-center gap-1.5 ${className}`} title={zh}>
      <span
        style={{ height: size, width: size }}
        className={`grid place-items-center rounded-full border transition-all duration-300 ${
          active
            ? "border-gold bg-gold/15 text-gold-bright shadow-[0_0_18px_-4px_rgba(216,156,58,0.7)]"
            : "border-gold/40 bg-bg-secondary/50 text-gold/80 group-hover:border-gold group-hover:text-gold-bright group-hover:shadow-[0_0_18px_-4px_rgba(216,156,58,0.7)]"
        }`}
      >
        <Icon name={icon} size={Math.round(size * 0.46)} />
      </span>
      <span className="leading-tight">
        <span className={`block font-cn text-xs transition-colors ${active ? "text-gold-bright" : "text-paper/80 group-hover:text-gold-bright"}`}>
          {zh}
        </span>
        {en && <span className="block font-title text-[8px] uppercase tracking-[0.22em] text-gold/45">{en}</span>}
      </span>
    </button>
  );
}

/**
 * A sticky footer for the step machines — keeps 上一步 / 下一步 pinned to the
 * bottom of the viewport on portrait phones, with extra bottom padding (plus
 * the safe-area inset) so the buttons clear large rounded corners / home bars.
 * On wide (landscape) screens it collapses back to an inline action row.
 */
export function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-3 flex items-center justify-between gap-3 border-t border-gold/15 bg-bg-primary/85 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-3 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
      {children}
    </div>
  );
}

/**
 * A reusable in-world header: engraved Chinese title, serif-italic English,
 * and a flourish underline — the brand treatment lifted from the Home title,
 * sized down for section headers. An optional `aside` sits at the right edge.
 */
export function PageHeading({
  zh,
  en,
  aside,
  align = "left",
  className = "",
}: {
  zh: string;
  en?: string;
  aside?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div className={align === "center" ? "mx-auto text-center" : ""}>
        <h2 className="title-engrave font-cn text-2xl leading-none md:text-3xl" style={{ letterSpacing: "0.08em" }}>
          {zh}
        </h2>
        <div className={`mt-1.5 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
          {en && <span className="font-serif text-[13px] italic text-gold/85">{en}</span>}
          <Flourish w={16} />
        </div>
      </div>
      {aside && <div className="shrink-0 pb-1">{aside}</div>}
    </div>
  );
}
