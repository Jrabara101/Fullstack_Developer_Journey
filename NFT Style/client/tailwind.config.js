/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#131315",
        "surface-dim": "#131315",
        "surface-bright": "#39393b",
        "surface-variant": "#353437",
        "surface-container": "#201f22",
        "surface-container-low": "#1c1b1d",
        "surface-container-lowest": "#0e0e10",
        "surface-container-high": "#2a2a2c",
        "surface-container-highest": "#353437",
        "primary": "#4cd7f6",
        "primary-container": "#06b6d4",
        "on-primary": "#003640",
        "secondary": "#d0bcff",
        "secondary-container": "#571bc1",
        "on-secondary": "#3c0091",
        "tertiary": "#ffb95f",
        "tertiary-container": "#e79400",
        "on-tertiary": "#472a00",
        "on-surface": "#e5e1e4",
        "on-surface-variant": "#bcc9cd",
        "outline": "#869397",
        "outline-variant": "#3d494c",
        "error": "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
