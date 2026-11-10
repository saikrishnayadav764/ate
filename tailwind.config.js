/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        razorpay: {
          dark: '#0C2340',
          navy: '#132F51',
          blue: '#0C83FF',
          hover: '#006CE0',
          light: '#F4F8FC',
        }
      }
    },
  },
  plugins: [],
}

