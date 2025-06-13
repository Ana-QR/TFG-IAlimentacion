// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#728a6d',    // verde oliva
        primaryStrong: '#b6c8b2', // verde oliva fuerte
        secondary: '#a888ad',  // lavanda suave
        sweetPink: '#d28b94',    // rosa suave
        tertiary: '#3e4e53',   // gris azulado oscuro
        background: '#f9f5f0', // Beige claro
        support: '#c9c9cb',    // Gris claro
        text: '#2B2B2B',       // Gris muy oscuro
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 10px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
