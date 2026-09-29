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
        felt: {
          dark: '#081c15',
          DEFAULT: '#1b4332',
          light: '#2d6a4f',
          ring: '#40916c'
        },
        card: {
          red: '#ef233c',
          blue: '#0077b6',
          green: '#2ec4b6',
          yellow: '#ffb703',
          wild: '#8338ec',
          dark: '#1e1e24'
        },
        gold: {
          DEFAULT: '#f39c12',
          glow: '#f1c40f',
          light: '#f9e79f'
        },
        crimson: {
          DEFAULT: '#e63946',
          glow: '#ff4d6d'
        }
      },
      boxShadow: {
        'felt-inner': 'inset 0 0 100px rgba(0, 0, 0, 0.7)',
        'felt-glow': '0 0 50px rgba(46, 196, 182, 0.15)',
        'gold-glow': '0 0 25px rgba(243, 156, 18, 0.5)',
        'crimson-glow': '0 0 30px rgba(230, 57, 70, 0.6)',
        'card-elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
      },
      keyframes: {
        'pulse-crimson': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(230, 57, 70, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(230, 57, 70, 0.8)' }
        },
        'float-emote': {
          '0%': { transform: 'scale(0.5) translateY(0)', opacity: '1' },
          '50%': { transform: 'scale(1.2) translateY(-40px)', opacity: '0.9' },
          '100%': { transform: 'scale(1) translateY(-80px)', opacity: '0' }
        },
        'flick-discard': {
          '0%': { transform: 'scale(1) translateY(0) rotate(0deg)' },
          '100%': { transform: 'scale(0.9) translateY(-250px) rotate(12deg)' }
        }
      },
      animation: {
        'pulse-crimson': 'pulse-crimson 1s ease-in-out infinite',
        'float-emote': 'float-emote 1.8s ease-out forwards',
        'flick-discard': 'flick-discard 0.4s ease-out forwards'
      }
    },
  },
  plugins: [],
}
