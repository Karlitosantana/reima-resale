/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          gray: '#F2F2F7',
          card: '#FFFFFF',
          text: '#000000',
          textSec: '#8E8E93',
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'ios-card': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'ios-float': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
