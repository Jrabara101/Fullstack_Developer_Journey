/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#080A0F',
        reader: '#0D111A',
        panel: '#141A29',
        elevated: '#1C2539',
        'subtle-border': '#232D42',
        lantern: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)',
          light: '#FBBF24',
          dark: '#B45309',
        },
        entity: {
          DEFAULT: '#38BDF8',
          glow: 'rgba(56, 189, 248, 0.25)',
          light: '#7DD3FC',
          dark: '#0284C7',
        },
        parser: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)',
          light: '#34D399',
          dark: '#059669',
        },
        condition: {
          DEFAULT: '#A855F7',
          glow: 'rgba(168, 85, 247, 0.25)',
          light: '#C084FC',
          dark: '#7E22CE',
        },
        peril: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.25)',
          light: '#F87171',
          dark: '#B91C1C',
        },
        prose: {
          main: '#E2E8F0',
          display: '#F8FAFC',
          muted: '#64748B',
        }
      },
      fontFamily: {
        serif: ['"Newsreader"', '"Crimson Pro"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.04)' },
        },
        beacon: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        scanline: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        kineticShake: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-1.5px, 1px) rotate(-0.5deg)' },
          '50%': { transform: 'translate(1.5px, -1px) rotate(0.5deg)' },
          '75%': { transform: 'translate(-1px, -1.5px) rotate(-0.25deg)' },
        },
        emberGlow: {
          '0%, 100%': { textShadow: '0 0 4px #F59E0B, 0 0 10px rgba(245, 158, 11, 0.5)' },
          '50%': { textShadow: '0 0 8px #FBBF24, 0 0 18px rgba(245, 158, 11, 0.8), 0 0 24px rgba(245, 158, 11, 0.4)' },
        },
        ghostFade: {
          '0%, 100%': { opacity: '0.45', filter: 'blur(0.5px)' },
          '50%': { opacity: '0.9', filter: 'blur(0px)' },
        }
      },
      animation: {
        shake: 'shake 0.35s ease-in-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        beacon: 'beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'kinetic-shake': 'kineticShake 0.4s infinite',
        'ember-glow': 'emberGlow 2.5s ease-in-out infinite',
        'ghost-fade': 'ghostFade 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
