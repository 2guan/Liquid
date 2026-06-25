"use client";

import { useEffect } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useLayout, useDocumentHidden } from "@/hooks/useLayout";
import { useNav } from "@/store/useNav";
import { useAtelier } from "@/store/useAtelier";
import { sound } from "@/lib/sound";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { MobileHeader } from "./MobileChrome";

import HomeScreen from "@/components/screens/HomeScreen";
import PurePourScreen from "@/components/screens/PurePourScreen";
import MixologyScreen from "@/components/screens/MixologyScreen";
import MoodScreen from "@/components/screens/MoodScreen";
import ZenScreen from "@/components/screens/ZenScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import LibraryScreen from "@/components/screens/LibraryScreen";
import JournalScreen from "@/components/screens/JournalScreen";
import AchievementsScreen from "@/components/screens/AchievementsScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

function ViewRouter({ layout }: { layout: "landscape" | "portrait" }) {
  const view = useNav((s) => s.view);
  const hidden = useDocumentHidden();

  const screen = (() => {
    switch (view) {
      case "home":
        return <HomeScreen layout={layout} />;
      case "pure":
        return <PurePourScreen layout={layout} />;
      case "mixology":
        return <MixologyScreen layout={layout} />;
      case "mood":
        return <MoodScreen layout={layout} />;
      case "zen":
        return <ZenScreen layout={layout} />;
      case "result":
        return <ResultScreen layout={layout} />;
      case "library":
        return <LibraryScreen layout={layout} />;
      case "journal":
        return <JournalScreen layout={layout} />;
      case "achievements":
        return <AchievementsScreen layout={layout} />;
      case "settings":
        return <SettingsScreen layout={layout} />;
      default:
        return <HomeScreen layout={layout} />;
    }
  })();

  // When the tab is hidden, rAF is throttled and an in-flight transition would
  // freeze — swap views instantly instead (also avoids stacking frozen views).
  if (hidden) {
    return (
      <div className="relative h-full">
        <div key={view} className="absolute inset-0 h-full">
          {screen}
        </div>
      </div>
    );
  }

  // Overlapping crossfade (not mode="wait"): the incoming view mounts
  // immediately and the outgoing one fades out on top of it. This keeps
  // navigation responsive even if the tab is backgrounded mid-transition
  // (where a "wait" exit animation would otherwise stall the new view).
  return (
    <div className="relative h-full">
      <AnimatePresence initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full"
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AppShell() {
  const layout = useLayout();
  const musicOn = useAtelier((s) => s.musicOn);
  const sfxOn = useAtelier((s) => s.sfxOn);
  // the Home view is a full-bleed landing (its own header + bottom nav) — the
  // sidebar / top bar / mobile chrome only appear once a section is open.
  const isHome = useNav((s) => s.view) === "home";

  // Keep the synth's flags in sync with the persisted preferences, and re-arm
  // the AudioContext on the first user gesture (browser autoplay policy).
  useEffect(() => {
    sound.setMusicEnabled(musicOn);
  }, [musicOn]);
  useEffect(() => {
    sound.setSfxEnabled(sfxOn);
  }, [sfxOn]);
  useEffect(() => {
    const handler = () => sound.resumeIfEnabled();
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, []);

  if (layout === "portrait") {
    return (
      <MotionConfig reducedMotion="user">
        <div className="relative z-10 flex h-[100dvh] flex-col">
          {!isHome && <MobileHeader />}
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
            <ViewRouter layout="portrait" />
          </main>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10 flex h-[100dvh]">
        {!isHome && <Sidebar />}
        <div className="flex min-w-0 flex-1 flex-col">
          {!isHome && <TopBar />}
          <main className="relative min-h-0 flex-1 overflow-hidden">
            <ViewRouter layout="landscape" />
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
