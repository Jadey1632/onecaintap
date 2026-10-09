/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cainta: {
          navy: '#050D38',
          blue: '#0B1C63',
          royal: '#132B8C',
          bright: '#1E40AF',
          gold: '#F6D83B',
          'gold-hover': '#EAC81E',
          accent: '#FFB703',
          light: '#F4F7FC',
          card: '#0A1754',
          border: '#1E317B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      },
      boxShadow: {
        'cainta': '0 10px 25px -5px rgba(11, 28, 99, 0.4), 0 8px 10px -6px rgba(11, 28, 99, 0.3)',
        'glow': '0 0 20px rgba(246, 216, 59, 0.35)',
        'cert': '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
}
