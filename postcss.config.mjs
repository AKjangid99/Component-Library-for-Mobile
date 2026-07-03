// Tailwind v4 runs as a PostCSS plugin; NativeWind's Metro transformer picks
// this up when processing `src/global.css`.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
