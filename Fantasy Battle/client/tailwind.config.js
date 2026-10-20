/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#06080D',
          panel: '#0D111A',
          card: '#131826',
          border: '#263147',
          active: '#F59E0B',
          crimson: '#EF4444',
          emerald: '#10B981',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          hazard: '#DC2626',
          display: '#F8FAFC',
          muted: '#64748B',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'parry-flash': 'parryFlash 0.3s ease-out forwards',
        'shake': 'screenShake 0.15s ease-in-out',
        'heat-glow': 'heatGlow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        parryFlash: {
          '0%': { opacity: '0.9', transform: 'scale(1.03)' },
          '100%': { opacity: '0', transform: 'scale(1)' },
        },
        screenShake: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-4px, 3px)' },
          '40%': { transform: 'translate(4px, -3px)' },
          '60%': { transform: 'translate(-3px, -2px)' },
          '80%': { transform: 'translate(3px, 2px)' },
        },
        heatGlow: {
          '0%': { boxShadow: '0 0 10px rgba(220, 38, 38, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
