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
        canvas: '#07090E',
        panel: {
          DEFAULT: '#10141F',
          elevated: '#181F30',
          sheet: '#151B2B',
        },
        border: {
          subtle: '#1E293B',
          glow: '#334155',
        },
        rating: {
          gold: '#F59E0B',
          glow: '#FBBF24',
        },
        masterpiece: '#F43F5E',
        radar: {
          cyan: '#06B6D4',
          accent: '#22D3EE',
        },
        status: {
          mastered: '#A855F7',
          beaten: '#10B981',
          dropped: '#EF4444',
          playing: '#3B82F6',
          backlog: '#F97316',
          wishlist: '#EC4899',
        },
        editorial: {
          display: '#F8FAFC',
          body: '#E2E8F0',
          muted: '#64748B',
          dim: '#475569',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.45)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'plinth': '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px 0 rgba(6, 182, 212, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
