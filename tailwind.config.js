/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#f4fbf7',
          100: '#e2f5ea',
          200: '#c5ead5',
          300: '#9cd8bc',
          400: '#6cbe9d',
          500: '#46a281',
          600: '#338165',
          700: '#296853',
          800: '#235343',
          900: '#1d4438',
        },
        ink: '#1a2321',
        muted: '#4f5f58',
        line: '#e3e9e7',
        cream: '#fafbf9',
        nova: {
          navy: '#0a2f6b',
          navyDeep: '#082554',
          navySoft: '#3d5a8a',
          gold: '#d4a72c',
          goldLight: '#e7c667',
          off: '#f6f8fb',
          inkSoft: '#5b6b85',
          border: 'rgba(10, 47, 107, 0.08)',
        },
      },
    },
  },
  plugins: [],
}
