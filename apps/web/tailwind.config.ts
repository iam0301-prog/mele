import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 移植自舊版 :root CSS variables
        primary: {
          DEFAULT: '#0D1B2A',
          light: '#1E2D45',
          deep: '#050B16',
        },
        accent: {
          DEFAULT: '#C9A227',
          light: '#E8C547',
          dim: 'rgba(201, 162, 39, 0.3)',
        },
        reverse: '#B8001F',
        success: '#2D6A4F',
        warning: '#F4A261',
        info: '#4A6FA5',
      },
      fontFamily: {
        serif: ['var(--font-noto-serif-tc)', '"Noto Serif TC"', 'serif'],
        sans: ['var(--font-noto-sans-tc)', '"Noto Sans TC"', '"Microsoft JhengHei"', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', '"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'mele-night': 'radial-gradient(ellipse at top, #1E2D45 0%, #0D1B2A 50%, #050B16 100%)',
        'mele-stars': `
          radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.4), transparent),
          radial-gradient(1px 1px at 60% 70%, rgba(201, 162, 39, 0.4), transparent),
          radial-gradient(2px 2px at 50% 50%, rgba(255, 255, 255, 0.3), transparent)
        `,
        'mele-gold': 'linear-gradient(135deg, #C9A227, #E8C547)',
        'mele-text': 'linear-gradient(135deg, #fff, #E8C547 50%, #fff)',
      },
      backgroundSize: {
        'mele-stars': '550px 550px, 350px 350px, 650px 650px',
      },
      borderColor: {
        DEFAULT: 'rgba(201, 162, 39, 0.3)',
      },
      boxShadow: {
        gold: '0 8px 25px rgba(201, 162, 39, 0.4)',
        'gold-soft': '0 8px 25px rgba(201, 162, 39, 0.15)',
        'gold-focus': '0 0 0 3px rgba(201, 162, 39, 0.15)',
      },
      letterSpacing: {
        widest: '0.25em',
        'mele-xl': '0.5em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        spin: 'spin 1.4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
