"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { GlassType, IceType } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { isFizzy } from "@/lib/tokens";
import {
  FLAVOR_CATEGORIES,
  FLAVOR_COUNT,
  flavorById,
  flavorsByCategory,
  searchFlavors,
  type FlavorCategory,
} from "@/lib/data/flavors";
import { ICES } from "@/lib/data/catalog";
import {
  GLASS_CATEGORIES,
  GLASS_COUNT,
  glassesByCategory,
  searchGlasses,
  type GlassCategory,
} from "@/lib/data/glasses";
import { garnishesFor } from "@/lib/data/garnish";
import { cocktailAI } from "@/lib/ai/cocktailAI";
import {
  amountLabel,
  amountStep,
  blendForItems,
  buildLayers,
  classifyMix,
  defaultAmount,
  dominantFamily,
  fillForVolume,
  itemVolumeMl,
  totalVolumeMl,
  type AmountedPick,
  type MixUnit,
} from "@/lib/ai/magicMix";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import Glass from "@/components/art/Glass";
import { Ice } from "@/components/art/Ice";
import Button from "@/components/ui/Button";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { StepFooter } from "@/components/ui/ornaments";
import { Icon } from "@/components/art/icons";
import LoadingVeil from "@/components/ui/LoadingVeil";

type Step = "glass" | "build" | "ice";
const STEPS: { key: Step; label: string }[] = [
  { key: "glass", label: "选择杯型" },
  { key: "build", label: "调制酒液" },
  { key: "ice", label: "选择冰块" },
];

const MAX_ITEMS = 10;
let uidc = 0;

/** One ingredient the player has poured into the build, in order. */
interface BuildItem {
  uid: string;
  flavorId: string;
  category: FlavorCategory;
  name: string;
  nameEn: string;
  color: string;
  family?: SpiritFamily;
  qty: number;
  unit: MixUnit;
}

interface Snapshot {
  items: BuildItem[];
  stirred: boolean;
}

export default function ZenScreen({ layout }: { layout: LayoutMode }) {
  const [step, setStep] = useState<Step>("glass");
  const [glassType, setGlassType] = useState<GlassType>("rocks");
  const [items, setItems] = useState<BuildItem[]>([]);
  const [stirred, setStirred] = useState(false);
  const [stirring, setStirring] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [ice, setIce] = useState<IceType>("none");
  const [busy, setBusy] = useState(false);
  const [veilLine, setVeilLine] = useState(0);

  const [glassCat, setGlassCat] = useState<GlassCategory>("tumbler");
  const [glassQuery, setGlassQuery] = useState("");
  const [category, setCategory] = useState<FlavorCategory>("spirit");
  const [query, setQuery] = useState("");

  const stirTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLastResult = useAtelier((s) => s.setLastResult);
  const addXp = useAtelier((s) => s.addXp);
  const recordDrink = useAtelier((s) => s.recordDrink);
  const recordUnlock = useAtelier((s) => s.recordUnlock);
  const showResult = useNav((s) => s.showResult);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setVeilLine((l) => l + 1), 900);
    return () => clearInterval(id);
  }, [busy]);

  const glassList = useMemo(
    () => (glassQuery.trim() ? searchGlasses(glassQuery) : glassesByCategory(glassCat)),
    [glassQuery, glassCat],
  );
  const list = useMemo(
    () => (query.trim() ? searchFlavors(query) : flavorsByCategory(category)),
    [query, category],
  );

  /* ── derived preview ── */
  const klass = useMemo(() => classifyMix(items), [items]);
  const liquidItems = useMemo(() => items.filter((it) => itemVolumeMl(it) > 0), [items]);
  const totalMl = useMemo(() => totalVolumeMl(items), [items]);
  const family = useMemo<SpiritFamily>(() => (items.length ? dominantFamily(items) : "absinthe"), [items]);
  const garnishes = useMemo(
    () => garnishesFor(items.map((it) => ({ name: it.name, category: it.category, amount: amountLabel(it.qty, it.unit) }))),
    [items],
  );
  const fizzy = useMemo(() => isFizzy(items.map((it) => ({ name: it.name, nameEn: it.nameEn }))), [items]);

  const layered = !stirred && liquidItems.length >= 2;
  const previewLayers = layered ? buildLayers(items) : undefined;
  const previewColor = previewLayers
    ? undefined
    : stirred
      ? blendForItems(items) ?? undefined
      : liquidItems[0]?.color;
  const previewFill = klass.onlyGarnish ? 0 : fillForVolume(totalMl);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  /* ── history helpers ── */
  function pushHistory() {
    setHistory((h) => [...h, { items, stirred }].slice(-30));
  }
  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setItems(prev.items);
      setStirred(prev.stirred);
      return h.slice(0, -1);
    });
    sound.play("ice");
  }

  /* ── build mutations ── */
  function addFlavor(id: string) {
    if (items.length >= MAX_ITEMS) return;
    const f = flavorById(id);
    if (!f) return;
    pushHistory();
    const amt = defaultAmount(f.category);
    setItems((cur) => [
      ...cur,
      { uid: `m${uidc++}`, flavorId: f.id, category: f.category, name: f.name, nameEn: f.nameEn, color: f.color, family: f.family, qty: amt.qty, unit: amt.unit },
    ]);
    setStirred(false); // a fresh pour settles into its own layer again
    sound.play("pour");
  }
  function removeItem(uid: string) {
    pushHistory();
    setItems((cur) => cur.filter((it) => it.uid !== uid));
  }
  function bumpQty(uid: string, dir: 1 | -1) {
    pushHistory();
    setItems((cur) =>
      cur.map((it) => {
        if (it.uid !== uid) return it;
        const step = amountStep(it.unit);
        const next = Math.max(step, it.qty + dir * step);
        return { ...it, qty: next };
      }),
    );
  }
  function move(uid: string, dir: 1 | -1) {
    const i = items.findIndex((it) => it.uid === uid);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    pushHistory();
    setItems((cur) => {
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setStirred(false);
  }
  function stir() {
    if (liquidItems.length < 2) return;
    pushHistory();
    setStirred(true);
    setStirring(true);
    sound.play("ice");
    if (stirTimer.current) clearTimeout(stirTimer.current);
    stirTimer.current = setTimeout(() => setStirring(false), 1200);
  }

  async function finish() {
    if (items.length === 0) return;
    setBusy(true);
    setVeilLine(0);
    const picks: AmountedPick[] = items.map((it) => ({
      id: it.flavorId,
      name: it.name,
      nameEn: it.nameEn,
      category: it.category,
      color: it.color,
      flavor: flavorById(it.flavorId)?.flavor ?? [],
      family: it.family,
      amount: amountLabel(it.qty, it.unit),
    }));
    const analysis = await cocktailAI.analyzeFlavorMix(picks);

    // The card must show exactly what the player built & saw on the stage —
    // their ingredients, in their order, at their measures (the LLM only writes
    // the prose; it must not rewrite the recipe the player customised).
    analysis.ingredients = items.map((it) => ({
      name: it.name,
      nameEn: it.nameEn,
      amount: amountLabel(it.qty, it.unit),
      parts: 1,
      family: it.family,
    }));
    analysis.ratio = analysis.ingredients.map(() => 1);
    analysis.glass = glassType;
    analysis.ice = klass.onlyGarnish ? "none" : ice;
    analysis.family = items.length ? dominantFamily(items) : analysis.family;
    analysis.fillLevel = previewFill;
    if (previewLayers) {
      analysis.layers = previewLayers;
      analysis.liquidColor = undefined;
    } else {
      analysis.layers = undefined;
      analysis.liquidColor = klass.onlyGarnish ? undefined : previewColor;
    }

    sound.play(analysis.hidden ? "unlock" : "success");
    addXp(analysis.hidden ? 120 : 60);
    recordDrink(analysis, "zen");
    if (analysis.hidden) recordUnlock(analysis.name);
    setLastResult(analysis, "zen");
    setBusy(false);
    showResult();
  }

  /* ── central stage (always-on live preview) ── */
  const stage = (
    <div className="relative grid place-items-center">
      <Glass
        glassType={glassType}
        family={family}
        liquidColor={previewColor}
        layers={previewLayers}
        ice={step === "ice" && !klass.onlyGarnish ? ice : "none"}
        fillLevel={previewFill}
        state={stirring ? "swirling" : "still"}
        glow={previewFill > 0.05 || garnishes.length > 0}
        fizzy={fizzy}
        garnishes={garnishes}
        size={layout === "portrait" ? 162 : 410}
      />
    </div>
  );

  return (
    <div className="relative flex h-full flex-col px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col items-center gap-1">
        <BilingualTitle zh="魔法" en="The Alchemy Atelier" align="center" />
      </div>

      <div className={`mt-2 flex min-h-0 flex-1 gap-6 ${layout === "portrait" ? "flex-col" : "flex-row items-stretch"}`}>
        {/* stage */}
        <div className={`relative flex items-center justify-center ${layout === "portrait" ? "min-h-[176px] flex-1" : "flex-[1.1]"}`}>
          {/* layered / stirred badge — pinned to the far left of the stage column
              so it sits clear of the centred glass, never overlapping it */}
          {liquidItems.length >= 1 && (
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gold/30 bg-ink/60 px-2.5 py-1 font-cn text-[10px] text-gold/80 backdrop-blur-sm">
              {liquidItems.length >= 2 ? (stirred ? "已搅匀 · 融合" : "未搅拌 · 分层") : "单一酒液"}
            </span>
          )}
          {stage}
        </div>

        {/* control panel */}
        <div className={`flex flex-col ${layout === "portrait" ? "" : "w-[372px] shrink-0"}`}>
          <div className="glass-panel flex min-h-0 flex-1 flex-col rounded-xl p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {step === "glass" && (
                  <Selector title="选择杯型" subtitle="Select Glass" hint={`${GLASS_COUNT} 种杯型，先为这场实验挑一只容器。`}>
                    <SearchBox value={glassQuery} onChange={setGlassQuery} placeholder={`搜索 ${GLASS_COUNT} 种杯型…`} />
                    {!glassQuery && (
                      <CatPills
                        items={GLASS_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
                        active={glassCat}
                        onPick={(id) => setGlassCat(id as GlassCategory)}
                      />
                    )}
                    <div className="mt-2 grid min-h-0 flex-1 auto-rows-min content-start grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                      {glassList.map((g) => (
                        <PickTile key={g.id} active={glassType === g.id} onClick={() => setGlassType(g.id)} label={g.name} sub={g.nameEn} mediaH={52}>
                          <Glass glassType={g.id} family={family} fillLevel={0} size={48} fit />
                        </PickTile>
                      ))}
                      {glassList.length === 0 && <p className="col-span-full py-6 text-center font-cn text-xs text-paper/40">无匹配杯型</p>}
                    </div>
                  </Selector>
                )}

                {step === "build" && (
                  <Selector
                    title="调制酒液"
                    subtitle="Build the Body"
                    hint="按顺序加入材料，未搅拌时酒液自然分层；点「搅拌」让它们融为一体。"
                  >
                    {/* added ingredients, in pour order */}
                    {items.length > 0 ? (
                      <div className="mb-2 max-h-[26vh] space-y-1.5 overflow-y-auto pr-1">
                        {items.map((it, i) => (
                          <BuildRow
                            key={it.uid}
                            index={i}
                            total={items.length}
                            item={it}
                            onMinus={() => bumpQty(it.uid, -1)}
                            onPlus={() => bumpQty(it.uid, 1)}
                            onUp={() => move(it.uid, -1)}
                            onDown={() => move(it.uid, 1)}
                            onRemove={() => removeItem(it.uid)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mb-2 rounded-lg border border-dashed border-gold/20 py-3 text-center font-cn text-xs text-paper/40">
                        还没有材料 — 从下方挑选，开始你的调制
                      </p>
                    )}

                    {/* stir + undo */}
                    <div className="mb-2 flex gap-2">
                      <button
                        onClick={stir}
                        disabled={liquidItems.length < 2}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 font-cn text-[12px] transition-all disabled:opacity-35 ${
                          stirred ? "border-gold/55 bg-gold/12 text-gold-bright" : "border-gold/20 text-paper/75 hover:border-gold/40"
                        }`}
                      >
                        <Icon name="stir" size={15} /> {stirred ? "已搅匀" : "搅拌"}
                      </button>
                      <button
                        onClick={undo}
                        disabled={history.length === 0}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gold/20 py-2 font-cn text-[12px] text-paper/75 transition-all hover:border-gold/40 disabled:opacity-35"
                      >
                        <Icon name="back" size={15} /> 撤回
                      </button>
                    </div>

                    <Divider className="mb-2" />

                    <SearchBox value={query} onChange={setQuery} placeholder={`搜索 ${FLAVOR_COUNT} 种材料…`} />
                    {!query && (
                      <CatPills
                        items={FLAVOR_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
                        active={category}
                        onPick={(id) => setCategory(id as FlavorCategory)}
                      />
                    )}
                    <div className="mt-2 grid min-h-0 flex-1 auto-rows-min content-start grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                      {list.map((f) => {
                        const disabled = items.length >= MAX_ITEMS;
                        const picked = items.some((it) => it.flavorId === f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => addFlavor(f.id)}
                            disabled={disabled}
                            className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-left transition-all hover:bg-gold/5 disabled:opacity-30 ${
                              picked ? "border-gold/55 bg-gold/12 shadow-amber-soft" : "border-black/40 hover:border-gold/35"
                            }`}
                          >
                            <span className="h-5 w-5 shrink-0 rounded-full border border-paper/20" style={{ background: `radial-gradient(circle at 35% 30%, ${f.color}, ${f.color}88)` }} />
                            <span className="min-w-0 flex-1">
                              <span className={`block truncate font-cn text-[12px] ${picked ? "text-gold-bright" : "text-paper/90"}`}>{f.name}</span>
                              <span className="block truncate font-serif text-[9px] italic text-gold/55">{f.nameEn}</span>
                            </span>
                            <Icon name={picked ? "check" : "plus"} size={12} className={`shrink-0 ${picked ? "text-gold-bright" : "text-gold/55"}`} />
                          </button>
                        );
                      })}
                      {list.length === 0 && <p className="col-span-full py-6 text-center font-cn text-sm text-paper/40">没有找到匹配的材料</p>}
                    </div>
                  </Selector>
                )}

                {step === "ice" && (
                  <Selector title="选择冰块" subtitle="Select Ice" hint="冰，决定了风味随时间舒展的节奏。">
                    {klass.onlyGarnish && (
                      <p className="mb-2 rounded-lg border border-dashed border-gold/25 py-2 text-center font-cn text-[11px] text-paper/50">
                        这是一只空杯点缀 — 无需加冰
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {ICES.map((i) => (
                        <PickTile
                          key={i.id}
                          active={ice === i.id}
                          onClick={() => {
                            setIce(i.id);
                            if (i.id !== "none") sound.play("ice");
                          }}
                          label={i.name}
                          sub={i.nameEn}
                          mediaH={56}
                        >
                          <Ice type={i.id} size={56} selector />
                        </PickTile>
                      ))}
                    </div>
                  </Selector>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* footer */}
          <StepFooter>
            <Button
              variant="ghost"
              onClick={() => {
                const prev = STEPS[stepIndex - 1];
                if (prev) setStep(prev.key);
              }}
              disabled={stepIndex === 0}
            >
              <Icon name="back" size={16} /> 上一步
            </Button>
            {step !== "ice" ? (
              <Button
                onClick={() => setStep(STEPS[stepIndex + 1].key)}
                disabled={step === "build" && items.length === 0}
              >
                下一步 <Icon name="forward" size={16} />
              </Button>
            ) : (
              <Button onClick={finish} disabled={busy || items.length === 0}>
                {busy ? "调制中…" : "生成酒卡"} <Icon name="sparkle" size={16} />
              </Button>
            )}
          </StepFooter>
        </div>
      </div>

      <AnimatePresence>{busy && <LoadingVeil visible line={veilLine} />}</AnimatePresence>
    </div>
  );
}

/* ── added-ingredient row ── */
function BuildRow({
  index,
  total,
  item,
  onMinus,
  onPlus,
  onUp,
  onDown,
  onRemove,
}: {
  index: number;
  total: number;
  item: BuildItem;
  onMinus: () => void;
  onPlus: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const liquid = itemVolumeMl(item) > 0;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gold/15 bg-ink/30 p-1.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/30 font-title text-[9px] text-gold/80">{index + 1}</span>
      <span className="h-4 w-4 shrink-0 rounded-full border border-paper/20" style={{ background: item.color }} />
      <span className="min-w-0 flex-1 truncate font-cn text-[12px] text-paper/85">
        {item.name}
        {!liquid && <span className="ml-1 text-paper/35">·点缀</span>}
      </span>
      {/* stepper */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={onMinus} className="grid h-5 w-5 place-items-center rounded border border-gold/20 font-cn text-sm leading-none text-paper/70 hover:border-gold/45">−</button>
        <span className="w-12 text-center font-cn text-[11px] text-gold-bright">{amountLabel(item.qty, item.unit)}</span>
        <button onClick={onPlus} className="grid h-5 w-5 place-items-center rounded border border-gold/20 hover:border-gold/45"><Icon name="plus" size={11} className="text-paper/70" /></button>
      </div>
      {/* reorder + remove */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={onUp} disabled={index === 0} className="grid h-5 w-4 place-items-center rounded text-[11px] text-paper/55 hover:text-gold-bright disabled:opacity-25" aria-label="上移">↑</button>
        <button onClick={onDown} disabled={index === total - 1} className="grid h-5 w-4 place-items-center rounded text-[11px] text-paper/55 hover:text-gold-bright disabled:opacity-25" aria-label="下移">↓</button>
        <button onClick={onRemove} className="grid h-5 w-5 place-items-center rounded text-paper/45 hover:text-red-300" aria-label="移除"><Icon name="close" size={12} /></button>
      </div>
    </div>
  );
}

/* ── shared selector building blocks (mirrors PurePourScreen) ── */
function Selector({ title, subtitle, hint, children }: { title: string; subtitle: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BilingualTitle zh={title} en={subtitle} size="sm" />
      <p className="mb-2 mt-1 font-cn text-xs leading-relaxed text-paper/50">{hint}</p>
      <Divider className="mb-2" />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gold/50">
        <Icon name="search" size={14} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gold/20 bg-ink/40 py-1.5 pl-8 pr-7 font-cn text-[13px] text-paper placeholder:text-paper/35 focus:border-gold/45 focus:outline-none"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper" aria-label="清除">
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
  );
}

function CatPills({ items, active, onPick }: { items: { id: string; name: string }[]; active: string; onPick: (id: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className={`rounded-full border px-2 py-0.5 font-cn text-[10px] leading-tight transition-all ${
            active === c.id ? "border-gold/60 bg-gold/12 text-gold-bright" : "border-black/40 text-paper/65 hover:border-gold/35"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

function PickTile({ active, onClick, label, sub, children, mediaH = 48 }: { active?: boolean; onClick: () => void; label: string; sub: string; children: React.ReactNode; mediaH?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all ${
        active ? "border-gold/60 bg-gold/12 shadow-amber-soft" : "border-black/40 hover:border-gold/35 hover:bg-gold/5"
      }`}
    >
      <span className="flex items-center justify-center" style={{ height: mediaH }}>{children}</span>
      <span className="leading-tight">
        <span className={`block font-cn text-[11px] ${active ? "text-gold-bright" : "text-paper/80"}`}>{label}</span>
        <span className="block font-title text-[7px] uppercase tracking-wide text-gold/45">{sub}</span>
      </span>
    </button>
  );
}
