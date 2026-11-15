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
        edge: {
          obsidian: '#0B0D11',
          panel: '#12151C',
          well: '#181C25',
          checker: '#1E232E',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          indigo: '#818CF8',
          rose: '#F43F5E',
          slate: {
            800: '#1e2430',
            850: '#161a23',
            900: '#10131a',
            950: '#0b0d11',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'checker-pattern': "radial-gradient(#1E232E 1px, transparent 1px)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar': 'sonar 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        sonar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
