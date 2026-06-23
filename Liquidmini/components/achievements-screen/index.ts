/** Achievements — the workshop ledger: rank ladder, stats, 62-badge grid. */
import { RANKS } from "../../lib/data/catalog";
import { BADGE_GROUPS, BADGE_COUNT, evaluateBadges, statsFrom } from "../../lib/data/achievements";
import { store } from "../../lib/store";

function kxp(n: number): string {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    rankName: "",
    rankNameEn: "",
    progressPct: 0,
    xp: 0,
    nextText: "",
    ranks: [] as any[],
    stats: [] as any[],
    groups: [] as any[],
    doneCount: 0,
    total: BADGE_COUNT,
  },

  _unsub: null as null | (() => void),

  lifetimes: {
    attached() {
      this._unsub = store.subscribe((s) => this.rebuild(s));
    },
    detached() {
      if (this._unsub) this._unsub();
    },
  },

  methods: {
    rebuild(s: any) {
      const { meta, progress, next } = store.rank();
      const xp = s.xp;

      const stats = statsFrom({
        xp,
        pours: s.pours,
        journal: s.journal.length,
        unlocked: s.unlocked.length,
        modes: s.modes,
        glassesUsed: s.glassesUsed,
        familiesUsed: s.familiesUsed,
        icesUsed: s.icesUsed,
        ingredientsUsed: s.ingredientsUsed,
        shares: s.shares,
      });
      const badges = evaluateBadges(stats);
      const doneCount = badges.filter((b) => b.done).length;

      const groups = BADGE_GROUPS.map((g) => {
        const items = badges
          .filter((bb) => bb.group === g.id)
          .map((bb) => ({
            id: bb.id,
            name: bb.name,
            hint: bb.hint,
            done: bb.done,
            xp: bb.xp,
            cur: bb.cur,
            goal: bb.goal,
            pct: Math.round(bb.progress * 100),
            icon: bb.done ? g.icon : "lock",
            color: bb.done ? bb.tierColor : "#8a7a5a",
          }));
        return {
          id: g.id,
          name: g.name,
          nameEn: g.nameEn,
          icon: g.icon,
          got: items.filter((i) => i.done).length,
          total: items.length,
          items,
        };
      }).filter((g) => g.total > 0);

      this.setData({
        rankName: meta.name,
        rankNameEn: meta.nameEn,
        progressPct: Math.round(progress * 100),
        xp,
        nextText: next ? `距 ${next.name} 还需 ${next.minXp - xp} XP` : "已达最高阶位 · 液体诗人",
        ranks: RANKS.map((r) => ({ id: r.id, name: r.name, xp: kxp(r.minXp), reached: xp >= r.minXp, current: r.id === meta.id })),
        stats: [
          { label: "调制总数", value: s.pours, icon: "droplet" },
          { label: "徽章解锁", value: `${doneCount}/${BADGE_COUNT}`, icon: "trophy" },
          { label: "日记封存", value: s.journal.length, icon: "journal" },
          { label: "经验值", value: xp, icon: "sparkle" },
        ],
        groups,
        doneCount,
      });
    },
  },
});
