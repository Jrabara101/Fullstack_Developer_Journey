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
        background: '#12100e',
        surface: {
          DEFAULT: '#17130f',
          low: '#1f1b17',
          container: '#231f1b',
          high: '#2e2925',
          highest: '#393430',
          bright: '#3e3834',
        },
        primary: {
          DEFAULT: '#4edea3',
          container: '#10b981',
          dim: '#005236',
          foreground: '#003824',
        },
        secondary: {
          DEFAULT: '#ffb4ab',
          container: '#8f1d24',
          foreground: '#68000a',
        },
        tertiary: {
          DEFAULT: '#ffb95f',
          container: '#523200',
          foreground: '#2a1700',
        },
        outline: {
          DEFAULT: '#86948a',
          variant: '#3c4a42',
        },
        muted: {
          DEFAULT: '#2a2420',
          foreground: '#a39890',
        },
        card: {
          DEFAULT: '#1c1814',
          foreground: '#eae1da',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      keyframes: {
        'card-flip': {
          '0%': { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'tension-glitch': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(2px, -1px)' },
          '60%': { transform: 'translate(-1px, -2px)' },
          '80%': { transform: 'translate(1px, 2px)' },
        },
      },
      animation: {
        'card-flip': 'card-flip 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'ping-slow': 'ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'tension-glitch': 'tension-glitch 0.25s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
