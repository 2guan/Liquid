/** Achievements — the workshop ledger. Ported from AchievementsScreen.tsx.
 *  (Sound/settings moved to the dedicated settings-screen.) */
import { RANKS } from "../../lib/data/catalog";
import { store } from "../../lib/store";

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
    badges: [] as any[],
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
      const journalN = s.journal.length;
      const unlockedN = s.unlocked.length;
      const pours = s.pours;
      this.setData({
        rankName: meta.name,
        rankNameEn: meta.nameEn,
        progressPct: Math.round(progress * 100),
        xp,
        nextText: next ? `距 ${next.name} 还需 ${next.minXp - xp} XP` : "已达最高阶位",
        ranks: RANKS.map((r) => ({ id: r.id, name: r.name, minXp: r.minXp, reached: xp >= r.minXp })),
        stats: [
          { label: "调制总数", value: pours, icon: "droplet" },
          { label: "日记封存", value: journalN, icon: "journal" },
          { label: "隐藏配方", value: unlockedN, icon: "lock" },
          { label: "经验值", value: xp, icon: "sparkle" },
        ],
        badges: [
          { id: "first", name: "初次斟酌", en: "First Pour", got: pours >= 1, hint: "完成第一杯调制" },
          { id: "five", name: "渐入佳境", en: "Getting Warm", got: pours >= 5, hint: "累计调制 5 杯" },
          { id: "journal3", name: "情绪收藏家", en: "Collector", got: journalN >= 3, hint: "封存 3 段流体记忆" },
          { id: "secret", name: "秘方猎人", en: "Secret Hunter", got: unlockedN >= 1, hint: "解锁任意隐藏配方" },
          { id: "architect", name: "风味架构师", en: "Flavor Architect", got: xp >= 900, hint: "晋升至风味架构师" },
          { id: "master", name: "首席调酒师", en: "Master", got: xp >= 2000, hint: "登顶首席调酒师" },
        ],
      });
    },
  },
});
