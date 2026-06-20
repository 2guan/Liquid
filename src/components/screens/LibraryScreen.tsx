"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import {
  SPIRITS,
  SPIRIT_CATEGORIES,
  SPIRIT_COUNT,
  spiritsByCategory,
  searchSpirits,
  type SpiritCategory,
} from "@/lib/data/spirits";
import Bottle from "@/components/art/Bottle";
import Button from "@/components/ui/Button";
import { BilingualTitle, Chip, Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";
import { useNav } from "@/store/useNav";

export default function LibraryScreen({ layout }: { layout: LayoutMode }) {
  const [selectedId, setSelectedId] = useState(SPIRITS[0].id);
  const [category, setCategory] = useState<SpiritCategory>("whisky");
  const [query, setQuery] = useState("");
  const selected = SPIRITS.find((s) => s.id === selectedId) ?? SPIRITS[0];
  const enterPureWith = useNav((s) => s.enterPureWith);

  const list = useMemo(
    () => (query.trim() ? searchSpirits(query) : spiritsByCategory(category)),
    [query, category],
  );

  const shelf = (
    <div className="relative">
      <div className="mb-1 flex items-end justify-between">
        <BilingualTitle zh="酒库" en="Library" />
        <span className="font-cn text-xs text-paper/45">{SPIRIT_COUNT} 款珍藏</span>
      </div>

      {/* search */}
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold/50">
          <Icon name="search" size={15} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`搜索 ${SPIRIT_COUNT} 款基酒（名称 / 产地 / 风味）…`}
          className="w-full rounded-lg border border-gold/20 bg-ink/40 py-2 pl-9 pr-8 font-cn text-sm text-paper placeholder:text-paper/35 focus:border-gold/45 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper" aria-label="清除">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {/* category tabs */}
      {!query && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SPIRIT_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full border px-3 py-1 font-cn text-[12px] transition-all ${
                  active ? "border-gold/60 bg-gold/12 text-gold-bright" : "border-gold/15 text-paper/65 hover:border-gold/35"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <Divider className="my-3" />

      {/* shelves of bottles */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 xl:grid-cols-6">
        {list.map((s) => {
          const active = s.id === selectedId;
          return (
            <button key={s.id} onClick={() => setSelectedId(s.id)} className="group relative flex flex-col items-center">
              <motion.div whileHover={{ y: -4 }} className={`grid place-items-center rounded-lg px-1 pt-2 transition-colors ${active ? "bg-gold/10" : ""}`}>
                <Bottle family={s.family} label={s.nameEn[0]} size={layout === "portrait" ? 52 : 62} glow={active} />
              </motion.div>
              <span className="mt-1 h-1.5 w-full rounded-full bg-gradient-to-b from-wood-light to-wood-dark shadow-plate" />
              <span className={`mt-1.5 max-w-[84px] truncate font-cn text-[11px] ${active ? "text-gold-bright" : "text-paper/65"}`}>
                {s.name.replace(/\s*\d.*$/, "")}
              </span>
            </button>
          );
        })}
        {list.length === 0 && <p className="col-span-full py-8 text-center font-cn text-sm text-paper/40">没有找到匹配的基酒</p>}
      </div>
    </div>
  );

  const detail = (
    <motion.div
      key={selected.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel flex flex-col rounded-2xl p-5"
    >
      <div className="flex items-center justify-center pb-2">
        <Bottle family={selected.family} label={selected.nameEn[0]} size={118} glow />
      </div>
      <BilingualTitle zh={selected.name} en={selected.nameEn} size="md" align="center" />
      <div className="mt-3 flex items-center justify-center gap-4 font-ui text-xs text-paper/55">
        <span className="flex items-center gap-1">
          <Icon name="info" size={13} /> {selected.origin}
        </span>
        <span>ABV {selected.abv}%</span>
      </div>
      <Divider className="my-4" />
      <p className="text-center font-cn text-sm leading-relaxed text-paper/75">{selected.note}</p>
      <div className="mt-4">
        <p className="mb-2 font-title text-[10px] uppercase tracking-title text-gold/55">Flavour · 风味</p>
        <div className="flex flex-wrap gap-2">
          {selected.flavor.map((f) => (
            <Chip key={f}>{f}</Chip>
          ))}
        </div>
      </div>
      <Button className="mt-6" onClick={() => enterPureWith(selected.id)}>
        <Icon name="droplet" size={16} /> 以此酒纯饮
      </Button>
    </motion.div>
  );

  if (layout === "portrait") {
    return (
      <div className="flex flex-col gap-5 px-4 py-5">
        {shelf}
        {detail}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto px-8 py-6">
      <div className="overflow-y-auto pr-2">{shelf}</div>
      <div className="self-start">{detail}</div>
    </div>
  );
}
