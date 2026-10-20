/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        garden: {
          50: '#f0f4ee',
          100: '#e3ebdf',
          200: '#c8d8c2',
          300: '#a5bca0',
          400: '#86a680',
          500: '#6b8b66',
          600: '#506e4d',
          700: '#40583e',
          800: '#354732',
          900: '#2c3b2b',
          950: '#172016',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
