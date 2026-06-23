"use client";

import type { LayoutMode } from "@/hooks/useLayout";
import { useAtelier } from "@/store/useAtelier";
import { BilingualTitle, Divider, IconButton } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";

/**
 * Settings — split out of the workshop ledger so the Home "设置" entry lands on
 * its own page. Same in-world styling as the Achievements screen.
 */
export default function SettingsScreen({ layout }: { layout: LayoutMode }) {
  const soundOn = useAtelier((s) => s.soundOn);
  const toggleSound = useAtelier((s) => s.toggleSound);

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-8 md:py-6">
      <BilingualTitle zh="设置" en="Settings" size="lg" />
      <Divider className="my-4" />

      {/* 音效 */}
      <p className="mb-3 font-title text-[11px] uppercase tracking-title text-gold/55">音效 · Sound</p>
      <div className="flex items-center justify-between rounded-xl border border-gold/15 bg-bg-secondary/50 p-4">
        <div className="flex items-center gap-3">
          <Icon name={soundOn ? "sound-on" : "sound-off"} size={20} className="text-gold/70" />
          <div>
            <p className="font-cn text-sm text-paper">环境音效</p>
            <p className="font-cn text-[11px] text-paper/45">吧台白噪音与交互音效</p>
          </div>
        </div>
        <IconButton icon={soundOn ? "sound-on" : "sound-off"} label="切换音效" active={soundOn} onClick={toggleSound} />
      </div>

      {/* 关于 */}
      <p className="mb-3 mt-6 font-title text-[11px] uppercase tracking-title text-gold/55">关于 · About</p>
      <div className="rounded-xl border border-gold/15 bg-bg-secondary/50 p-5">
        <p className="title-engrave font-cn text-xl">微醺时刻</p>
        <p className="font-serif text-sm italic text-gold/75">The Sip &amp; Sigh</p>
        <p className="mt-3 font-cn text-[13px] leading-relaxed text-paper/60">
          一杯酒，一段心情，一场灵感。以代码实时合成的酒馆音景与离线 AI 调酒师，为你斟出此刻独属的风味。
        </p>
        <p className="mt-3 font-ui text-[11px] text-paper/35">v1.0 · EST 2024</p>
      </div>
    </div>
  );
}
