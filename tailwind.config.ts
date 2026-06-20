import type { Config } from "tailwindcss";

/**
 * The Sip & Sigh — Tailwind configuration.
 * Encodes the Design System v1.0 tokens (color / typography / spacing / radius).
 * Every visual value in the app traces back to a token defined here.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Core palette (design_system §3.1) ──────────────────────────
        bg: {
          primary: "#0E0B08",
          secondary: "#15110D",
          tertiary: "#1B150F",
        },
        wood: {
          DEFAULT: "#3B2A1F",
          light: "#4E3826",
          dark: "#281C14",
        },
        gold: {
          DEFAULT: "#C8A45D",
          soft: "#A88945",
          bright: "#E3C684",
        },
        amber: {
          DEFAULT: "#D89C3A",
          glow: "#F0B14B",
          deep: "#A9701F",
        },
        paper: {
          DEFAULT: "#E7D6B1",
          aged: "#D8C399",
          shadow: "#B9A074",
        },
        ink: {
          DEFAULT: "#1A1612",
          soft: "#2A231B",
        },
        copper: "#9C5A33",
        absinthe: "#7E8C4E",
      },
      fontFamily: {
        // Cinzel → titles · Cormorant → body · Inter → UI · Songti → 中文
        title: ["var(--font-cinzel)", "Cinzel", "serif"],
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        ui: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        cn: ['"Maoken Fengyasong"', '"Songti SC"', '"STSong"', '"Noto Serif SC"', "serif"],
      },
      spacing: {
        // 8pt system (design_system §3.3)
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        "amber-glow": "0 0 40px -8px rgba(216,156,58,0.45)",
        "amber-soft": "0 0 22px -6px rgba(216,156,58,0.30)",
        plate: "0 18px 40px -20px rgba(0,0,0,0.9)",
        "inset-edge": "inset 0 1px 0 0 rgba(231,214,177,0.10)",
        engrave:
          "inset 0 1px 1px rgba(0,0,0,0.6), 0 1px 0 rgba(231,214,177,0.06)",
      },
      backgroundImage: {
        "amber-radial":
          "radial-gradient(ellipse at 50% 38%, rgba(240,177,75,0.16) 0%, rgba(216,156,58,0.05) 38%, transparent 70%)",
        "wood-grain":
          "repeating-linear-gradient(96deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 5px, rgba(231,214,177,0.025) 8px)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(200,164,93,0.6), transparent)",
      },
      letterSpacing: {
        title: "0.18em",
        wide: "0.08em",
      },
      keyframes: {
        "flame-flicker": {
          "0%,100%": { opacity: "0.85", transform: "scale(1)" },
          "45%": { opacity: "1", transform: "scale(1.04)" },
          "70%": { opacity: "0.78", transform: "scale(0.98)" },
        },
        "amber-breathe": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "rise-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "swirl-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        flame: "flame-flicker 3.2s ease-in-out infinite",
        breathe: "amber-breathe 4.5s ease-in-out infinite",
        rise: "rise-fade 0.6s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 3.5s linear infinite",
        "swirl-slow": "swirl-slow 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
