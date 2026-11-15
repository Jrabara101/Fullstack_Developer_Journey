/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F5F2',
        primary: '#1C2DC4',
        'primary-container': '#3B4BDB',
        'primary-fixed': '#DFE0FF',
        'primary-tint': '#EEF0FB',
        'on-surface': '#14161A',
        'on-surface-variant': '#6B7078',
        outline: '#757686',
        'outline-variant': '#E3E1DC',
        success: '#1F8A5B',
        'success-fixed': '#93F7BE',
      },
    },
  },
  plugins: [],
}

