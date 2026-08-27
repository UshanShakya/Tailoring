/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        teal: {
          DEFAULT: 'var(--color-teal)',
          dark: 'var(--color-teal-dark)',
        },
        brass: 'var(--color-brass)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
    },
  },
  plugins: [],
};
