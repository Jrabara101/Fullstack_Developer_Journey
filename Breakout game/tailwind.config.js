/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          cyan: '#06b6d4',
          magenta: '#d946ef',
          emerald: '#10b981',
          amber: '#f59e0b',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          blue: '#3b82f6',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.45), 0 0 40px rgba(6, 182, 212, 0.2)',
        'neon-magenta': '0 0 20px rgba(217, 70, 239, 0.45), 0 0 40px rgba(217, 70, 239, 0.2)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.45)',
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.45)',
        'glass-glow': '0 8px 32px -4px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(6,182,212,0.9))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    },
  },
  plugins: [],
}
