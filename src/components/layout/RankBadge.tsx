"use client";

import { useAtelier } from "@/store/useAtelier";
import { useMounted } from "@/hooks/useLayout";

/**
 * Workshop rank readout — avatar medallion + rank title + level + XP bar.
 * Mirrors the top-right HUD in the concept art ("风味架构师 · Lv / XP").
 *
 * XP is persisted in localStorage, so the value differs between the server
 * render (store default) and the rehydrated client. We gate the dynamic text
 * behind `useMounted()` so the server and first client paint agree, then fill in
 * the real values after hydration — avoiding a React hydration mismatch.
 */
export default function RankBadge({ compact = false }: { compact?: boolean }) {
  const mounted = useMounted();
  const xp = useAtelier((s) => s.xp);
  const { meta, next, progress } = useAtelier((s) => s.rank)();
  const level = Math.max(1, Math.floor(xp / 41));

  return (
    <div className="flex items-center gap-2.5">
      {/* avatar medallion */}
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 bg-gradient-to-b from-wood-light to-wood-dark shadow-amber-soft">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="9" r="4" fill="none" stroke="#E3C684" strokeWidth="1.4" />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" fill="none" stroke="#E3C684" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {!compact && (
        <div className="min-w-[138px]" suppressHydrationWarning>
          <div className="flex items-baseline justify-between gap-2 leading-none">
            <span className="font-cn text-[13px] text-paper">{mounted ? meta.name : " "}</span>
            <span className="font-ui text-[10px] text-gold/80">{mounted ? `Lv.${level}` : " "}</span>
          </div>
          <p className="font-title text-[8px] uppercase leading-tight tracking-title text-gold/55">{mounted ? meta.nameEn : " "}</p>
          {/* xp bar */}
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ink-soft/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-deep via-amber to-gold-bright transition-[width] duration-700"
              style={{ width: mounted ? `${Math.round(progress * 100)}%` : "0%" }}
            />
          </div>
          <p className="mt-0.5 text-right font-ui text-[8px] leading-none text-paper/40">
            {mounted ? (next ? `${xp} / ${next.minXp} XP` : "MAX") : " "}
          </p>
        </div>
      )}
    </div>
  );
}
