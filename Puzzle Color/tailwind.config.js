/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0e14",
        foreground: "#e2e8f0",
        surface: {
          DEFAULT: "#101319",
          lowest: "#080a0f",
          dim: "#0c0f15",
          low: "#151820",
          container: "#1b1f28",
          high: "#242935",
          highest: "#2f3645",
          bright: "#3b4356",
        },
        primary: {
          DEFAULT: "#38bdf8",
          container: "#0284c7",
          foreground: "#031525",
          dim: "#0284c7",
        },
        secondary: {
          DEFAULT: "#f43f5e",
          container: "#e11d48",
          foreground: "#ffffff",
        },
        tertiary: {
          DEFAULT: "#eab308",
          container: "#ca8a04",
          foreground: "#1c1917",
          fixed: "#fde047",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          glow: "#22d3ee",
        },
        magenta: {
          DEFAULT: "#ec4899",
          glow: "#f472b6",
        },
        yellow: {
          DEFAULT: "#eab308",
          glow: "#facc15",
        },
        carbon: {
          DEFAULT: "#18181b",
          glow: "#27272a",
        },
        titanium: {
          DEFAULT: "#f8fafc",
          glow: "#ffffff",
        },
        outline: {
          DEFAULT: "#64748b",
          variant: "#334155",
        },
        error: {
          DEFAULT: "#f87171",
          container: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ripple": "ripple 0.8s ease-out forwards",
        "laser-pulse": "laserPulse 2s ease-in-out infinite",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        laserPulse: {
          "0%, 100%": { opacity: "0.8", filter: "drop-shadow(0 0 4px #ffffff)" },
          "50%": { opacity: "1", filter: "drop-shadow(0 0 10px #38bdf8)" },
        },
      },
    },
  },
  plugins: [],
};
