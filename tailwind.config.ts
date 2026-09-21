import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#191410",
        cream: "#F7F2EA",
        sand: "#EAE0CE",
        gold: {
          DEFAULT: "#B08B4F",
          light: "#D4B87A",
          dark: "#8C6C36"
        },
        maroon: "#5A1F2A",
        line: "#E4DACB",

        // Tasst SMM platform design tokens (namespaced separately from the
        // perfume-store palette above; only used under app/(smm)). A
        // custom violet — not stock Tailwind indigo — paired with a "spark"
        // fuchsia used sparingly for gradients/glow on the brand mark and
        // primary CTAs, to read as social/growth rather than generic SaaS.
        brand: {
          50: "#F3EEFF",
          100: "#E7DCFF",
          200: "#CDB8FF",
          300: "#AE8AFF",
          400: "#9160FF",
          500: "#7A3CF5",
          600: "#6423E0",
          700: "#5119B8",
          800: "#3F1390",
          900: "#2E0D6B",
          DEFAULT: "#6423E0"
        },
        spark: {
          DEFAULT: "#F0338B",
          light: "#FF6FB3",
          dark: "#B81667"
        },
        accent: {
          DEFAULT: "#F5A524",
          dark: "#C77D0C"
        },
        success: { DEFAULT: "#16A34A", bg: "#DCFCE7" },
        warning: { DEFAULT: "#D97706", bg: "#FEF3C7" },
        danger: { DEFAULT: "#DC2626", bg: "#FEE2E2" },
        canvas: "rgb(var(--smm-bg) / <alpha-value>)",
        surface: "rgb(var(--smm-surface) / <alpha-value>)",
        surface2: "rgb(var(--smm-surface-2) / <alpha-value>)",
        border2: "rgb(var(--smm-border) / <alpha-value>)",
        fg: "rgb(var(--smm-fg) / <alpha-value>)",
        muted: "rgb(var(--smm-muted) / <alpha-value>)"
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "sans-serif"],
        latin: ["var(--font-latin)", "serif"]
      },
      letterSpacing: {
        widest2: "0.28em"
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(25,20,16,0.18)",
        gold: "0 8px 24px -8px rgba(176,139,79,0.45)",
        glow: "0 8px 24px -8px rgba(100,35,224,0.45)",
        glowLg: "0 16px 44px -12px rgba(100,35,224,0.55)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6423E0 0%, #F0338B 100%)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease-out both",
        fadeIn: "fadeIn 0.6s ease-out both",
        shimmer: "shimmer 2.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
