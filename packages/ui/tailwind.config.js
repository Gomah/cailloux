const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['.ladle/**/*.{js,ts,css,jsx,tsx}', './src/**/*.{js,ts,css,jsx,tsx}'],

  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },

  presets: [require('@acme/tailwind-config').default],
};
