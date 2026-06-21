"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import type { FlavorPick, ZenNode } from "@/types";
import {
  FLAVOR_CATEGORIES,
  FLAVOR_COUNT,
  flavorById,
  flavorsByCategory,
  searchFlavors,
  type FlavorCategory,
} from "@/lib/data/flavors";
import { cocktailAI } from "@/lib/ai/cocktailAI";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import Button from "@/components/ui/Button";
import { BilingualTitle, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";
import SceneBackdrop from "@/components/art/SceneBackdrop";
import LoadingVeil from "@/components/ui/LoadingVeil";

const MAX_NODES = 8;
let nid = 0;

export default function ZenScreen({ layout }: { layout: LayoutMode }) {
  const [nodes, setNodes] = useState<ZenNode[]>([]);
  const [category, setCategory] = useState<FlavorCategory>("spirit");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [veilLine, setVeilLine] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  const setLastResult = useAtelier((s) => s.setLastResult);
  const addXp = useAtelier((s) => s.addXp);
  const recordPour = useAtelier((s) => s.recordPour);
  const recordUnlock = useAtelier((s) => s.recordUnlock);
  const showResult = useNav((s) => s.showResult);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setVeilLine((l) => l + 1), 900);
    return () => clearInterval(id);
  }, [busy]);

  const list = useMemo(
    () => (query.trim() ? searchFlavors(query) : flavorsByCategory(category)),
    [query, category],
  );
  const pickedIds = useMemo(() => new Set(nodes.map((n) => n.flavorId)), [nodes]);

  function toggleFlavor(id: string) {
    setNodes((cur) => {
      if (cur.some((n) => n.flavorId === id)) return cur.filter((n) => n.flavorId !== id);
      if (cur.length >= MAX_NODES) return cur;
      sound.play("ice");
      const angle = (cur.length / MAX_NODES) * Math.PI * 2 - Math.PI / 2;
      return [
        ...cur,
        { id: `z${nid++}`, flavorId: id, x: 0.5 + Math.cos(angle) * 0.27, y: 0.5 + Math.sin(angle) * 0.32 },
      ];
    });
  }

  function removeNode(id: string) {
    setNodes((cur) => cur.filter((n) => n.id !== id));
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragId.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(0.94, Math.max(0.06, (e.clientX - rect.left) / rect.width));
    const y = Math.min(0.92, Math.max(0.08, (e.clientY - rect.top) / rect.height));
    setNodes((cur) => cur.map((n) => (n.id === dragId.current ? { ...n, x, y } : n)));
  }

  async function analyze() {
    if (nodes.length < 1) return;
    setBusy(true);
    setVeilLine(0);
    const picks: FlavorPick[] = nodes
      .map((n) => flavorById(n.flavorId))
      .filter(Boolean)
      .map((f) => ({
        id: f!.id,
        name: f!.name,
        nameEn: f!.nameEn,
        category: f!.category,
        color: f!.color,
        flavor: f!.flavor,
        family: f!.family,
      }));
    const analysis = await cocktailAI.analyzeFlavorMix(picks);
    sound.play(analysis.hidden ? "unlock" : "success");
    addXp(analysis.hidden ? 120 : 55);
    recordPour();
    if (analysis.hidden) recordUnlock(analysis.name);
    setLastResult(analysis, "zen");
    setBusy(false);
    showResult();
  }

  const dominantFamily = nodes.length ? flavorById(nodes[0].flavorId)?.family ?? "absinthe" : "absinthe";

  /* ── flavour graph canvas ── */
  const canvas = (
    <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-2xl border border-gold/20">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <SceneBackdrop family={dominantFamily} className="h-full w-full" />
      </div>
      <div className="absolute left-4 top-4 z-10">
        <BilingualTitle zh="魔法" en="The Alchemy Atelier" size="sm" />
        <p className="mt-1 font-cn text-xs text-paper/50">自由组合，让风味在画布上彼此扩散。</p>
      </div>

      <div
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={() => (dragId.current = null)}
        onPointerLeave={() => (dragId.current = null)}
      >
        {/* edges */}
        <svg className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          {nodes.map((n) => {
            const f = flavorById(n.flavorId);
            return (
              <line
                key={`e-${n.id}`}
                x1="50%"
                y1="50%"
                x2={`${n.x * 100}%`}
                y2={`${n.y * 100}%`}
                stroke={f?.color ?? "#C8A45D"}
                strokeOpacity="0.4"
                strokeWidth="1.2"
                strokeDasharray="2 4"
              />
            );
          })}
        </svg>

        {/* cauldron */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-ink/60 shadow-amber-soft backdrop-blur-sm">
            <span className="animate-swirl-slow text-amber/80">
              <Icon name="droplet" size={30} />
            </span>
          </div>
          <span className="mt-1 block text-center font-cn text-[10px] text-gold/60">调和</span>
        </div>

        {/* flavour orbs */}
        <AnimatePresence>
          {nodes.map((n) => {
            const f = flavorById(n.flavorId);
            if (!f) return null;
            return (
              <motion.div
                key={n.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
                onPointerDown={(e) => {
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  dragId.current = n.id;
                }}
              >
                <div className="group relative grid place-items-center">
                  {/* diffusion rings */}
                  <span
                    className="pointer-events-none absolute h-12 w-12 rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${f.color}`, opacity: 0.0 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute h-12 w-12 rounded-full border"
                    style={{ borderColor: f.color }}
                    animate={{ scale: [1, 2.1], opacity: [0.45, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  />
                  <div
                    className="grid h-12 w-12 place-items-center rounded-full border border-paper/30 shadow-amber-soft"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${f.color}, ${f.color}99 60%, ${f.color}40)`,
                    }}
                  >
                    <span className="font-cn text-[9px] font-medium text-ink/80 drop-shadow">{f.name.slice(0, 2)}</span>
                  </div>
                  <span className="mt-1 max-w-[84px] truncate text-center font-cn text-[10px] text-paper/80">{f.name}</span>
                  <button
                    onClick={() => removeNode(n.id)}
                    className="absolute -right-1 -top-1 hidden h-5 w-5 place-items-center rounded-full border border-gold/40 bg-bg-primary text-paper/70 hover:text-paper group-hover:grid"
                    aria-label="移除"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="font-cn text-sm text-paper/35">从右侧 {FLAVOR_COUNT} 种风味中挑选，开始你的实验 →</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ── ingredient library panel ── */
  const panel = (
    <div className={`glass-panel flex flex-col rounded-2xl p-4 ${layout === "portrait" ? "" : "w-[340px] shrink-0"}`}>
      <div className="flex items-baseline justify-between">
        <BilingualTitle zh="风味原料" en="Ingredients" size="sm" />
        <span className="font-cn text-[11px] text-paper/45">
          已选 {nodes.length}/{MAX_NODES}
        </span>
      </div>

      {/* search */}
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold/50">
          <Icon name="search" size={15} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`搜索 ${FLAVOR_COUNT} 种风味…`}
          className="w-full rounded-lg border border-gold/20 bg-ink/40 py-2 pl-9 pr-3 font-cn text-sm text-paper placeholder:text-paper/35 focus:border-gold/45 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper" aria-label="清除">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {/* category pills */}
      {!query && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FLAVOR_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-cn text-[11px] transition-all ${
                  active ? "border-gold/60 bg-gold/12 text-gold-bright" : "border-gold/15 text-paper/65 hover:border-gold/35"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <Divider className="my-3" />

      {/* ingredient list */}
      <div className={`grid grid-cols-1 gap-1.5 overflow-y-auto pr-1 ${layout === "portrait" ? "max-h-[38vh]" : "min-h-0 flex-1"}`}>
        {list.map((f) => {
          const picked = pickedIds.has(f.id);
          const disabled = !picked && nodes.length >= MAX_NODES;
          return (
            <button
              key={f.id}
              onClick={() => toggleFlavor(f.id)}
              disabled={disabled}
              className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all disabled:opacity-30 ${
                picked ? "border-gold/55 bg-gold/12" : "border-gold/12 hover:border-gold/35 hover:bg-gold/5"
              }`}
            >
              <span className="h-7 w-7 shrink-0 rounded-full border border-paper/20" style={{ background: `radial-gradient(circle at 35% 30%, ${f.color}, ${f.color}88)` }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-cn text-[13px] text-paper/90">{f.name}</span>
                <span className="block truncate font-serif text-[10px] italic text-gold/55">
                  {f.nameEn} · {f.flavor.slice(0, 2).join("·")}
                </span>
              </span>
              {picked ? (
                <Icon name="check" size={15} className="shrink-0 text-gold-bright" />
              ) : (
                <Icon name="plus" size={14} className="shrink-0 text-paper/30" />
              )}
            </button>
          );
        })}
        {list.length === 0 && <p className="py-6 text-center font-cn text-sm text-paper/40">没有找到匹配的风味</p>}
      </div>

      <Button className="mt-3" onClick={analyze} disabled={busy || nodes.length === 0}>
        <Icon name="sparkle" size={16} /> 分析风味
      </Button>
      {nodes.length > 3 && <p className="mt-2 text-center font-cn text-[10px] text-paper/40">组合越复杂，越可能触发隐藏配方…</p>}
    </div>
  );

  return (
    <div className={`flex h-full ${layout === "portrait" ? "flex-col" : "flex-row"} gap-4 px-4 py-4 md:px-6 md:py-5`}>
      {canvas}
      {panel}
      <AnimatePresence>{busy && <LoadingVeil visible line={veilLine} />}</AnimatePresence>
    </div>
  );
}
