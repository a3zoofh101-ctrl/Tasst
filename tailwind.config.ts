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
        // perfume-store palette above; only used under app/(smm)). A single
        // indigo/azure family sampled from the بوست BOOST rocket mark
        // (#0070F8 mid-tone, #001F65 deep shadow) — no secondary brand hue,
        // by design.
        brand: {
          50: "#EEF4FF",
          100: "#DCE9FF",
          200: "#B9D3FF",
          300: "#86B4FF",
          400: "#4F8FFF",
          500: "#1F6FFC",
          600: "#0058E0",
          700: "#0044AD",
          800: "#002F82",
          900: "#001F5C",
          DEFAULT: "#0058E0"
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
        glow: "0 8px 24px -8px rgba(0,88,224,0.45)",
        glowLg: "0 16px 44px -12px rgba(0,88,224,0.55)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #001F5C 0%, #0058E0 100%)"
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
        },
        drawerIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        drawerOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(2%, -4%) scale(1.05)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-3%, 3%) scale(1.08)" }
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 8px 24px -8px rgba(0,88,224,0.45)" },
          "50%": { boxShadow: "0 12px 36px -8px rgba(31,111,252,0.65)" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease-out both",
        fadeIn: "fadeIn 0.6s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        drawerIn: "drawerIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
        drawerOut: "drawerOut 0.22s ease-in both",
        float: "float 9s ease-in-out infinite",
        floatSlow: "floatSlow 13s ease-in-out infinite",
        glowPulse: "glowPulse 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
