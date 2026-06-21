"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { CocktailResult, Recipe, RecipeCategory } from "@/types";
import {
  RECIPE_CATEGORIES,
  RECIPE_COUNT,
  recipesByCategory,
  searchRecipes,
} from "@/lib/data/recipes";
import { composeFromMood } from "@/lib/ai/composer";
import { randomSignature } from "@/lib/ai/lexicon";
import Glass from "@/components/art/Glass";
import { isFizzy } from "@/lib/tokens";
import { garnishesFor } from "@/lib/data/garnish";
import Button from "@/components/ui/Button";
import { BilingualTitle, StepDots, Divider } from "@/components/ui/atoms";
import { StepFooter } from "@/components/ui/ornaments";
import { Icon } from "@/components/art/icons";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";

type Step = "recipe" | "ratio" | "timing";
const STEPS: { key: Step; label: string }[] = [
  { key: "recipe", label: "选择配方" },
  { key: "ratio", label: "配比层叠" },
  { key: "timing", label: "手法定时" },
];

function buildResult(recipe: Recipe, success: boolean, accuracy: number): CocktailResult {
  // Use the recipe's own story if it has one, else compose one in-character,
  // seeded by the recipe id so it's deterministic and varied per cocktail.
  const composed = composeFromMood({
    family: recipe.family,
    moodText: recipe.id,
    keywords: [...recipe.ingredients.map((i) => i.name), recipe.tasting].slice(0, 4),
  });
  // carry the witty sign-off the composer chose, but place it after the tail line.
  const sig = composed.story.match(/——\s*([^\n]+)\s*$/)?.[1]?.trim() ?? randomSignature();
  // Weave the composer's longer scene in after the recipe's own line (if any), so
  // even authored recipe stories read as a fuller narrative rather than one line.
  const strip = (s: string) => s.replace(/\s*\n?\s*——[^\n]*$/, "").trimEnd();
  const composedBody = strip(composed.story);
  const recipeBody = recipe.story ? strip(recipe.story) : "";
  const baseStory = recipeBody ? `${recipeBody}\n${composedBody}` : composedBody;

  // Tasting notes ≈ the recipe's authored line + a richer composed elaboration.
  const lead = recipe.tasting.replace(/[。.]$/, "");
  const taste = `${lead}。${composed.taste_profile}`;

  const tail = success
    ? `你以 ${Math.round(accuracy * 100)}% 的精准复刻了这杯${recipe.alcoholFree ? "特调" : "经典"}。`
    : "比例偏离了经典的轨道，却也调出了独属于你的版本——失败，有时是另一种配方的开始。";

  return {
    name: success ? recipe.name : `${recipe.name}（即兴版）`,
    nameEn: recipe.nameEn,
    ingredients: recipe.ingredients,
    ratio: recipe.ingredients.map((i) => i.parts ?? 1),
    glass: recipe.glass,
    ice: recipe.ice,
    family: recipe.family,
    taste_profile: taste,
    story: `${baseStory}\n${tail}\n—— ${sig}`,
    emotion_mapping: success ? "对经典的敬意，藏在每一毫升的精确里。" : "偏差也是风格，干杯。",
  };
}

export default function MixologyScreen({ layout }: { layout: LayoutMode }) {
  const [step, setStep] = useState<Step>("recipe");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pours, setPours] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [category, setCategory] = useState<RecipeCategory>("golden");
  const [query, setQuery] = useState("");

  const recipeList = useMemo(
    () => (query.trim() ? searchRecipes(query) : recipesByCategory(category)),
    [query, category],
  );

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const setLastResult = useAtelier((s) => s.setLastResult);
  const addXp = useAtelier((s) => s.addXp);
  const recordPour = useAtelier((s) => s.recordPour);
  const showResult = useNav((s) => s.showResult);

  function pickRecipe(r: Recipe) {
    setRecipe(r);
    setPours(r.ingredients.map(() => 0));
    setStep("ratio");
  }

  /* ── ratio accuracy ── */
  const adjustable = recipe ? recipe.ingredients.map((i, idx) => ({ i, idx })).filter((x) => (x.i.parts ?? 0) > 0) : [];
  const ratioAccuracy = (() => {
    if (!recipe) return 0;
    let err = 0;
    let n = 0;
    for (const { i, idx } of adjustable) {
      const target = i.parts ?? 1;
      err += Math.min(1, Math.abs((pours[idx] ?? 0) - target) / Math.max(1, target));
      n++;
    }
    return n ? Math.max(0, 1 - err / n) : 0;
  })();
  const totalPour = pours.reduce((a, b) => a + b, 0);
  const fillLevel = Math.min(0.9, totalPour / Math.max(1, recipe ? recipe.ingredients.reduce((a, i) => a + (i.parts ?? 0), 0) * 1.3 : 1));

  /* ── timing mini-game ── */
  const [marker, setMarker] = useState(0.5);
  const [timingQuality, setTimingQuality] = useState<number | null>(null);
  const markerRef = useRef(0);
  const dirRef = useRef(1);
  useEffect(() => {
    if (step !== "timing" || timingQuality !== null) return;
    let id = 0;
    let last = 0;
    // fraction of the bar travelled per second — time-based so the speed is the
    // same on 60Hz and 120Hz displays (and gentle enough to actually aim).
    const SPEED = 0.42;
    const tick = (now: number) => {
      if (last === 0) last = now;
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tab-switch jumps
      last = now;
      markerRef.current += dirRef.current * SPEED * dt;
      if (markerRef.current >= 1) {
        markerRef.current = 1;
        dirRef.current = -1;
      } else if (markerRef.current <= 0) {
        markerRef.current = 0;
        dirRef.current = 1;
      }
      setMarker(markerRef.current);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [step, timingQuality]);

  function lockTiming() {
    const q = Math.max(0, 1 - Math.abs(markerRef.current - 0.5) / 0.5);
    sound.play(recipe?.ice === "none" ? "shake" : "ice");
    setTimingQuality(q);
  }

  function finish() {
    if (!recipe) return;
    const accuracy = ratioAccuracy * 0.6 + (timingQuality ?? 0) * 0.4;
    const success = accuracy >= 0.7;
    sound.play("success");
    addXp(success ? 60 : 30);
    recordPour();
    setLastResult(buildResult(recipe, success, accuracy), "mixology");
    showResult();
  }

  return (
    <div className="flex h-full flex-col px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col items-center gap-3">
        <BilingualTitle zh="酒谱" en="The Liquid Codex" align="center" />
        <StepDots steps={STEPS} current={stepIndex} />
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {/* STEP 1 — recipe book (era tabs + search) */}
            {step === "recipe" && (
              <div className="flex h-full flex-col">
                {/* search */}
                <div className="relative mb-3 max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold/50">
                    <Icon name="search" size={15} />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`搜索 ${RECIPE_COUNT} 款配方…`}
                    className="w-full rounded-lg border border-gold/20 bg-ink/40 py-2 pl-9 pr-3 font-cn text-sm text-paper placeholder:text-paper/35 focus:border-gold/45 focus:outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper" aria-label="清除">
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>

                {/* era tabs */}
                {!query && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {RECIPE_CATEGORIES.map((c) => {
                      const active = category === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCategory(c.id)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-all ${
                            active ? "border-gold/60 bg-gold/12" : "border-gold/15 hover:border-gold/35"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: c.accent }} />
                          <span className="leading-tight">
                            <span className={`block font-cn text-[13px] ${active ? "text-gold-bright" : "text-paper/75"}`}>{c.name}</span>
                            <span className="block font-title text-[7px] uppercase tracking-wide text-gold/45">{c.era}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <Divider className="mb-3" />

                {/* recipe grid — larger, richer cards so the area fills the screen */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {recipeList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => pickRecipe(r)}
                      className="group flex items-center gap-4 rounded-xl border border-gold/20 wood-panel p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold/50"
                    >
                      <span className="grid h-[82px] w-[68px] shrink-0 place-items-center">
                        <Glass glassType={r.glass} family={r.family} ice={r.ice} fillLevel={r.ice === "none" ? 0.62 : 0.5} fizzy={isFizzy(r.ingredients)} size={68} fit />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-cn text-lg text-paper group-hover:text-gold-bright">{r.name}</div>
                        <div className="truncate font-title text-[10px] uppercase tracking-wide text-gold/55">{r.nameEn}</div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < r.difficulty ? "bg-amber" : "bg-paper/20"}`} />
                          ))}
                          {r.alcoholFree && <span className="ml-1 rounded-full border border-absinthe/50 px-1.5 font-cn text-[9px] text-absinthe">无酒精</span>}
                        </div>
                        <p className="mt-2 line-clamp-2 font-cn text-xs leading-relaxed text-paper/45">{r.tasting}</p>
                      </div>
                      <Icon name="forward" size={18} className="shrink-0 text-gold/50 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                  {recipeList.length === 0 && <p className="col-span-full py-8 text-center font-cn text-sm text-paper/40">没有找到匹配的配方</p>}
                </div>
              </div>
            )}

            {/* STEP 2 — ratio layering */}
            {step === "ratio" && recipe && (
              <div className={`flex h-full gap-6 ${layout === "portrait" ? "flex-col" : "flex-row"}`}>
                <div className="relative flex min-h-0 flex-1 items-center justify-center p-2">
                  <Glass
                    glassType={recipe.glass}
                    family={recipe.family}
                    ice={recipe.ice}
                    fillLevel={fillLevel}
                    glow={fillLevel > 0.1}
                    fill
                    fizzy={isFizzy(recipe.ingredients)}
                    garnishes={garnishesFor(recipe.ingredients)}
                    state="swirling"
                    className={`h-full w-auto max-w-full ${layout === "portrait" ? "max-h-[320px]" : "max-h-[620px]"}`}
                  />
                </div>
                <div className="glass-panel w-full self-center rounded-xl p-5 md:w-[420px]">
                  <div className="flex items-center justify-between">
                    <BilingualTitle zh="配比层叠" en="Layering" size="sm" />
                    <button onClick={() => setShowHint((h) => !h)} className="font-ui text-[11px] text-gold/70 underline-offset-2 hover:underline">
                      {showHint ? "隐藏配方" : "对照配方"}
                    </button>
                  </div>
                  <p className="mb-3 mt-1 font-cn text-xs text-paper/50">拖动滑块，让每种材料逼近经典的黄金比例。</p>
                  <Divider className="mb-3" />
                  <div className="space-y-4">
                    {recipe.ingredients.map((ing, idx) => {
                      const target = ing.parts ?? 0;
                      const editable = target > 0;
                      return (
                        <div key={idx}>
                          <div className="flex items-baseline justify-between">
                            <span className="font-cn text-sm text-paper/90">{ing.name}</span>
                            <span className="font-ui text-xs text-paper/45">
                              {editable ? `${pours[idx] ?? 0} 份` : ing.amount}
                              {showHint && editable && <span className="ml-1 text-gold/70">· 目标 {target}</span>}
                            </span>
                          </div>
                          {editable && (
                            <div className="relative mt-1.5">
                              {showHint && (
                                <span className="absolute top-1/2 z-10 h-3 w-0.5 -translate-y-1/2 bg-gold-bright/80" style={{ left: `${(target / (target * 2)) * 100}%` }} />
                              )}
                              <input
                                type="range"
                                min={0}
                                max={target * 2}
                                step={1}
                                value={pours[idx] ?? 0}
                                onChange={(e) => setPours((p) => p.map((v, i) => (i === idx ? Number(e.target.value) : v)))}
                                className="mixo-range w-full"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-lg border border-gold/15 bg-ink/30 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-cn text-paper/60">配比精准度</span>
                      <span className="font-ui text-gold-bright">{Math.round(ratioAccuracy * 100)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-soft">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-deep to-gold-bright transition-[width]" style={{ width: `${ratioAccuracy * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — timing */}
            {step === "timing" && recipe && (
              <div className="grid h-full place-items-center">
                <div className="w-full max-w-lg text-center">
                  <BilingualTitle zh={recipe.ice === "none" ? "摇匀" : "搅拌"} en="Timing Action" align="center" size="md" />
                  <p className="mx-auto mt-2 max-w-sm font-cn text-sm text-paper/55">
                    当指针扫过中央的金色区域时按下——精准的手法决定了霜化与稀释的程度。
                  </p>

                  <div className="relative mx-auto mt-8 h-12 w-full overflow-hidden rounded-full border border-gold/25 bg-ink/50">
                    <div className="absolute inset-y-0 left-1/2 w-[22%] -translate-x-1/2 rounded-md bg-gradient-to-r from-amber/30 via-gold/40 to-amber/30" />
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gold-bright/60" />
                    <div
                      className="absolute top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-full bg-gold-bright shadow-amber-glow"
                      style={{ left: `calc(${marker * 100}% - 3px)` }}
                    />
                  </div>

                  {timingQuality === null ? (
                    <Button className="mt-8 px-10 py-3" onClick={lockTiming}>
                      <Icon name="stir" size={18} /> {recipe.ice === "none" ? "摇匀！" : "停！"}
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
                      <p className="font-cn text-lg text-gold-bright">
                        {timingQuality > 0.8 ? "手法精湛 ✦" : timingQuality > 0.5 ? "稳健的一手" : "稍有偏差"}
                      </p>
                      <p className="mt-1 font-ui text-sm text-paper/50">手法评分 {Math.round(timingQuality * 100)}%</p>
                      <Button className="mt-5 px-8 py-3" onClick={finish}>
                        完成这一杯 <Icon name="sparkle" size={16} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer nav (recipe step has no footer) */}
      {step !== "recipe" && (
        <StepFooter>
          <Button variant="ghost" onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)].key)}>
            <Icon name="back" size={16} /> 上一步
          </Button>
          {step === "ratio" && (
            <Button onClick={() => setStep("timing")}>
              下一步 · 手法 <Icon name="forward" size={16} />
            </Button>
          )}
        </StepFooter>
      )}
    </div>
  );
}
