/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        synth: {
          bg: "#08020f",
          dark: "#060012",
          surface: "#110524",
          card: "#120426",
          socket: "#05000c",
          pink: "#ec4899",
          hotpink: "#f43f5e",
          cyan: "#00f0ff",
          cyanDark: "#06b6d4",
          gold: "#facc15",
          amber: "#eab308",
          hazard: "#ef4444",
          purple: "#7c3aed",
        }
      },
      fontFamily: {
        righteous: ["Righteous", "sans-serif"],
        vt323: ["VT323", "monospace"],
        syne: ["Syne", "sans-serif"],
        space: ["Space Mono", "monospace"],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shake-hard': 'shakeHard 0.3s cubic-bezier(.36,.07,.19,.97) both',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.7))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 25px rgba(0,240,255,0.9))' },
        },
        shakeHard: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '15%': { transform: 'translate3d(-6px, 4px, 0) scale(0.98)' },
          '30%': { transform: 'translate3d(6px, -4px, 0) scale(0.98)' },
          '45%': { transform: 'translate3d(-4px, 2px, 0) scale(0.99)' },
          '60%': { transform: 'translate3d(4px, -2px, 0) scale(0.99)' },
          '75%': { transform: 'translate3d(-2px, 1px, 0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
