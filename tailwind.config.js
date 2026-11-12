/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: { brand: { primary: '#2FEF10', orange: '#FF8A36', surface: '#111713', background: '#050805' } } } },
  plugins: []
};
