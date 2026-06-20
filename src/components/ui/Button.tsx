"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { sound } from "@/lib/sound";

type Variant = "primary" | "ghost" | "wood" | "danger";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-amber to-amber-deep text-ink border border-gold-bright/40 shadow-amber-soft hover:from-amber-glow hover:to-amber",
  ghost:
    "bg-transparent text-paper/85 border border-gold/30 hover:border-gold/60 hover:text-paper hover:bg-gold/5",
  wood:
    "wood-panel text-paper border border-gold/25 hover:border-gold/45 hover:text-gold-bright",
  danger:
    "bg-transparent text-[#d98a7a] border border-[#d98a7a]/35 hover:bg-[#d98a7a]/10",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", full, className = "", children, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      onClick={(e) => {
        sound.play("click");
        onClick?.(e);
      }}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-ui text-sm tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        full ? "w-full" : ""
      } ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
