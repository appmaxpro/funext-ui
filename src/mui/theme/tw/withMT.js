/**
 * This is a helper function for merging the main configuration of @material-tailwind with the Tailwind CSS configuration
 */

import merge from "deepmerge";
import colors  from "./theme-colors";
import plugins from "./plugins";

//console.log("plugins:", {colorVars: plugins.colorVars, components:plugins.components});

const materialTailwindConfig = {
  darkMode: "class",
  
  content: [
    "./node_modules/@funext/ui/mui/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/src/mui/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/src/mui/theme/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/core/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@funext/ui/src/core/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors,
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
      serif: ["Roboto Slab", "serif"],
      body: ["Roboto", "sans-serif"],
    }, 
    boxShadow: {
      xs: `var(--tw-shadow-xs)`,
      sm: `var(--tw-shadow-sm)`,
      md: `var(--tw-shadow-md)`,
      DEFAULT: `var(--tw-shadow-md)`,
      lg: `var(--tw-shadow-lg)`,
      xl: `var(--tw-shadow-xl)`,
      
      "2xl": "0 25px 50px -12px rgb(var(--tw-shadow-color-rgb) / 0.25)",
      menu: "var(--tw-shadow-sm)",
      inner: "inset 0 2px 4px 0 rgb(var(--tw-shadow-color-rgb) / 0.05)",
      none: "none",
    },
    screens: {
      xs: "0px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1140px",
      xxl: "1400px",
    },
    fontSize: {
      xxs: '.625rem',
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      'fw1': '100',
      'fw2': '200',
      'fw3': '300',
      'fw4': '400',
      'fw5': '500',
      'fw6': '600',
      'fw7': '700',
      'fw8': '800',
      'fw9': '900',
    },
    extend: {
      containers: {
        'xs': '0px',
      },
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
        '0': '0 1 0%',
        '1-auto': '1 0 auto'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      
    }
  },
  corePlugins: {
    boxShadow: false,
    boxShadowColor: false
  },
  plugins: [
    function ({ addVariant }) {
      //addVariant('inverted', '@media (inverted-colors: inverted)')
      //addVariant('hocus', ['&:focus', '&:hover'])

    },
    plugins.colorVars,
    plugins.boxShadow
    //plugins.components, 
    
  ],
  safelist: [
              "fixed",
              "absolute",
              {
                pattern: /(flex)|(flex-.+)|(justify-.+)|(items-.+)|(self-.+)|(content-.+)|(place-.+)|(inline-.+)|(grow)|(shrink)|(hidden)|(block)|(grid)|(grid-.+)/,
                variants: ['lg', 'md', 'sm']
              },
              {
                pattern: /(rounded-.+)/,
              },
              {
                pattern: /(fw.+)/,
              },
              {
                pattern: /(m-.+)|(mx-.+)|(my-.+)|(ms-.+)|(me-.+)|(mt-.+)|(mb-.+)|(ml-.+)|(mr-.+)|(p-.+)|(px-.+)|(py-.+)|(ps-.+)|(pe-.+)|(pt-.+)|(pb-.+)|(pl-.+)|(pr-.+)/,
                //variants: ['lg', 'md', 'sm']
              },
              {
                pattern: /(min-w-.+)|(max-w-.+)|(w-.+)|(min-h-.+)|(max-h-.+)|(h-.+)/,
              },
              {
                pattern: /(transition-.+)/,
              },
            ],
  blocklist: [
    'from',
    'from-*',
    'gradient',
    '-scroll',
    'scroll',
    'border-yellow-*'
  ],
};

/**
 * Merge @material-tailwind and Tailwind CSS configurations
 * @param {object} tailwindConfig - Tailwind config object
 * @return {object} new config object
 */
export default function withMT(tailwindConfig) {
  const themeFont = materialTailwindConfig.theme.fontFamily;

  if (tailwindConfig.theme && tailwindConfig.theme.fontFamily) {
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

  return merge(materialTailwindConfig, tailwindConfig);
}