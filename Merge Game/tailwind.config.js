/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#080A10',
        'surface-board': '#0F1420',
        'surface-cell': '#161D2E',
        'surface-hover': '#1E2942',
        'border-subtle': '#24304A',
        tier: {
          wood: '#B45309',
          steel: '#94A3B8',
          crystal: '#06B6D4',
          arcana: '#A855F7',
          solar: '#F59E0B',
        },
        hazard: {
          anomaly: '#EF4444',
        },
        success: {
          mint: '#10B981',
        },
        text: {
          display: '#F8FAFC',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'bloom': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'jitter': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bloom': 'bloom 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'jitter': 'jitter 0.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
