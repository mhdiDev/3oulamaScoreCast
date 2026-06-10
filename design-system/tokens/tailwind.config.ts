import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand: Pitch (primary blue-dark) ──
        pitch: {
          950: '#020d1a',
          900: '#041629',
          800: '#0a2540',
          700: '#0e3460',
          600: '#154d8f',
          500: '#1a65c0',
          400: '#3b82f6',
          300: '#93c5fd',
          200: '#bfdbfe',
        },
        // ── Accent: Gold (rewards, CTA) ──
        gold: {
          950: '#451a03',
          800: '#78350f',
          600: '#b45309',
          500: '#d97706',
          400: '#f59e0b',
          300: '#fbbf24',
          200: '#fde68a',
          50:  '#fef9c3',
        },
        // ── Semantic: Grass (success, correct) ──
        grass: {
          950: '#052e16',
          800: '#14532d',
          700: '#166534',
          500: '#16a34a',
          400: '#22c55e',
          300: '#4ade80',
          200: '#86efac',
        },
        // ── Semantic overrides ──
        surface:  '#1e293b',
        border:   '#334155',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'score': ['3rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'hero':  ['2rem', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '800' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      borderRadius: {
        'sm':  '4px',
        DEFAULT: '8px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
      },

      boxShadow: {
        'sm':   '0 1px 3px rgba(0,0,0,0.4)',
        'md':   '0 4px 12px rgba(0,0,0,0.5)',
        'lg':   '0 8px 24px rgba(0,0,0,0.6)',
        'glow': '0 0 20px rgba(21,77,143,0.5)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.4)',
        'inner': 'inset 0 2px 4px rgba(0,0,0,0.3)',
      },

      transitionDuration: {
        'fast': '100ms',
        'base': '200ms',
        'slow': '300ms',
      },

      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      animation: {
        'pulse-live':  'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':    'slideUp 0.3s cubic-bezier(0,0,0.2,1)',
        'fade-in':     'fadeIn 0.2s ease-out',
        'score-pop':   'scorePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      },

      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scorePop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },

      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}

export default config
