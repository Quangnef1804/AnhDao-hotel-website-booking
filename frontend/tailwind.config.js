/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        anhdao: {
          blue: '#E0F2FE',
          sky: '#38BDF8',
          ink: '#0F172A'
        }
      }
    }
  },
  plugins: []
};

