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
          secondary: {
            light: '#F8FAFC',
            dark: '#131418',
          },
          elevated: {
            light: '#FFFFFF',
            dark: '#191B20',
          },
          hover: {
            light: 'rgba(15, 23, 42, 0.04)',
            dark: 'rgba(255, 255, 255, 0.05)',
          },
        },
        border: {
          divider: {
            light: '#E2E8F0',
            dark: '#242730',
          },
        },
        text: {
          primary: {
            light: '#0F172A',
            dark: '#F8FAFC',
          },
          muted: {
            light: '#64748B',
            dark: '#8F9CAE',
          },
        },
        accent: {
          unread: {
            light: '#2563EB',
            dark: '#3B82F6',
          },
          dot: '#3B82F6',
        },
        status: {
          action: '#F59E0B',
          critical: '#EF4444',
          resolved: '#10B981',
        },
        channel: {
          email: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'badge-pop': 'badgePop 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-down': 'slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        badgePop: {
          '0%': { transform: 'scale(0.8)' },
          '60%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1.0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
