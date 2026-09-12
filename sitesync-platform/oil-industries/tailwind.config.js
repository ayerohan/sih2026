/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0E1012',
          900: '#171A1D',
          850: '#1C2024',
          800: '#222629',
          700: '#2F353A',
          600: '#464E54',
          500: '#626B73',
          400: '#8A9196',
          300: '#B2B7BA',
          200: '#D5D8DA',
          100: '#EAECEE',
          50: '#F4F5F6',
        },
        offwhite: {
          50: '#FCFBF9',
          100: '#F4F2ED',
          200: '#E8E5DC',
          300: '#D8D4C8',
        },
        amber: {
          brand: '#D99A24',
          hover: '#C2871A',
          light: '#FDF6E2',
          subtle: '#3A2E12',
        },
        safety: {
          orange: '#D96B27',
          hover: '#BD571B',
          light: '#FDF0E9',
        },
        industrial: {
          green: '#3E8B62',
          greenLight: '#EAF5EF',
          red: '#C94B43',
          redLight: '#FDEEEF',
          blue: '#2B7CB3',
          blueLight: '#EBF4FA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'container': '24px',
        'card': '20px',
        'table': '16px',
        'control': '12px',
      },
      boxShadow: {
        'industrial': '0 4px 20px -2px rgba(23, 26, 29, 0.08), 0 2px 6px -1px rgba(23, 26, 29, 0.04)',
        'industrial-lg': '0 10px 30px -4px rgba(23, 26, 29, 0.12), 0 4px 10px -2px rgba(23, 26, 29, 0.06)',
        'industrial-dark': '0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 2px 8px -1px rgba(0, 0, 0, 0.2)',
        'glow-amber': '0 0 20px rgba(217, 154, 36, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scan 6s linear infinite',
      }
    },
  },
  plugins: [],
}
