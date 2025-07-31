/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#22d3ee',
        'brand-violet': '#8b5cf6',
      },
    },
  },
  plugins: [],
}
