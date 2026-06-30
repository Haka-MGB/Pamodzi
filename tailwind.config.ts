import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ],
      },
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#d9f2e6',
          200: '#b3e5cc',
          300: '#7dd0a8',
          400: '#44b37f',
          500: '#2D6A4F',
          600: '#1F4D38',
          700: '#163828',
          800: '#0f2a1e',
          900: '#081a12',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover:   '#F0EDE6',
          page:    '#F5F3EF',
        },
        border: {
          light:  '#E5DFD3',
          medium: '#D1C9B8',
        },
        text: {
          primary:   '#1E2A2A',
          secondary: '#5A6B5E',
          muted:     '#8F9A8E',
        },
        status: {
          paid:     '#2D6A4F',
          pending:  '#D9A13B',
          overdue:  '#C35D3A',
          progress: '#4A90D9',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        md: '0 4px 12px rgba(0,0,0,0.07)',
        lg: '0 12px 32px rgba(0,0,0,0.10)',
        xl: '0 24px 64px rgba(0,0,0,0.14)',
      },
      keyframes: {
        floatShape: {
          '0%,100%': { transform: 'translateY(0) scale(1)' },
          '50%':     { transform: 'translateY(-24px) scale(1.06)' },
        },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96) translateY(12px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        shimmer:   { from: { backgroundPosition: '400% 0' }, to: { backgroundPosition: '-400% 0' } },
        spin:      { to: { transform: 'rotate(360deg)' } },
        shake:     { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-5px)' }, '40%,80%': { transform: 'translateX(5px)' } },
        popIn:     { from: { opacity:'0', transform:'scale(0.5)' }, to: { opacity:'1', transform:'scale(1)' } },
        toastIn:   { from: { opacity:'0', transform:'translateX(20px)' }, to: { opacity:'1', transform:'translateX(0)' } },
      },
      animation: {
        'float-1': 'floatShape 8s ease-in-out infinite',
        'float-2': 'floatShape 8s ease-in-out -3s infinite',
        'float-3': 'floatShape 8s ease-in-out -5s infinite',
        'float-4': 'floatShape 8s ease-in-out -1.5s infinite',
        'fade-in':  'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.22s ease',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':  'shimmer 1.4s infinite',
        'spin':     'spin 0.7s linear infinite',
        'shake':    'shake 0.4s ease',
        'pop-in':   'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
}
export default config
