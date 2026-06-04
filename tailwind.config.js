/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        louDark: '#0f0f0f',
        louPink: '#E5b0cb',
        louLightPink: '#ffd2fb'
      },
      fontFamily: {
        lovelo: ['Lovelo', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}
