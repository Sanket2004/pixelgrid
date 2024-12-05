/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Figtree",system-ui, sans-serif', ...fontFamily.sans],
        mono: ['"Space Mono", monospace', ...fontFamily.mono],
      },
    },
  },
  plugins: [],
});
