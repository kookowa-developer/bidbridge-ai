/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { display: ['Manrope', 'Inter', 'system-ui'], body: ['Inter', 'system-ui'] },
      colors: { primary: '#4338CA', primary2: '#6D28D9', accent: '#10B981' },
      boxShadow: { soft: '0 8px 30px -12px rgba(67,56,202,.35)' }
    }
  },
  plugins: []
}
