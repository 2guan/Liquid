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
  const musicOn = useAtelier((s) => s.musicOn);
  const sfxOn = useAtelier((s) => s.sfxOn);
  const setMusic = useAtelier((s) => s.setMusic);
  const setSfx = useAtelier((s) => s.setSfx);

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-8 md:py-6">
      <BilingualTitle zh="设置" en="Settings" size="lg" />
      <Divider className="my-4" />

      {/* 音效 */}
      <p className="mb-3 font-title text-[11px] uppercase tracking-title text-gold/55">音效 · Sound</p>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-gold/15 bg-bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <Icon name={musicOn ? "sound-on" : "sound-off"} size={20} className="text-gold/70" />
            <div>
              <p className="font-cn text-sm text-paper">背景音乐</p>
              <p className="font-cn text-[11px] text-paper/45">吧台爵士氛围乐</p>
            </div>
          </div>
          <IconButton icon={musicOn ? "sound-on" : "sound-off"} label="切换背景音乐" active={musicOn} onClick={() => setMusic(!musicOn)} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gold/15 bg-bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <Icon name={sfxOn ? "sound-on" : "sound-off"} size={20} className="text-gold/70" />
            <div>
              <p className="font-cn text-sm text-paper">按钮音效</p>
              <p className="font-cn text-[11px] text-paper/45">点击、倒酒、加冰等交互音</p>
            </div>
          </div>
          <IconButton icon={sfxOn ? "sound-on" : "sound-off"} label="切换按钮音效" active={sfxOn} onClick={() => setSfx(!sfxOn)} />
        </div>
      </div>

      {/* 关于 */}
      <p className="mb-3 mt-6 font-title text-[11px] uppercase tracking-title text-gold/55">关于 · About</p>
      <div className="rounded-xl border border-gold/15 bg-bg-secondary/50 p-5">
        <p className="title-engrave font-cn text-xl">微醺时刻</p>
        <p className="font-serif text-sm italic text-gold/75">The Sip &amp; Sigh</p>
        <p className="mt-3 font-cn text-[13px] leading-relaxed text-paper/60">
          夜色温柔，城市次第熄灯。这里没有喧嚣，只有一盏暖光、一段心事，和一杯为你而调的酒。说出此刻的心绪，光影便为你斟满杯盏，把悲欢酿成色泽与气味——或浓烈，或清浅，或层层流转。愿每一次微醺，都是与自己温柔相认的时刻。
        </p>
        <p className="mt-3 font-ui text-[11px] text-paper/35">v1.05</p>
      </div>
    </div>
  );
}
