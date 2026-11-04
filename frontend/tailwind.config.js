/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medigreen: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#4CAF50',
          700: '#2E7D32', // Couleur primaire officielle
          800: '#1B5E20',
          900: '#0F3E13',
        },
        mediorange: {
          100: '#FFF3E0',
          500: '#FFB74D', // Cas Orange
          700: '#F57C00',
          900: '#E65100',
        },
        medired: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#EF5350',
          700: '#D32F2F', // Cas Rouge Urgence
          900: '#B71C1C',
        },
        earth: {
          500: '#795548', // Teinte terre Bénin
          700: '#4E342E',
        },
      },
    },
  },
  plugins: [],
}
