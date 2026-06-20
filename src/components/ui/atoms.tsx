"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "@/components/art/icons";
import { sound } from "@/lib/sound";

/** Bilingual title: Chinese display + small-caps English subtitle. */
export function BilingualTitle({
  zh,
  en,
  size = "md",
  align = "left",
  tone = "paper",
  className = "",
}: {
  zh: string;
  en?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center";
  /** "paper" = light text for dark backgrounds; "ink" = dark text for the paper book */
  tone?: "paper" | "ink";
  className?: string;
}) {
  const zhSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl md:text-5xl",
  }[size];
  const enSize = { sm: "text-[10px]", md: "text-xs", lg: "text-sm", xl: "text-base" }[size];
  const zhColor = tone === "ink" ? "text-ink" : "text-paper";
  const enColor = tone === "ink" ? "text-copper/80" : "text-gold/70";
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <h2 className={`font-cn ${zhSize} leading-tight ${zhColor}`} style={{ letterSpacing: "0.04em" }}>
        {zh}
      </h2>
      {en && (
        <p className={`font-title ${enSize} mt-1 uppercase tracking-title ${enColor}`}>{en}</p>
      )}
    </div>
  );
}

/** Ornamented gold divider. */
export function Divider({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gold-line" />
      {label ? (
        <span className="font-title text-[10px] uppercase tracking-title text-gold/60">{label}</span>
      ) : (
        <span className="text-gold/50">✦</span>
      )}
      <span className="h-px flex-1 bg-gold-line" />
    </div>
  );
}

/** Small selectable chip / tag. */
export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 font-cn text-sm transition-all ${
        active
          ? "border-gold/70 bg-gold/15 text-gold-bright shadow-amber-soft"
          : "border-gold/20 text-paper/70 hover:border-gold/40 hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

/** Circular brass icon button used in the top bar & action rows. */
export function IconButton({
  icon,
  label,
  active,
  size = 20,
  className = "",
  onClick,
  ...rest
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  size?: number;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        sound.play("click");
        onClick?.(e);
      }}
      className={`inline-grid h-10 w-10 place-items-center rounded-full border transition-all ${
        active
          ? "border-gold/60 bg-gold/15 text-gold-bright"
          : "border-gold/20 text-paper/70 hover:border-gold/45 hover:text-gold-bright hover:bg-gold/5"
      } ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

/** Step progress dots for the mode state machines. */
export function StepDots({
  steps,
  current,
}: {
  steps: { key: string; label: string }[];
  current: number;
}) {
  return (
    <ol className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] font-ui transition-all ${
                  state === "active"
                    ? "border-gold-bright bg-gold/20 text-gold-bright shadow-amber-soft"
                    : state === "done"
                      ? "border-gold/50 bg-gold/10 text-gold/80"
                      : "border-gold/20 text-paper/40"
                }`}
              >
                {state === "done" ? <Icon name="check" size={12} /> : i + 1}
              </span>
              <span
                className={`hidden font-cn text-[10px] md:block ${
                  state === "active" ? "text-gold-bright" : "text-paper/40"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={`h-px w-6 md:w-10 ${i < current ? "bg-gold/50" : "bg-gold/15"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
