/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#e8f5f0',
          100: '#c7e6d8',
          200: '#a1d5be',
          300: '#78c2a2',
          400: '#4fa984',
          500: '#2f8f6a',
          600: '#1f7856',
          700: '#166147',
          800: '#124d3a',
          900: '#0d3a2c',
          950: '#082720',
        },
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
