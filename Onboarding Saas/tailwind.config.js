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
        brand: {
          DEFAULT: 'var(--workspace-brand, #4F46E5)',
          light: '#6366F1',
          dark: '#4338CA',
          ring: 'var(--workspace-brand-ring, rgba(79, 70, 229, 0.22))',
        },
        canvas: {
          light: '#FFFFFF',
          dark: '#090A0F',
          secondary: '#F4F6FB',
          'secondary-dark': '#0F111A',
        },
        surface: {
          elevated: '#FFFFFF',
          'elevated-dark': '#151822',
        },
        divider: {
          light: '#E2E8F0',
          dark: '#232736',
        },
        status: {
          completed: '#10B981',
          delegated: '#7C3AED',
          skipped: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px var(--workspace-brand-ring, rgba(79, 70, 229, 0.25))',
        'subtle-elevation': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
