const colors = require("tailwindcss/colors");

console.log("__filename ", __filename);
const withMT = require("./src/mui/theme/tw/withMT");


const tw = withMT({
  content: [
    "./src/mui/components/**/*.{js,ts,jsx,tsx}",
    "./src/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./src/core/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./docs/html/**/*.{js,ts,jsx,tsx,html}"
  ],
});
console.log("===================================");
console.log("tw.content", tw.theme);
module.exports = tw;
