/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f0f9ff',
          tertiary: '#e0f2fe',
        },
        border: {
          DEFAULT: '#bae6fd',
          strong: '#7dd3fc',
        },
        text: {
          primary: '#0c4a6e',
          secondary: '#0369a1',
          muted: '#64748b',
        },
        status: {
          critical: '#ef4444',
          high:     '#f59e0b',
          moderate: '#0284c7',
          safe:     '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(2, 132, 199, 0.08), 0 1px 2px -1px rgba(2, 132, 199, 0.06)',
        panel: '0 4px 6px -1px rgba(2, 132, 199, 0.1), 0 2px 4px -2px rgba(2, 132, 199, 0.06)',
        modal: '0 20px 25px -5px rgba(2, 132, 199, 0.15), 0 8px 10px -6px rgba(2, 132, 199, 0.1)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        'xs':  ['0.75rem', { lineHeight: '1.125rem' }],
      }
    },
  },
  plugins: [],
}
