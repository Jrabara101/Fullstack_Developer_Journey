/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FFFFFF',
          dark: '#0A0B0E',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#111318',
          elevated: {
            light: '#FFFFFF',
            dark: '#171A21',
          }
        },
        hairline: {
          light: '#E2E8F0',
          dark: '#222630',
        },
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#6366F1',
          hover: '#4338CA',
        },
        emerald: {
          signal: '#10B981',
          deep: '#059669',
        },
        cobalt: {
          signal: '#3B82F6',
          deep: '#2563EB',
        },
        violet: {
          signal: '#8B5CF6',
          deep: '#7C3AED',
        },
        amber: {
          signal: '#F59E0B',
          deep: '#D97706',
          border: '#FCD34D',
        },
        crimson: {
          signal: '#EF4444',
          deep: '#DC2626',
          border: '#FCA5A5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'amber-glow': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
        'indigo-glow': '0 0 20px -5px rgba(79, 70, 229, 0.3)',
      }
    },
  },
  plugins: [],
}
