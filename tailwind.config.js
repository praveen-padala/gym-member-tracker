/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        app: '#F0F1FF',
        sidebar: '#0F172A',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'float': 'float 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
