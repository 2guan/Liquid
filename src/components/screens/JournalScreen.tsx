"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { CocktailResult, JournalEntry } from "@/types";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import { modeById } from "@/lib/data/catalog";
import { servedFill } from "@/lib/data/glasses";
import { isFizzy } from "@/lib/tokens";
import { garnishesFor } from "@/lib/data/garnish";
import Glass from "@/components/art/Glass";
import SceneBackdrop from "@/components/art/SceneBackdrop";
import Button from "@/components/ui/Button";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";

function entryToResult(e: JournalEntry): CocktailResult {
  return {
    name: e.title,
    nameEn: e.titleEn,
    ingredients: e.recipe,
    ratio: e.recipe.map((i) => i.parts ?? 1),
    glass: e.glass,
    ice: e.ice,
    family: e.family,
    taste_profile: e.tasting_notes,
    story: e.ai_poem,
    emotion_mapping: "",
    hidden: e.hidden,
  };
}

const fmtDate = (ms: number) =>
  new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ms));

export default function JournalScreen({ layout }: { layout: LayoutMode }) {
  const journal = useAtelier((s) => s.journal);
  const remove = useAtelier((s) => s.removeFromJournal);
  const setLastResult = useAtelier((s) => s.setLastResult);
  const showResult = useNav((s) => s.showResult);
  const home = useNav((s) => s.home);

  function open(e: JournalEntry) {
    setLastResult(entryToResult(e), e.mode);
    showResult();
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-8 md:py-6">
      <div className="flex items-end justify-between">
        <BilingualTitle zh="日记" en="Liquid Journal" size="lg" />
        <span className="font-cn text-xs text-paper/45">{journal.length} 段记忆</span>
      </div>
      <Divider className="my-4" />

      {journal.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Icon name="journal" size={48} className="text-gold/30" />
          <p className="mt-4 font-cn text-paper/55">日记还是空的。</p>
          <p className="mt-1 font-cn text-sm text-paper/35">每一杯酒，都可以在这里被封存为一段心情。</p>
          <Button className="mt-5" onClick={home}>
            去调一杯
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${layout === "portrait" ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3"}`}>
          <AnimatePresence>
            {journal.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl border border-gold/20"
              >
                <button onClick={() => open(e)} className="block w-full text-left">
                  <div className="relative h-32 overflow-hidden">
                    <SceneBackdrop family={e.family} className="absolute inset-0 h-full w-full" />
                    {/* left scrim lifts the title; right black mask makes the glass pop */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-3/4 bg-gradient-to-l from-black/95 via-black/65 to-transparent" />

                    {/* glass on the right — vertically centred, pulled in from the edge */}
                    <div className="absolute inset-y-0 right-10 flex items-center">
                      <Glass glassType={e.glass} family={e.family} ice={e.ice} fillLevel={servedFill(e.glass)} fizzy={isFizzy(e.recipe)} garnishes={garnishesFor(e.recipe)} size={104} fit />
                    </div>

                    {/* title on the banner, left side */}
                    <div className="absolute inset-y-0 left-0 flex max-w-[58%] flex-col justify-center pl-6 pr-3">
                      <span
                        className="line-clamp-2 font-cn text-lg leading-tight text-paper"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)" }}
                      >
                        {e.title}
                      </span>
                      <span
                        className="mt-0.5 truncate font-serif text-sm italic text-gold-bright/90"
                        style={{ textShadow: "0 1px 5px rgba(0,0,0,0.95)" }}
                      >
                        {e.titleEn}
                      </span>
                      <span className="mt-1.5 w-fit rounded-full border border-gold/35 bg-black/40 px-2 py-0.5 font-cn text-[10px] text-gold/85">
                        {modeById(e.mode).name.replace("模式", "")}
                      </span>
                    </div>

                    {e.hidden && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-black/55 px-2 py-0.5 font-cn text-[10px] text-gold-bright">
                        <Icon name="lock" size={10} /> 隐藏
                      </span>
                    )}
                  </div>
                  <div className="bg-bg-secondary/80 px-4 py-3 backdrop-blur-sm">
                    <p className="line-clamp-2 font-cn text-[11px] leading-relaxed text-paper/55">
                      {e.ai_poem.replace(/\n.*$/, "")}
                    </p>
                    <p className="mt-2 font-ui text-[10px] text-paper/35">{fmtDate(e.createdAt)}</p>
                  </div>
                </button>
                <button
                  onClick={() => remove(e.id)}
                  className="absolute right-2 top-2 hidden h-7 w-7 place-items-center rounded-full border border-gold/30 bg-bg-primary/80 text-paper/60 hover:text-[#d98a7a] group-hover:grid"
                  aria-label="删除"
                >
                  <Icon name="trash" size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
