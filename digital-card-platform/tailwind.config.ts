import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EDE4',
        'cream-dark': '#EDE3D8',
        foreground: '#1C1917',
        muted: '#78716C',
        'muted-light': '#A8A29E',
        'border-subtle': '#E7E5E4',
        surface: '#FAFAF9',
        background: "var(--background)",
        brand: {
          orange: '#FF5722',
          charcoal: '#303942',
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        brand: ['"ITC Bauhaus"', '"Bauhaus 93"', 'Comfortaa', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '12px',
        pill: '9999px',
      },
      spacing: {
        section: '120px',
        'section-mobile': '80px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '500px' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
