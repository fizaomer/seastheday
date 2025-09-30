/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
        },
        accent: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
        },
        ink: '#0F172A',
        text: '#0B1220',
        subtext: '#475569',
        line: '#E2E8F0',
        bg: '#78aabb',
        card: '#FFFFFF',
        warn: '#F59E0B',
        bad: '#EF4444',
      },
      borderRadius: {
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
        title: ['Mansalva', 'cursive'],
      },
      boxShadow: {
        'coastal': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'coastal-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
