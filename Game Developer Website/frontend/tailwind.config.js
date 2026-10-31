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
        foreground: '#f3f4f6',
        card: {
          DEFAULT: '#0f131c',
          foreground: '#f9fafb',
          border: '#1f293d',
        },
        engine: {
          unity: '#22c55e',
          godot: '#478cbf',
          unreal: '#9333ea',
          webgl: '#f59e0b',
          custom: '#ec4899',
        },
        xray: {
          green: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
        },
        hud: {
          panel: 'rgba(15, 19, 28, 0.85)',
          border: 'rgba(56, 189, 248, 0.25)',
          glow: 'rgba(56, 189, 248, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Rajdhani', 'Chakra Petch', 'sans-serif'],
      },
      keyframes: {
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        }
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.2s ease-in-out',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'neon-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'neon-purple': '0 0 20px -3px rgba(168, 85, 247, 0.35)',
        'xray': '0 0 25px 2px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
};
