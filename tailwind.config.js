/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        flow: {
          green: '#97F11D',
          dark: '#111111',
          surface: '#0D0D0D',
          gray: '#707070',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          muted: '#707070',
        }
      },
      fontFamily: {
        machina: ['Neue Machina', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

module.exports = config;

