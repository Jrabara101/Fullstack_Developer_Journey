/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        parchment: "#fbf9f5",
        "parchment-subtle": "#f4efe6",
        "parchment-card": "#ffffff",
        "stone-tint": "#eee8de",
        "stone-dark": "#363a35",
        sage: {
          DEFAULT: "#4a5d4e",
          light: "#607565",
          soft: "#e8efe9",
          container: "#d5e3d7"
        },
        terracotta: {
          DEFAULT: "#c26149",
          hover: "#ab523d",
          light: "#fcedea",
          container: "#f7dcd5"
        },
        amber: {
          DEFAULT: "#e09f3e",
          dark: "#966217",
          light: "#fef6ea"
        },
        "leaf-dark": "#2c3b2f",
        "botanical-muted": "#6b7267",
        "border-parchment": "#e5dcce"
      },
      fontFamily: {
        editorial: ['"Fraunces"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      }
    },
  },
  plugins: [],
};
