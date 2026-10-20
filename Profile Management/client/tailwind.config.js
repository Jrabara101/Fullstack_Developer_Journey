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
          light: '#FFFFFF',
          dark: '#0A0B0E',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#121418',
          elevated: {
            light: '#FFFFFF',
            dark: '#181B22',
          }
        },
        border: {
          light: '#E2E8F0',
          dark: '#232730',
        },
        brand: {
          light: '#2563EB',
          dark: '#3B82F6',
          hover: '#1D4ED8',
        },
        status: {
          public: '#10B981',
          team: '#6366F1',
          private: '#64748B',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
