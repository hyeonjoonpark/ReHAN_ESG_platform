/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkblue: {
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#d0ddff',
          300: '#aab9ff',
          400: '#7d8eff',
          500: '#4f5bff',
          600: '#3f39f7',
          700: '#332ae3',
          800: '#2a24b9',
          900: '#262292',
          950: '#0f0d2e',
        },
      },
    },
  },
  plugins: [],
}