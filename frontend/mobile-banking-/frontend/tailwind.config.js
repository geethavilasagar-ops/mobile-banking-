/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50:  '#F0EFFF',
          100: '#E0DEFE',
          200: '#C2BCFE',
          300: '#A09BFD',
          400: '#7F79FC',
          500: '#5E57FA',
          600: '#4F46E5',
          700: '#3730A3',
          800: '#2A2478',
          900: '#1E1856',
        },
        surface: '#FFFFFF',
        inputBg: '#F5F3FF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        border: '#E5E7EB',
        error: '#EF4444',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
