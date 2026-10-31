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
          DEFAULT: '#080A0F',
          darker: '#05070B',
        },
        panel: {
          DEFAULT: '#0F131D',
          hover: '#141A28',
        },
        elevated: {
          DEFAULT: '#171D2B',
          highlight: '#20283A',
        },
        borderSubtle: '#1E2638',
        borderFocus: '#6366F1',
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
        },
        alchemist: {
          DEFAULT: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.25)',
          light: '#22D3EE',
        },
        deal: {
          DEFAULT: '#10B981',
          light: '#34D399',
          bg: 'rgba(16, 185, 129, 0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          bg: 'rgba(245, 158, 11, 0.12)',
        },
        danger: {
          DEFAULT: '#F43F5E',
          light: '#FB7185',
          bg: 'rgba(244, 63, 94, 0.12)',
        },
        slateText: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'specular': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
        'specular-strong': 'inset 0 1px 0 0 rgba(255,255,255,0.15)',
        'cyan-glow': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'indigo-glow': '0 0 20px -3px rgba(99, 102, 241, 0.25)',
        'glass-dock': '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
