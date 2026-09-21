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
        // perfume-store palette above; only used under app/(smm)).
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          DEFAULT: "#4F46E5"
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
        gold: "0 8px 24px -8px rgba(176,139,79,0.45)"
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
