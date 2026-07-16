"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import { modeById, glassById, iceById } from "@/lib/data/catalog";
import { servedFill } from "@/lib/data/glasses";
import { liquidRamp, isFizzy } from "@/lib/tokens";
import { makePrepSteps, normalizePrepStepsGlass } from "@/lib/prepSteps";
import { garnishesFor } from "@/lib/data/garnish";
import Glass from "@/components/art/Glass";
import { Ice } from "@/components/art/Ice";
import SceneBackdrop from "@/components/art/SceneBackdrop";
import Button from "@/components/ui/Button";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";
import { downloadShareCard, shareText } from "@/lib/share";
import { sound } from "@/lib/sound";

/** The liquid body-colour for an ingredient's family — used as a recipe bullet. */
const dotColor = (fam: string): string =>
  (liquidRamp[fam as keyof typeof liquidRamp] ?? liquidRamp.default)[1];

/** Glassware / ice indicator: art on a dark brass medallion so the light-stroked
 *  SVG stays visible against the pale paper of the recipe book. */
function ServeChip({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-gradient-to-b from-wood-light to-wood-dark shadow-engrave ring-1 ring-ink/10">
        {children}
      </span>
      <div className="leading-tight">
        <span className="block font-cn text-sm text-ink">{label}</span>
        <span className="block font-title text-[8px] uppercase tracking-wide text-ink/45">{sub}</span>
      </div>
    </div>
  );
}

export default function ResultScreen({ layout }: { layout: LayoutMode }) {
  const last = useAtelier((s) => s.lastResult);
  const saveToJournal = useAtelier((s) => s.saveToJournal);
  const addXp = useAtelier((s) => s.addXp);
  const recordShare = useAtelier((s) => s.recordShare);
  const home = useNav((s) => s.home);
  const fromJournal = useNav((s) => s.origin) === "journal";
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const isLand = layout !== "portrait";

  if (!last) {
    return (
      <div className="grid h-full place-items-center">
        <div className="text-center">
          <p className="font-cn text-paper/60">还没有作品。先去调一杯吧。</p>
          <Button className="mt-4" onClick={home}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const { result, mode } = last;
  const modeMeta = modeById(mode);
  const modelSteps = normalizePrepStepsGlass(result, result.steps);
  const prepSteps = modelSteps.length ? modelSteps : makePrepSteps(result);

  // Split the witty sign-off (落款) off the poem so it can be right-aligned,
  // book-inscription style, under the body of the narrative.
  const sigMatch = result.story.match(/\n?\s*——\s*([^\n]+)\s*$/);
  const storyBody = sigMatch ? result.story.slice(0, sigMatch.index).trimEnd() : result.story;
  const storySig = sigMatch ? sigMatch[1].trim() : null;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function handleSave() {
    if (saved) {
      flash("已在日记中");
      return;
    }
    saveToJournal({
      title: result.name,
      titleEn: result.nameEn,
      mode,
      drink: result.name,
      glass: result.glass,
      ice: result.ice,
      family: result.family,
      recipe: result.ingredients,
      tasting_notes: result.taste_profile,
      ai_poem: result.story,
      liquidColor: result.liquidColor,
      fillLevel: result.fillLevel,
      hidden: result.hidden,
      layers: result.layers,
      steps: prepSteps,
      iceSeed: result.iceSeed,
    });
    addXp(20);
    setSaved(true);
    sound.play("save");
    flash("已封存进日记 ✦");
  }

  async function handleShare() {
    recordShare();
    try {
      if (navigator.share) {
        await navigator.share({ title: result.name, text: shareText(result) });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(shareText(result));
      flash("分享文案已复制");
    } catch {
      flash("已生成分享内容");
    }
  }

  /* ── hero banner (glass on its world + title + actions) ── */
  const hero = (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20">
      {/* scene: dimmed + dark scrim so the title is always legible over it */}
      <div className="absolute inset-0">
        <SceneBackdrop family={result.family} className="h-full w-full opacity-40" />
        <div className="absolute inset-0 bg-bg-primary/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/45 to-bg-primary/30" />
      </div>

      <div className={`relative ${isLand ? "flex items-center gap-8 px-8 py-7" : "flex flex-col items-center px-6 py-8"}`}>
        <motion.button
          type="button"
          onClick={() => setZoom(true)}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="group relative shrink-0 cursor-zoom-in"
          aria-label="放大酒杯"
        >
          <Glass glassType={result.glass} family={result.family} liquidColor={result.liquidColor} layers={result.layers} ice={result.ice} iceSeed={result.iceSeed} fillLevel={result.fillLevel ?? servedFill(result.glass)} glow fizzy={isFizzy(result.ingredients)} garnishes={garnishesFor(result.ingredients)} size={isLand ? 200 : 170} />
          <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-ink/55 px-2.5 py-0.5 font-cn text-[10px] text-gold/75 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            点击放大
          </span>
        </motion.button>

        <div className={`flex flex-col gap-1.5 ${isLand ? "items-start" : "items-center"}`}>
          {result.hidden && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 font-cn text-xs text-gold-bright shadow-amber-soft">
              <Icon name="lock" size={13} /> 隐藏配方解锁
            </span>
          )}
          <span className="font-title text-[10px] uppercase tracking-title text-gold/70">{modeMeta.nameEn}</span>
          <h1
            className={`font-cn text-3xl text-paper md:text-4xl ${isLand ? "text-left" : "text-center"}`}
            style={{ letterSpacing: "0.05em", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
          >
            {result.name}
          </h1>
          <p className="font-serif text-lg italic text-gold-bright/90">{result.nameEn}</p>
          {result.emotion_mapping && (
            <p className={`mt-1.5 max-w-md font-serif text-sm italic leading-relaxed text-paper/75 ${isLand ? "text-left" : "text-center"}`}>
              {result.emotion_mapping}
            </p>
          )}
          <div className={`mt-4 flex flex-wrap items-center gap-3 ${isLand ? "" : "justify-center"}`}>
            {/* opened from the journal → it's already saved, hide the save action */}
            {fromJournal ? null : (
              <Button variant="primary" onClick={handleSave}>
                <Icon name={saved ? "check" : "save"} size={16} /> {saved ? "已加入" : "加入日记"}
              </Button>
            )}
            <Button variant="ghost" onClick={handleShare}>
              <Icon name="share" size={16} /> 文字分享
            </Button>
            <Button variant="ghost" onClick={() => downloadShareCard(result)}>
              <Icon name="droplet" size={16} /> 保存酒卡
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── open recipe book ── */
  const book = (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 paper-texture">
      <div className="grid gap-0 lg:grid-cols-3">
        {/* left page — recipe */}
        <div className="relative p-5 md:p-7">
          <div className="flex items-center gap-2 text-copper">
            <Icon name="droplet" size={18} />
            <BilingualTitle zh="专属配方" en="The Recipe" size="sm" tone="ink" />
          </div>
          <ul className="mt-4 divide-y divide-ink/10">
            {result.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2.5">
                <span
                  className="relative top-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-ink/25"
                  style={{ background: dotColor(ing.family ?? result.family) }}
                />
                <span className="min-w-0 flex-1 font-cn text-[15px] leading-snug text-ink">
                  {ing.name}
                  {ing.nameEn && <span className="ml-1.5 font-serif text-xs italic text-ink/45">{ing.nameEn}</span>}
                </span>
                <span className="shrink-0 whitespace-nowrap font-cn text-[15px] text-copper">{ing.amount}</span>
              </li>
            ))}
          </ul>

          <Divider className="my-5 opacity-50" />
          <div className="flex flex-wrap items-center gap-3">
            <ServeChip label={glassById(result.glass).name} sub="Glassware">
              <Glass glassType={result.glass} family={result.family} fillLevel={0.35} fizzy={isFizzy(result.ingredients)} size={30} fit />
            </ServeChip>
            <ServeChip label={iceById(result.ice).name} sub="Ice">
              <Ice type={result.ice} size={28} />
            </ServeChip>
          </div>
        </div>

        {/* middle page — method */}
        <div className="relative border-t border-ink/10 p-5 lg:border-l lg:border-t-0 lg:p-7">
          <div className="flex items-center gap-2 text-copper">
            <Icon name="stir" size={18} />
            <BilingualTitle zh="操作指导" en="Method" size="sm" tone="ink" />
          </div>
          <ol className="mt-4 space-y-3">
            {prepSteps.map((step, i) => (
              <li key={`${i}-${step}`} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-copper/30 bg-copper/10 font-ui text-[11px] text-copper">
                  {i + 1}
                </span>
                <span className="font-cn text-[15px] leading-loose text-ink/82">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* right page — tasting */}
        <div className="relative border-t border-ink/10 p-5 lg:border-l lg:border-t-0 lg:p-7">
          <div className="flex items-center gap-2 text-copper">
            <Icon name="sparkle" size={18} />
            <BilingualTitle zh="品酒指南" en="Tasting Notes" size="sm" tone="ink" />
          </div>
          <p className="mt-4 font-cn text-[15px] leading-loose text-ink/80">{result.taste_profile}</p>
          <Divider className="my-4 opacity-60" />
          <p className="whitespace-pre-line font-cn text-[15px] leading-loose text-ink/85">{storyBody}</p>
          {storySig && (
            <p className="mt-3 text-right font-cn text-[13px] italic text-ink/60">—— {storySig}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-full overflow-y-auto px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {hero}
        {book}
        <div className="flex justify-center pb-4">
          <Button variant="ghost" onClick={home}>
            <Icon name="home" size={16} /> 返回工坊
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold/40 bg-bg-secondary/95 px-5 py-2.5 font-cn text-sm text-gold-bright shadow-amber-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* fullscreen glass zoom — tap anywhere to dismiss */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-[70] flex cursor-zoom-out flex-col items-center justify-center gap-4 bg-bg-primary px-6"
          >
            {/* app title, same as the home page */}
            <div className="absolute left-1/2 top-12 flex -translate-x-1/2 flex-col items-center">
              <span className="title-engrave font-cn text-2xl md:text-3xl" style={{ letterSpacing: "0.12em" }}>微醺时刻</span>
              <span className="-mt-0.5 font-serif text-base italic text-gold md:text-lg">The Sip &amp; Sigh</span>
            </div>
            <motion.div
              initial={{ scale: 0.85, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 16 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="flex h-[58vh] w-full max-w-md items-center justify-center"
            >
              <Glass glassType={result.glass} family={result.family} liquidColor={result.liquidColor} layers={result.layers} ice={result.ice} iceSeed={result.iceSeed} fillLevel={result.fillLevel ?? servedFill(result.glass)} glow fizzy={isFizzy(result.ingredients)} garnishes={garnishesFor(result.ingredients)} fill />
            </motion.div>
            <div className="text-center">
              <h2 className="font-cn text-3xl text-paper md:text-4xl" style={{ letterSpacing: "0.05em", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
                {result.name}
              </h2>
              <p className="mt-1 font-serif text-lg italic text-gold-bright/90">{result.nameEn}</p>
            </div>
            <p className="pointer-events-none absolute bottom-8 font-cn text-xs text-paper/45">轻触任意处返回</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
