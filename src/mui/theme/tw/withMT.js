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
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      menu: "0px 4px 20px rgba(170, 180, 190, 0.3)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      none: "0 0 rgb(0, 0 / 0, 0)",
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
  plugins: [
    function ({ addVariant }) {
      //addVariant('inverted', '@media (inverted-colors: inverted)')
      //addVariant('hocus', ['&:focus', '&:hover'])

    },
    plugins.colorVars,
    plugins.components, 
    
  ],
  safelist: [
              "fixed",
              "absolute",
              /*
              {
                pattern: /bg-.+/,
                //variants: ['lg', 'hover', 'focus', 'focus-within', 'active', 'lg:hover'],
              },
              {
                pattern: /text-.+/,
                //variants: ['lg', 'hover', 'focus', 'focus-within', 'active', 'lg:hover'],
              },*/
              {//self-
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
              /*
              {
                pattern: /(border-.+)|(transition-.+)/,
              },*/
            ],
  blocklist: [
    'from',
    'from-*',
    'gradient',
    '-scroll',
    'scroll'
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