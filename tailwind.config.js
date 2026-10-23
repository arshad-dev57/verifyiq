/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-default)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-elevated)',
        'surface-card': 'var(--bg-card)',
        border: 'var(--border-color)',
        'border-subtle': 'var(--border-subtle)',
        // Semantic text colors — adapt to light/dark theme
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        'text-inverse': 'var(--text-inverse)',
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#20B8CD', // Primary accent teal
          600: '#1CA4B7',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        brand: {
          teal: '#20B8CD',
          dark: '#0F1115',
          surface: '#171A21',
          border: '#262B36',
          muted: '#8A94A6',
        },
        anomaly: {
          normal: '#10B981',
          review: '#F59E0B',
          high: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
