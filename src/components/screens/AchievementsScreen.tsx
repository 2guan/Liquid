"use client";

import type { LayoutMode } from "@/hooks/useLayout";
import { RANKS } from "@/lib/data/catalog";
import { useAtelier } from "@/store/useAtelier";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";

export default function AchievementsScreen({ layout }: { layout: LayoutMode }) {
  const xp = useAtelier((s) => s.xp);
  const pours = useAtelier((s) => s.pours);
  const unlocked = useAtelier((s) => s.unlocked);
  const journal = useAtelier((s) => s.journal);
  const { meta, progress, next } = useAtelier((s) => s.rank)();

  const stats = [
    { label: "调制总数", en: "Pours", value: pours, icon: "droplet" as const },
    { label: "日记封存", en: "Journal", value: journal.length, icon: "journal" as const },
    { label: "隐藏配方", en: "Secrets", value: unlocked.length, icon: "lock" as const },
    { label: "经验值", en: "XP", value: xp, icon: "sparkle" as const },
  ];

  const ACHIEVEMENTS = [
    { id: "first", name: "初次斟酌", en: "First Pour", got: pours >= 1, hint: "完成第一杯调制" },
    { id: "five", name: "渐入佳境", en: "Getting Warm", got: pours >= 5, hint: "累计调制 5 杯" },
    { id: "journal3", name: "情绪收藏家", en: "Collector", got: journal.length >= 3, hint: "封存 3 段流体记忆" },
    { id: "secret", name: "秘方猎人", en: "Secret Hunter", got: unlocked.length >= 1, hint: "解锁任意隐藏配方" },
    { id: "architect", name: "风味架构师", en: "Flavor Architect", got: xp >= 900, hint: "晋升至风味架构师" },
    { id: "master", name: "首席调酒师", en: "Master", got: xp >= 2000, hint: "登顶首席调酒师" },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-8 md:py-6">
      <BilingualTitle zh="成就 · 工坊档案" en="Achievements" size="lg" />
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
          <span>{next ? `距 ${next.name} 还需 ${next.minXp - xp} XP` : "已达最高阶位"}</span>
        </div>
        {/* ladder */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {RANKS.map((r) => {
            const reached = xp >= r.minXp;
            return (
              <div key={r.id} className={`rounded-lg border p-2 text-center ${reached ? "border-gold/45 bg-gold/10" : "border-gold/12"}`}>
                <p className={`font-cn text-[11px] ${reached ? "text-gold-bright" : "text-paper/40"}`}>{r.name}</p>
                <p className="font-ui text-[9px] text-paper/35">{r.minXp} XP</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* stats */}
      <div className={`mt-5 grid gap-3 ${layout === "portrait" ? "grid-cols-2" : "grid-cols-4"}`}>
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gold/15 bg-bg-secondary/50 p-4 text-center">
            <Icon name={s.icon} size={22} className="mx-auto text-gold/70" />
            <p className="mt-2 font-cn text-2xl text-paper">{s.value}</p>
            <p className="font-cn text-[11px] text-paper/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* achievement badges */}
      <p className="mb-3 mt-6 font-title text-[11px] uppercase tracking-title text-gold/55">徽章 · Badges</p>
      <div className={`grid gap-3 ${layout === "portrait" ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3"}`}>
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`flex items-center gap-3 rounded-xl border p-3.5 ${a.got ? "border-gold/40 bg-gold/8" : "border-gold/12 opacity-60"}`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${a.got ? "border-gold/50 text-gold-bright" : "border-gold/20 text-paper/40"}`}>
              <Icon name={a.got ? "trophy" : "lock"} size={20} />
            </span>
            <div className="min-w-0">
              <p className={`font-cn text-sm ${a.got ? "text-paper" : "text-paper/55"}`}>{a.name}</p>
              <p className="font-title text-[8px] uppercase tracking-wide text-gold/50">{a.en}</p>
              <p className="mt-0.5 font-cn text-[11px] text-paper/45">{a.hint}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
