/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        mono: {
          bg: '#08080c',
          surface: '#0c0c12',
          border: '#1a1a24',
          'border-subtle': '#12121a',
          'border-hover': '#2a2a34',
          'text-primary': '#d0d0dc',
          'text-secondary': '#b0b0be',
          'text-muted': '#7a7a8a',
          'text-subtle': '#4a4a56',
          'text-faint': '#3a3a46',
          'text-ghost': '#2a2a34',
        },
        accent: {
          orange: '#e85d26',
          'orange-dark': '#d04f1c',
          violet: '#6366f1',
          green: '#10b981',
          yellow: '#f59e0b',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        heading: ["'Space Grotesk'", 'sans-serif'],
        body: ["'Newsreader'", 'Georgia', 'serif'],
        mono: ["'DM Mono'", "'SF Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
