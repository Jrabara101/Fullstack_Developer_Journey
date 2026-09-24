/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#121318',
        'on-surface': '#e3e1e9',
        'on-surface-variant': '#bdc8d1',
        surface: '#121318',
        'surface-dim': '#121318',
        'surface-bright': '#38393f',
        'surface-container-lowest': '#0d0e13',
        'surface-container-low': '#1a1b21',
        'surface-container': '#1e1f25',
        'surface-container-high': '#292a2f',
        'surface-container-highest': '#34343a',
        primary: {
          DEFAULT: '#38bdf8',
          dim: '#7bd0ff',
          container: '#0284c7',
          light: '#8ed5ff',
        },
        'on-primary': '#00354a',
        secondary: {
          DEFAULT: '#f59e0b',
          dim: '#ffb95f',
          container: '#b45309',
        },
        'on-secondary': '#472a00',
        tertiary: {
          DEFAULT: '#10b981',
          dim: '#4edea3',
          container: '#059669',
          light: '#56e5a9',
        },
        'on-tertiary': '#003824',
        error: {
          DEFAULT: '#ef4444',
          container: '#991b1b',
          light: '#ffb4ab',
        },
        'on-error': '#690005',
        outline: '#87929a',
        'outline-variant': '#3e484f',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(56, 189, 248, 0.4)',
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'neon-crimson': '0 0 20px rgba(239, 68, 68, 0.4)',
        'inner-dark': 'inset 0 4px 12px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flicker: {
          '0%': { opacity: '0.92' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
