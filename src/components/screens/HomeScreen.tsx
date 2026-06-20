"use client";

import { motion } from "framer-motion";
import type { LayoutMode } from "@/hooks/useLayout";
import { MODES } from "@/lib/data/catalog";
import { useAtelier } from "@/store/useAtelier";
import { useNav } from "@/store/useNav";
import ModeCard from "./ModeCard";
import Glass from "@/components/art/Glass";
import { isFizzy } from "@/lib/tokens";
import SceneBackdrop from "@/components/art/SceneBackdrop";
import Button from "@/components/ui/Button";
import { Divider } from "@/components/ui/atoms";
import { Icon } from "@/components/art/icons";

const WELCOME_POEM =
  "夜色压低了灯，铜与玻璃在吧台上轻声碰响。\n今晚，想为自己斟一杯怎样的心情？";

export default function HomeScreen({ layout }: { layout: LayoutMode }) {
  const last = useAtelier((s) => s.lastResult);
  const showResult = useNav((s) => s.showResult);

  /* ── Hero: today's creation if one exists, else a welcome ── */
  const Hero = (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20">
      {last ? (
        <>
          <div className="absolute inset-0">
            <SceneBackdrop family={last.result.family} className="h-full w-full opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          </div>
          <div className="relative flex flex-col items-center gap-2 px-6 py-7 text-center">
            <span className="font-title text-[10px] uppercase tracking-title text-gold/70">
              Today’s Craft · 今日创作
            </span>
            <h1 className="font-cn text-3xl text-paper md:text-4xl" style={{ letterSpacing: "0.04em" }}>
              {last.result.name}
            </h1>
            <p className="font-serif text-base italic text-gold/80">{last.result.nameEn}</p>
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Glass
                glassType={last.result.glass}
                family={last.result.family}
                ice={last.result.ice}
                fillLevel={0.62}
                glow
                fizzy={isFizzy(last.result.ingredients)}
                size={layout === "portrait" ? 150 : 180}
              />
            </motion.div>
            <div className="mt-1 flex gap-3">
              <Button variant="primary" onClick={showResult}>
                <Icon name="journal" size={16} /> 查看配方
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="relative">
          <div className="absolute inset-0">
            <SceneBackdrop family="default" className="h-full w-full opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/55 to-bg-primary/10" />
          </div>
          <div className="relative flex flex-col items-center gap-3 px-6 py-10 text-center">
            <h1 className="title-engrave font-cn text-4xl md:text-5xl" style={{ letterSpacing: "0.1em" }}>
              微醺时刻
            </h1>
            <p className="font-title text-xs uppercase tracking-title text-gold/70">The Sip & Sigh</p>
            <p className="mt-3 max-w-md whitespace-pre-line font-cn text-sm leading-relaxed text-paper/70">
              {WELCOME_POEM}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (layout === "portrait") {
    return (
      <div className="flex flex-col gap-5 px-4 py-5">
        {Hero}
        <Divider label="选择一种创作 · Choose a Craft" />
        <div className="flex flex-col gap-3">
          {MODES.map((m) => (
            <ModeCard key={m.id} mode={m} variant="row" />
          ))}
        </div>
        <p className="pb-2 text-center font-serif text-xs italic text-gold/40">
          “每一杯酒，都是一段被封存的心情。”
        </p>
      </div>
    );
  }

  /* ── Landscape ── */
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-8 py-6">
      <div className="min-h-[40%]">{Hero}</div>
      <Divider label="四大创作模式 · The Four Crafts" />
      <div className="grid flex-1 grid-cols-2 gap-4 pb-2 xl:grid-cols-4">
        {MODES.map((m) => (
          <ModeCard key={m.id} mode={m} variant="tile" />
        ))}
      </div>
    </div>
  );
}
