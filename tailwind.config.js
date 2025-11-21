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
        'driblab-dark': '#1a1a1a',
        'driblab-dark-secondary': '#2a2a2a',
        'driblab-accent': '#00ff85',
        'driblab-text': '#f0f0f0',
        'driblab-subtle': '#a0a0a0',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
