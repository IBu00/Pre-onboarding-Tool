module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#001E34',
        'primary-dark': '#001220',
        'primary-light': '#003050',
        secondary: '#2c3e50',
        accent: '#00a86b',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #00a86b, 0 0 10px #00a86b, 0 0 15px #00a86b' },
          '50%': { boxShadow: '0 0 10px #00a86b, 0 0 20px #00a86b, 0 0 30px #00a86b' },
        }
      }
    },
  },
  plugins: [],
}
