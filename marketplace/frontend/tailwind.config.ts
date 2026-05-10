import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        surface: {
          DEFAULT: 'hsl(var(--color-surface) / <alpha-value>)',
          muted: 'hsl(var(--color-surface-muted) / <alpha-value>)',
          strong: 'hsl(var(--color-surface-strong) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'hsl(var(--color-text) / <alpha-value>)',
          muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
          inverse: 'hsl(var(--color-text-inverse) / <alpha-value>)',
        },
        border: 'hsl(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          hover: 'hsl(var(--color-primary-hover) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error) / <alpha-value>)',
          surface: 'hsl(var(--color-error-surface) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success) / <alpha-value>)',
          surface: 'hsl(var(--color-success-surface) / <alpha-value>)',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#002851',
          900: '#001a33',
        },
        accent: {
          50: '#f0fffe',
          400: '#06d6d0',
          500: '#00b8b0',
          600: '#009a92',
          700: '#007c74',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f0f2f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
