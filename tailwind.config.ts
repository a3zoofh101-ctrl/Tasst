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
        line: "#E4DACB"
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
