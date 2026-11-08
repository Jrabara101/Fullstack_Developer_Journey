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
        canvas: {
          primary: '#07080A',
          secondary: '#101216',
          elevated: 'rgba(18, 20, 26, 0.88)',
          light: '#F5F4EF',
        },
        signal: {
          emerald: '#10B981',
          cyan: '#00F0FF',
          crimson: '#FF3366',
          amber: '#FF6B00',
          violet: '#A855F7',
          yellow: '#FBBF24',
        },
        era: {
          accent: 'var(--era-accent, #FF3366)',
          secondary: 'var(--era-secondary, #00F0FF)',
          glow: 'var(--era-glow, rgba(255, 51, 102, 0.25))',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        editorial: ['Newsreader', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3.2s linear infinite',
        'spin-record': 'spin 1.8s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

