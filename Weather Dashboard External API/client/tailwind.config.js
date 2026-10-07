/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          'day-start': '#0E1B2E',
          'day-end': '#1E3A5F',
          'night-start': '#08090C',
          'night-end': '#0F141C',
        },
        surface: {
          panel: 'rgba(255, 255, 255, 0.08)',
          'panel-light': 'rgba(255, 255, 255, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-light': 'rgba(0, 0, 0, 0.06)',
          elevated: '#141820',
        },
        weather: {
          cyan: '#38BDF8',
          azure: '#0284C7',
          amber: '#F59E0B',
          crimson: '#EF4444',
          gold: '#FBBF24',
          frost: '#E0F2FE',
          emerald: '#10B981',
          hazard: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'compass-spin': 'compassDamp 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
