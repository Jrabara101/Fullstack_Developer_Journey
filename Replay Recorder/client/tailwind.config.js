/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-canvas': '#07090E',
        'surface-dock': 'rgba(14, 20, 36, 0.85)',
        'surface-card': '#141C30',
        'border-subtle': '#1E293B',
        'playhead-beam': '#38BDF8',
        'record-pulse': '#EF4444',
        'marker-kill': '#F59E0B',
        'marker-death': '#F43F5E',
        'marker-ability': '#8B5CF6',
        'marker-objective': '#10B981',
        'ghost-trail': 'rgba(6, 182, 212, 0.4)',
        'text-display': '#F8FAFC',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.6' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        stripes: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '30px 0' },
        }
      },
      animation: {
        'record-pulse': 'pulseGlow 1.5s ease-in-out infinite',
        'stripes-pan': 'stripes 1s linear infinite',
      }
    },
  },
  plugins: [],
}
