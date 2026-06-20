"use client";

import { motion } from "framer-motion";
import LogoMark from "@/components/art/Logo";

const LINES = [
  "正在聆听你的心绪…",
  "调酒师在挑选基酒…",
  "诗人在斟酌词句…",
  "化学家在校准风味…",
];

/**
 * Full-bleed veil shown while CocktailAI composes. Rotates a few in-character
 * status lines so the wait feels like the bar working, not a spinner.
 */
export default function LoadingVeil({ visible, line = 0 }: { visible: boolean; line?: number }) {
  if (!visible) return null;
  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backdropFilter: "blur(7px)", background: "rgba(8,6,3,0.66)" }}
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ rotate: [0, 4, -3, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="animate-breathe"
        >
          <LogoMark size={68} />
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gold"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cn text-sm tracking-wide text-paper/80"
        >
          {LINES[line % LINES.length]}
        </motion.p>
      </div>
    </motion.div>
  );
}
