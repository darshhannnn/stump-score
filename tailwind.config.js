/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        // Royal "stadium night" blue - primary actions, links, hero
        brand: {
          50: '#eef5ff',
          100: '#d9e9ff',
          200: '#bcd8ff',
          300: '#8ebfff',
          400: '#589bff',
          500: '#3377fb',
          600: '#1d56ef',
          700: '#1641db',
          800: '#1837b0',
          900: '#1a328b',
          950: '#131f52',
        },
        // Pitch green - success, completed matches, positive accents
        pitch: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 32px -12px rgba(16, 24, 40, 0.16)',
        'glow-brand': '0 0 0 1px rgba(51, 119, 251, 0.12), 0 10px 36px -10px rgba(29, 86, 239, 0.45)',
        'glow-gold': '0 8px 28px -8px rgba(245, 158, 11, 0.55)',
        'glow-emerald': '0 8px 28px -8px rgba(16, 185, 129, 0.55)',
        'glow-rose': '0 8px 28px -8px rgba(244, 63, 94, 0.5)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(.21,1.02,.73,1)',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(.21,1.02,.73,1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(.21,1.02,.73,1)',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-once': 'pulseOnce 0.8s ease-in-out',
        'score-pop': 'scorePop 0.3s ease-out',
        'marquee': 'marquee 32s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradientShift 8s ease infinite',
        'float': 'float 7s ease-in-out infinite',
        'spin-slow': 'spin 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceIn: { '0%': { opacity: '0', transform: 'scale(0.3)' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseOnce: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        scorePop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)' } },
        // Seamless loop: content is duplicated once, we slide exactly half
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
}
