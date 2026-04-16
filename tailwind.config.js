module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E60000',   // Vodafone Kırmızı
        secondary: '#BF0000', // Vodafone Koyu Kırmızı
      },
    },
  },
  plugins: [],

  keyframes: {
    'gradient-x': {
      '0%, 100%': { 'background-position': '0% 50%' },
      '50%': { 'background-position': '100% 50%' },
    },
  },
  animation: {
    'gradient-x': 'gradient-x 6s ease infinite',
  },
}
