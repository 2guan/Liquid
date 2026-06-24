"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import { MOOD_PROMPTS, sampleSeeds, randomPrompt } from "@/lib/data/moods";
import { cocktailAI } from "@/lib/ai/cocktailAI";
import { maybeGradientPour } from "@/lib/tokens";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import Button from "@/components/ui/Button";
import { BilingualTitle, Chip, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";
import LoadingVeil from "@/components/ui/LoadingVeil";
import ModeEmblem from "@/components/art/ModeEmblem";

export default function MoodScreen({ layout }: { layout: LayoutMode }) {
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [veilLine, setVeilLine] = useState(0);
  const [placeholder, setPlaceholder] = useState(MOOD_PROMPTS[0]);
  // a fresh random 7–8 chips per mount
  const [seeds] = useState(() => sampleSeeds(7 + Math.floor(Math.random() * 2)));

  const setLastResult = useAtelier((s) => s.setLastResult);
  const addXp = useAtelier((s) => s.addXp);
  const recordDrink = useAtelier((s) => s.recordDrink);
  const showResult = useNav((s) => s.showResult);

  // rotate the placeholder prompt for inspiration
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholder((p) => MOOD_PROMPTS[(MOOD_PROMPTS.indexOf(p) + 1) % MOOD_PROMPTS.length]);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  // cycle the loading status lines while the AI composes
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setVeilLine((l) => l + 1), 900);
    return () => clearInterval(id);
  }, [busy]);

  const toggleTag = (t: string) =>
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function generate() {
    if (!text.trim() && tags.length === 0) return;
    setBusy(true);
    setVeilLine(0);
    sound.play("shake");
    const result = await cocktailAI.generateFromMood({ text: text.trim(), tags });
    maybeGradientPour(result); // ~20% get a smooth two-tone gradient body
    addXp(50);
    recordDrink(result, "mood");
    setLastResult(result, "mood");
    setBusy(false);
    showResult();
  }

  /* ── inspiration: drop in a random mood line, replacing whatever is there ── */
  function inspire() {
    setText((t) => randomPrompt(t.trim()));
    sound.play("click");
  }

  return (
    <div className="relative grid h-full place-items-center px-4 py-5 md:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-amber/80">
            <ModeEmblem mode="mood" size={layout === "portrait" ? 48 : 58} />
          </span>
          <BilingualTitle zh="心事" en="Whisper of Mood" align="center" />
          <p className="max-w-md font-cn text-sm leading-relaxed text-paper/55">
            把此刻的心情说给我听——我会为你斟一杯只属于今晚的酒。
          </p>
        </div>

        <Divider label="说出你的心情 · Tell Me How You Feel" className="my-5" />

        {/* aged-paper input */}
        <div className="relative rounded-xl border border-gold/25 paper-texture p-1 shadow-plate">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={layout === "portrait" ? 4 : 3}
            className="w-full resize-none rounded-lg bg-transparent px-4 py-3 font-cn text-[15px] leading-relaxed text-ink placeholder:text-ink/35 focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <button
              onClick={inspire}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 px-3 py-1.5 font-cn text-xs text-ink/60 transition-colors hover:border-ink/45"
            >
              <Icon name="feather" size={14} /> 来点灵感
            </button>
            <span className="font-ui text-[11px] text-ink/40">{text.length} 字</span>
          </div>
        </div>

        {/* emotion seeds */}
        <p className="mb-2 mt-5 font-cn text-xs text-paper/50">或者，点选一种心绪：</p>
        <div className="flex flex-wrap gap-2">
          {seeds.map((m) => (
            <Chip key={m.tag} active={tags.includes(m.tag)} onClick={() => toggleTag(m.tag)}>
              {m.label}
            </Chip>
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Button onClick={generate} disabled={busy || (!text.trim() && tags.length === 0)} className="px-8 py-3">
            <Icon name="sparkle" size={18} /> 为我调一杯
          </Button>
        </div>
      </div>

      <AnimatePresence>{busy && <LoadingVeil visible line={veilLine} />}</AnimatePresence>
    </div>
  );
}
