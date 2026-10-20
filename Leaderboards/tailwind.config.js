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
        arena: {
          canvas: 'var(--bg-canvas, #07090E)',
          dock: 'var(--surface-dock, #0C101A)',
          card: 'var(--surface-card, #131926)',
          elevated: 'var(--surface-elevated, #1C2436)',
        },
        border: {
          subtle: 'var(--border-subtle, #1E283D)',
          active: 'var(--border-active, #38BDF8)',
        },
        accent: {
          live: 'var(--accent-live, #EF4444)',
          victory: 'var(--accent-victory, #10B981)',
          gold: 'var(--accent-gold, #F59E0B)',
          cyan: 'var(--bracket-highlight, #06B6D4)',
        },
        bracket: {
          connector: 'var(--bracket-connector, #334155)',
          highlight: 'var(--bracket-highlight, #06B6D4)',
        },
        display: 'var(--text-display, #F8FAFC)',
        mutedText: 'var(--text-muted, #64748B)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'score-flare': {
          '0%': { transform: 'scale(1)', backgroundColor: 'transparent' },
          '30%': { transform: 'scale(1.25)', backgroundColor: 'rgba(239, 68, 68, 0.45)', color: '#FFFFFF' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
        'victory-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 16px 2px rgba(16, 185, 129, 0.5)' },
        },
        'dispute-flash': {
          '0%, 100%': { borderColor: '#1E283D', boxShadow: 'none' },
          '50%': { borderColor: '#F59E0B', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' },
        },
        'beam-travel': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'score-flare': 'score-flare 0.4s ease-out',
        'victory-pulse': 'victory-pulse 2s infinite',
        'dispute-flash': 'dispute-flash 1.2s infinite',
        'beam-travel': 'beam-travel 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
