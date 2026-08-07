/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Maia — morado mate (color principal de marca)
        primary: {
          50: '#EEE7F1', // maia-purple-soft
          100: '#E4D7EA',
          200: '#C9B4D1',
          300: '#A989B5',
          400: '#866A95',
          500: '#634875', // maia-purple
          600: '#5A436B',
          700: '#4D355E', // maia-purple-dark
          800: '#3D2A4B',
          900: '#2E1F39',
          950: '#22172A',
        },
        // Beige — acento elegante
        secondary: {
          50: '#F7F0E6',
          100: '#F3E9DE', // maia-beige-soft
          200: '#E7D4BF', // maia-beige
          300: '#D9BC97',
          400: '#C9A171',
          500: '#B98950',
          600: '#A1723F',
          700: '#7F5732',
          800: '#5E3F25',
          900: '#3F2B19',
        },
        // Verde/lavanda lavander — fondos suaves
        accent: {
          50: '#F5F0F6', // maia-lavender
          100: '#F0E9F2',
          200: '#E3D6E6',
          300: '#CDB8D2',
          400: '#B197B9',
          500: '#9677A0',
          600: '#7D5D88',
          700: '#634875',
          800: '#4D355E',
          900: '#38243F',
        },
        neutral: {
          50: '#FAF7F5',
          100: '#F3EEEB',
          200: '#E8DFE9', // borde
          300: '#D4CBD6',
          400: '#A79EAB',
          500: '#746B78', // texto secundario
          600: '#5E5662',
          700: '#4A434E',
          800: '#36303C',
          900: '#33263A', // texto principal
          950: '#1F1A24',
        },
        ivory: '#FCF9F6', // maia-ivory
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft': '0 6px 30px -10px rgba(77, 53, 94, 0.12)',
        'card': '0 2px 12px -4px rgba(77, 53, 94, 0.08)',
        'sm': '0 1px 2px 0 rgba(77, 53, 94, 0.05)',
        'elegant': '0 14px 40px -12px rgba(77, 53, 94, 0.22)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #634875 0%, #4D355E 100%)',
        'gradient-soft': 'linear-gradient(135deg, #EEE7F1 0%, #F5F0F6 50%, #F3E9DE 100%)',
        'gradient-hero': 'linear-gradient(180deg, #FCF9F6 0%, #F5F0F6 60%, #EEE7F1 100%)',
      },
    },
  },
  plugins: [],
}