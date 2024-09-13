/**
 * This is a helper function for merging the main configuration of @material-tailwind with the Tailwind CSS configuration
 */

const merge = require("deepmerge");
const colors = require("../theme/tw/colors");
const plugins = require("../theme/tw/plugins");
const typography = require("../theme/tw/typography");
const shadows = require("../theme/tw/shadows");
const breakpoints = require("../theme/tw/breakpoints");



const materialTailwindConfig = {
  darkMode: "class",
  content: [
    "./node_modules/@funext/ui/mui/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/mui/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/core/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors,
    fontFamily: typography,
    boxShadow: shadows,
    screens: breakpoints,
    extend: {
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        1000: '1000',
        fab: 1050,
        'speed-dial': 1050,
        'app-bar': 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
      },
      flex: {
        '0': '0 1'
      }
    }
    
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('inverted', '@media (inverted-colors: inverted)')
      addVariant('hocus', ['&:focus', '&:hover'])

    },
    plugins.colorVars,
    plugins.components, 
    
  ],
  safelist: Object.keys(colors)
            .map(k => {
              var result = [];
              var cur = colors[k];
              for(var kk of Object.keys(cur)){
                if (kk === 'DEFAULT') {
                  result.push(`bg-${k}`)
                  result.push(`text-${k}`)
                  result.push(`border-${k}`)
                } else {
                  result.push(`bg-${k}-${kk}`)
                  result.push(`text-${k}-${kk}`)
                  result.push(`border-${k}-${kk}`)
                }

                result.push
              };
              return  result;
            })
            .reduce((next, prev) => [...next, ...prev], [])
};

/**
 * Merge @material-tailwind and Tailwind CSS configurations
 * @param {object} tailwindConfig - Tailwind config object
 * @return {object} new config object
 */
function withMT(tailwindConfig) {
  const themeFont = materialTailwindConfig.theme.fontFamily;

  if (tailwindConfig.theme.fontFamily) {
    const { sans, serif, body } = tailwindConfig.theme.fontFamily;

    themeFont.sans = sans || themeFont.sans;
    themeFont.serif = serif || themeFont.serif;
    themeFont.body = body || themeFont.body;
  }
  /*  
  let copy = {...tailwindConfig}
  if (copy.theme && copy.theme.extend)
      delete copy.theme.extend.colors;
  if (copy.theme.colors)
    delete copy.theme.colors;
  */

  return merge(materialTailwindConfig, {...tailwindConfig});
}

module.exports = withMT;
