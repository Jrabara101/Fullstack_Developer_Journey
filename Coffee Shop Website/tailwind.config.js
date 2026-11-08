/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          oat: '#FAF6F0',
          parchment: '#F2EAE0',
        },
        surface: {
          ceramic: '#FFFDF9',
          roast: '#1C1512',
          'glass-oat': 'rgba(250, 246, 240, 0.86)',
          'glass-espresso': 'rgba(28, 21, 18, 0.78)',
        },
        espresso: {
          primary: '#231915',
          dark: '#1C1512',
        },
        cacao: {
          secondary: '#5C4940',
        },
        oat: {
          muted: '#8C7A70',
          light: '#E6DCCF',
          soft: '#F4ECE1',
        },
        terracotta: {
          DEFAULT: '#C86D44',
          hover: '#B55D36',
          light: '#F8ECE6',
        },
        matcha: {
          DEFAULT: '#4A6B53',
          light: '#EAF1EC',
        },
        amber: {
          honey: '#D99B26',
          light: '#FCF5E8',
        },
        berry: {
          origin: '#9E4752',
          light: '#F8EAEC',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(35, 25, 21, 0.05)',
        'warm-md': '0 8px 20px -4px rgba(35, 25, 21, 0.07)',
        'warm-lg': '0 16px 36px -8px rgba(35, 25, 21, 0.09)',
        'warm-xl': '0 24px 48px -12px rgba(35, 25, 21, 0.12)',
      },
      borderRadius: {
        'card': '16px',
        'frame': '20px',
        'hub': '24px',
      }
    },
  },
  plugins: [],
}

