"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { GlassType, IceType } from "@/types";
import { ICES } from "@/lib/data/catalog";
import {
  GLASS_CATEGORIES,
  GLASS_COUNT,
  glassesByCategory,
  searchGlasses,
  type GlassCategory,
} from "@/lib/data/glasses";
import {
  SPIRIT_CATEGORIES,
  SPIRIT_COUNT,
  spiritById,
  spiritsByCategory,
  searchSpirits,
  type SpiritCategory,
} from "@/lib/data/spirits";
import Glass from "@/components/art/Glass";
import Bottle from "@/components/art/Bottle";
import { Ice } from "@/components/art/Ice";
import Button from "@/components/ui/Button";
import { BilingualTitle, StepDots, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";
import { cocktailAI } from "@/lib/ai/cocktailAI";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";

type Step = "glass" | "spirit" | "pour" | "ice";
const STEPS: { key: Step; label: string }[] = [
  { key: "glass", label: "选择杯型" },
  { key: "spirit", label: "倒入基酒" },
  { key: "pour", label: "斟酒" },
  { key: "ice", label: "选择冰型" },
];

const POUR_TARGET = 0.58; // the sweet spot

export default function PurePourScreen({ layout }: { layout: LayoutMode }) {
  const [step, setStep] = useState<Step>("glass");
  const [glassType, setGlassType] = useState<GlassType>("glencairn");
  const [spiritId, setSpiritId] = useState<string>("");
  const [fill, setFill] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [ice, setIce] = useState<IceType>("none");
  const [busy, setBusy] = useState(false);
  const [glassCat, setGlassCat] = useState<GlassCategory>("nosing");
  const [glassQuery, setGlassQuery] = useState("");
  const [spiritCat, setSpiritCat] = useState<SpiritCategory>("whisky");
  const [spiritQuery, setSpiritQuery] = useState("");

  const glassList = useMemo(
    () => (glassQuery.trim() ? searchGlasses(glassQuery) : glassesByCategory(glassCat)),
    [glassQuery, glassCat],
  );
  const spiritList = useMemo(
    () => (spiritQuery.trim() ? searchSpirits(spiritQuery) : spiritsByCategory(spiritCat)),
    [spiritQuery, spiritCat],
  );

  const spirit = spiritById(spiritId);
  const family = spirit?.family ?? "whisky";
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const setLastResult = useAtelier((s) => s.setLastResult);
  const addXp = useAtelier((s) => s.addXp);
  const recordPour = useAtelier((s) => s.recordPour);
  const showResult = useNav((s) => s.showResult);
  const pureSeed = useNav((s) => s.pureSeed);
  const consumePureSeed = useNav((s) => s.consumePureSeed);

  // If the Library handed us a base spirit, preselect it and skip to its step.
  useEffect(() => {
    if (pureSeed) {
      setSpiritId(pureSeed);
      setStep("spirit");
      consumePureSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* hold-to-pour: ramp the fill while the button is pressed */
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!pouring) return;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setFill((f) => Math.min(0.92, f + dt * 0.32));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pouring]);

  async function finish() {
    if (!spiritId) return;
    setBusy(true);
    sound.play("success");
    addXp(40);
    recordPour();
    const result = await cocktailAI.describePour(spiritId, glassType, ice);
    setLastResult(result, "pure");
    setBusy(false);
    showResult();
  }

  const pourQuality = Math.max(0, 1 - Math.abs(fill - POUR_TARGET) / 0.5);

  /* ── central stage ── */
  const stage = (
    <div className="relative grid place-items-center">
      <AnimatePresence>
        {step === "pour" && pouring && (
          <motion.div
            key="pour-fx"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20"
            >
              {/* pour stream falling from the mouth into the glass */}
              <span
                className="pour-stream absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full"
                style={{ top: "13%", height: "30%" }}
              />
              {/* bottle: its mouth is pinned just above the glass rim; the body
                  tilts up so it reads as pouring in. (pivot = the bottle's mouth) */}
              <div className="absolute left-1/2 top-[13%]" style={{ transform: "translate(-50%, -9%)" }}>
                <Bottle
                  family={family}
                  label={spirit?.nameEn?.[0]}
                  size={layout === "portrait" ? 78 : 100}
                  tilt={128}
                  pivot="50% 9%"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Glass
          glassType={glassType}
          family={family}
          ice={step === "ice" ? ice : "none"}
          fillLevel={fill}
          state={pouring ? "pouring" : "still"}
          glow={fill > 0.1}
          size={layout === "portrait" ? 190 : 240}
        />
    </div>
  );

  return (
    <div className="flex h-full flex-col px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col items-center gap-3">
        <BilingualTitle zh="纯饮" en="The Pure Pour" align="center" />
        <StepDots steps={STEPS} current={stepIndex} />
      </div>

      <div className={`mt-2 flex min-h-0 flex-1 gap-6 ${layout === "portrait" ? "flex-col" : "flex-row items-stretch"}`}>
        {/* stage */}
        <div className={`relative flex items-center justify-center ${layout === "portrait" ? "min-h-[230px] flex-1" : "flex-[1.1]"}`}>
          {stage}
        </div>

        {/* control panel */}
        <div className={`flex flex-col ${layout === "portrait" ? "" : "w-[360px] shrink-0"}`}>
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
                  <Selector title="选择杯型" subtitle="Select Glass" hint={`${GLASS_COUNT} 种杯型，塑造不同的香气路径。`}>
                    <SearchBox value={glassQuery} onChange={setGlassQuery} placeholder={`搜索 ${GLASS_COUNT} 种杯型…`} />
                    {!glassQuery && (
                      <CatPills
                        items={GLASS_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
                        active={glassCat}
                        onPick={(id) => setGlassCat(id as GlassCategory)}
                      />
                    )}
                    <div className="mt-2 grid min-h-0 flex-1 auto-rows-min content-start grid-cols-3 gap-2 overflow-y-auto pr-1">
                      {glassList.map((g) => (
                        <PickTile key={g.id} active={glassType === g.id} onClick={() => setGlassType(g.id)} label={g.name} sub={g.nameEn} mediaH={64}>
                          <Glass glassType={g.id} family={family} fillLevel={0} size={58} fit />
                        </PickTile>
                      ))}
                      {glassList.length === 0 && <p className="col-span-full py-6 text-center font-cn text-xs text-paper/40">无匹配杯型</p>}
                    </div>
                  </Selector>
                )}

                {step === "spirit" && (
                  <Selector title="倒入基酒" subtitle="Select Spirit" hint={`从 ${SPIRIT_COUNT} 支酒中选一支灵魂。`}>
                    <SearchBox value={spiritQuery} onChange={setSpiritQuery} placeholder={`搜索 ${SPIRIT_COUNT} 支基酒…`} />
                    {!spiritQuery && (
                      <CatPills
                        items={SPIRIT_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
                        active={spiritCat}
                        onPick={(id) => setSpiritCat(id as SpiritCategory)}
                      />
                    )}
                    <div className="mt-2 grid min-h-0 flex-1 auto-rows-min content-start grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {spiritList.map((s) => (
                        <PickTile key={s.id} active={spiritId === s.id} onClick={() => setSpiritId(s.id)} label={s.name} sub={s.nameEn} mediaH={84}>
                          <Bottle family={s.family} label={s.nameEn[0]} size={34} />
                        </PickTile>
                      ))}
                      {spiritList.length === 0 && <p className="col-span-full py-6 text-center font-cn text-xs text-paper/40">无匹配基酒</p>}
                    </div>
                  </Selector>
                )}

                {step === "pour" && (
                  <Selector title="斟酒" subtitle="Pour" hint="长按下方按钮倒酒，松开停止。注满约六分，是品鉴的黄金线。">
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                      {/* fill gauge with target band */}
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink-soft">
                        <div className="absolute inset-y-0 rounded-full bg-amber/20" style={{ left: `${(POUR_TARGET - 0.12) * 100}%`, width: "24%" }} />
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-deep to-amber-glow transition-[width] duration-100" style={{ width: `${fill * 100}%` }} />
                      </div>
                      <p className="font-cn text-xs text-paper/55">
                        {fill < 0.05 ? "杯子还是空的" : pourQuality > 0.8 ? "完美的注酒线 ✦" : fill > 0.8 ? "斟得有些满了" : "继续……"}
                      </p>
                      <button
                        className="select-none touch-none rounded-full bg-gradient-to-b from-amber to-amber-deep px-8 py-4 font-cn text-ink shadow-amber-glow transition-colors"
                        style={{ touchAction: "none" }}
                        onPointerDown={(e) => {
                          setPouring(true);
                          sound.play("pour");
                          // capture so the hold keeps ramping even if the pointer
                          // drifts off the button; avoids the premature stop.
                          try {
                            e.currentTarget.setPointerCapture(e.pointerId);
                          } catch {
                            /* ignore — capture is best-effort */
                          }
                        }}
                        onPointerUp={() => setPouring(false)}
                        onPointerCancel={() => setPouring(false)}
                      >
                        {pouring ? "正在倒酒…" : "长按倒酒"}
                      </button>
                      {fill > 0.05 && (
                        <button onClick={() => setFill(0)} className="font-ui text-xs text-paper/40 underline-offset-2 hover:text-paper/70 hover:underline">
                          倒掉重来
                        </button>
                      )}
                    </div>
                  </Selector>
                )}

                {step === "ice" && (
                  <Selector title="选择冰型" subtitle="Select Ice" hint="冰，决定了风味随时间舒展的节奏。">
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
                          <Ice type={i.id} size={56} />
                        </PickTile>
                      ))}
                    </div>
                  </Selector>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* footer actions */}
          <div className="mt-3 flex items-center justify-between gap-3">
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
                disabled={(step === "spirit" && !spiritId) || (step === "pour" && fill < 0.08)}
              >
                下一步 <Icon name="forward" size={16} />
              </Button>
            ) : (
              <Button onClick={finish} disabled={busy}>
                {busy ? "调制中…" : "完成调制"} <Icon name="sparkle" size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── small building blocks ── */
function Selector({
  title,
  subtitle,
  hint,
  children,
}: {
  title: string;
  subtitle: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BilingualTitle zh={title} en={subtitle} size="sm" />
      <p className="mb-2 mt-1 font-cn text-xs leading-relaxed text-paper/50">{hint}</p>
      <Divider className="mb-2" />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/** Compact search field used inside the selector panels. */
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
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

/** Horizontally-wrapping category pills. */
function CatPills({
  items,
  active,
  onPick,
}: {
  items: { id: string; name: string }[];
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className={`rounded-full border px-2.5 py-0.5 font-cn text-[11px] transition-all ${
            active === c.id ? "border-gold/60 bg-gold/12 text-gold-bright" : "border-gold/15 text-paper/65 hover:border-gold/35"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

function PickTile({
  active,
  onClick,
  label,
  sub,
  children,
  mediaH = 48,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  children: React.ReactNode;
  /** height reserved for the art so stems/feet aren't clipped behind the label */
  mediaH?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all ${
        active ? "border-gold/60 bg-gold/12 shadow-amber-soft" : "border-gold/15 hover:border-gold/35 hover:bg-gold/5"
      }`}
    >
      <span className="flex items-center justify-center" style={{ height: mediaH }}>
        {children}
      </span>
      <span className="leading-tight">
        <span className={`block font-cn text-[11px] ${active ? "text-gold-bright" : "text-paper/80"}`}>{label}</span>
        <span className="block font-title text-[7px] uppercase tracking-wide text-gold/45">{sub}</span>
      </span>
    </button>
  );
}
