/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090b10',
        card: {
          DEFAULT: '#11141c',
          foreground: '#f3f4f6',
        },
        popover: {
          DEFAULT: '#151922',
          foreground: '#f3f4f6',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1f2430',
          foreground: '#f3f4f6',
        },
        muted: {
          DEFAULT: '#191e2b',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#262f44',
          foreground: '#f8fafc',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: '#232b3e',
        input: '#1a202c',
        ring: '#6366f1',
        rarity: {
          common: '#94a3b8',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#f59e0b',
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.8))' },
        },
        rollBounce: {
          '0%': { transform: 'rotate(0deg) scale(0.8)' },
          '50%': { transform: 'rotate(180deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'roll-bounce': 'rollBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}
