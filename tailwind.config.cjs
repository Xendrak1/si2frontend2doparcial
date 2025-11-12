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
        light: {
          DEFAULT: '#fefefe',
          text: '#111827',
          primary: '#3b82f6',
        },
        dark: {
          DEFAULT: '#1f2937',
          text: '#f9fafb',
          primary: '#60a5fa',
        },
        custom1: {
          DEFAULT: '#fde68a',
          text: '#78350f',
          primary: '#f59e0b',
        },
        custom2: {
          DEFAULT: '#d1fae5',
          text: '#065f46',
          primary: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
