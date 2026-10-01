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
        // Primary Blue Theme (Sky/Ocean)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8', // Primary Accent Light
          500: '#0EA5E9', // Active/Buttons Accent
          600: '#0284C7', // Main Sky Blue Primary
          700: '#0369A1', // Darker Primary Sky
          800: '#075985',
          900: '#0C4A6E',
        },
        // Slate neutrals for Light Theme
        appBg: '#F8FAFC',   // Root slate-50
        cardBg: '#FFFFFF',  // Crisp white container
        textMain: '#0F172A', // Slate-900
        textSec: '#475569',  // Slate-600
        textMuted: '#94A3B8',// Slate-400
        borderLight: '#E2E8F0', // Slate-200
        dividerLight: '#F1F5F9',// Slate-100
        // Status Colors
        status: {
          successBg: '#ECFDF5',
          successText: '#10B981',
          warningBg: '#FFFBEB',
          warningText: '#F59E0B',
          dangerBg: '#FEF2F2',
          dangerText: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        video: '16 / 9',
      },
      maxWidth: {
        container: '1280px',
      }
    },
  },
  plugins: [],
}
