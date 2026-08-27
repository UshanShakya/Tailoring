/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        canvas: '#FAFAF8',
        surface: '#FFFFFF',
        teal: {
          DEFAULT: '#2F6F5E',
          dark: '#234F43',
        },
        brass: '#C99A5B',
        border: '#E5E3DE',
        muted: '#6B6B66',
        success: '#3A7D5C',
        warning: '#C97A3D',
        error: '#B3453A',
      },
    },
  },
  plugins: [],
};
