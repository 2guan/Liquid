"use client";

import type { LayoutMode } from "@/hooks/useLayout";
import { RANKS } from "@/lib/data/catalog";
import {
  BADGE_GROUPS,
  BADGE_COUNT,
  evaluateBadges,
  statsFrom,
  type BadgeView,
} from "@/lib/data/achievements";
import { useAtelier } from "@/store/useAtelier";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { Icon, type IconName } from "@/components/art/icons";

export default function AchievementsScreen({ layout }: { layout: LayoutMode }) {
  const xp = useAtelier((s) => s.xp);
  const pours = useAtelier((s) => s.pours);
  const unlocked = useAtelier((s) => s.unlocked);
  const journal = useAtelier((s) => s.journal);
  const modes = useAtelier((s) => s.modes);
  const glassesUsed = useAtelier((s) => s.glassesUsed);
  const familiesUsed = useAtelier((s) => s.familiesUsed);
  const icesUsed = useAtelier((s) => s.icesUsed);
  const ingredientsUsed = useAtelier((s) => s.ingredientsUsed);
  const shares = useAtelier((s) => s.shares);
  const { meta, progress, next } = useAtelier((s) => s.rank)();

  const stats = statsFrom({
    xp,
    pours,
    journal: journal.length,
    unlocked: unlocked.length,
    modes,
    glassesUsed,
    familiesUsed,
    icesUsed,
    ingredientsUsed,
    shares,
  });
  const badges = evaluateBadges(stats);
  const byId = new Map(badges.map((b) => [b.id, b]));
  const doneCount = badges.filter((b) => b.done).length;

  const summary = [
    { label: "调制总数", value: pours, icon: "droplet" as const },
    { label: "徽章解锁", value: `${doneCount}/${BADGE_COUNT}`, icon: "trophy" as const },
    { label: "日记封存", value: journal.length, icon: "journal" as const },
    { label: "经验值", value: xp, icon: "sparkle" as const },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-8 md:py-6">
      <BilingualTitle zh="成就" en="Achievements" size="lg" />
      <Divider className="my-4" />

      {/* rank progress */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-cn text-xl text-paper">{meta.name}</p>
            <p className="font-title text-[10px] uppercase tracking-title text-gold/60">{meta.nameEn}</p>
          </div>
          <Icon name="trophy" size={30} className="text-gold/70" />
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink-soft">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-deep via-amber to-gold-bright" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-ui text-[11px] text-paper/45">
          <span>{xp} XP</span>
          <span>{next ? `距 ${next.name} 还需 ${next.minXp - xp} XP` : "已达最高阶位 · 液体诗人"}</span>
        </div>
        {/* full 12-tier ladder */}
        <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-6">
          {RANKS.map((r) => {
            const reached = xp >= r.minXp;
            const current = r.id === meta.id;
            return (
              <div
                key={r.id}
                className={`rounded-lg border p-2 text-center transition-colors ${
                  current ? "border-gold/70 bg-gold/15 shadow-amber-soft" : reached ? "border-gold/40 bg-gold/8" : "border-gold/12"
                }`}
              >
                <p className={`font-cn text-[11px] leading-tight ${reached ? "text-gold-bright" : "text-paper/40"}`}>{r.name}</p>
                <p className="font-ui text-[9px] text-paper/35">{r.minXp >= 1000 ? `${r.minXp / 1000}k` : r.minXp}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* summary stats */}
      <div className={`mt-5 grid gap-3 ${layout === "portrait" ? "grid-cols-2" : "grid-cols-4"}`}>
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-gold/15 bg-bg-secondary/50 p-4 text-center">
            <Icon name={s.icon} size={22} className="mx-auto text-gold/70" />
            <p className="mt-2 font-cn text-2xl text-paper">{s.value}</p>
            <p className="font-cn text-[11px] text-paper/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* badges, grouped */}
      <div className="mb-3 mt-7 flex items-end justify-between">
        <p className="font-title text-[11px] uppercase tracking-title text-gold/55">徽章 · Badges</p>
        <span className="font-cn text-xs text-paper/45">{doneCount} / {BADGE_COUNT}</span>
      </div>

      <div className="flex flex-col gap-6">
        {BADGE_GROUPS.map((group) => {
          const items = badges.filter((b) => b.group === group.id);
          if (!items.length) return null;
          const got = items.filter((b) => b.done).length;
          return (
            <section key={group.id}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-gold/30 text-gold/75">
                  <Icon name={group.icon as IconName} size={13} />
                </span>
                <span className="font-cn text-sm text-paper/85">{group.name}</span>
                <span className="font-serif text-[11px] italic text-gold/45">{group.nameEn}</span>
                <span className="ml-auto font-ui text-[10px] text-paper/35">{got}/{items.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 md:grid-cols-4 xl:grid-cols-6">
                {items.map((badge) => (
                  <BadgeTile key={badge.id} badge={byId.get(badge.id)!} groupIcon={group.icon as IconName} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function BadgeTile({ badge, groupIcon }: { badge: BadgeView; groupIcon: IconName }) {
  const { done, tierColor, progress } = badge;
  return (
    <div
      className={`relative flex flex-col items-center rounded-xl border p-2.5 text-center transition-colors ${
        done ? "bg-gold/[0.07]" : "border-gold/12 opacity-80"
      }`}
      style={done ? { borderColor: `${tierColor}99` } : undefined}
      title={badge.hint}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-full border"
        style={{
          borderColor: done ? tierColor : "rgba(200,164,93,0.2)",
          color: done ? tierColor : "rgba(231,214,177,0.35)",
          boxShadow: done ? `0 0 12px -4px ${tierColor}` : undefined,
        }}
      >
        <Icon name={done ? groupIcon : "lock"} size={16} />
      </span>
      <p className={`mt-1.5 font-cn text-[11px] leading-tight ${done ? "text-paper" : "text-paper/55"}`}>{badge.name}</p>
      <p className="font-title text-[7px] uppercase tracking-wide text-gold/45">+{badge.xp} XP</p>

      {done ? (
        <span className="mt-1 inline-flex items-center gap-0.5 font-cn text-[9px] text-gold-bright">
          <Icon name="check" size={9} /> 已解锁
        </span>
      ) : (
        <div className="mt-1.5 w-full">
          <div className="h-1 overflow-hidden rounded-full bg-ink-soft">
            <div className="h-full rounded-full bg-gold/60" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-0.5 font-ui text-[8px] text-paper/40">{badge.cur}/{badge.goal}</p>
        </div>
      )}
    </div>
  );
}
