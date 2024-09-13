const colors = require("tailwindcss/colors");

console.log("__filename ", __filename);
const withMT = require("./src/mui/utils/withMTs");

console.log("===================================");

module.exports = withMT({
  content: [
    "./src/mui/components/**/*.{js,ts,jsx,tsx}",
    "./src/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./src/core/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./docs/html/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        secondary: colors.slate,
      },
      fontSize: {
        "3xl": "1.75rem",
      }
    },
  },
  plugins: []
});
