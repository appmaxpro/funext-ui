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
      sm: "540px",
      md: "720px",
      lg: "960px",
      "lg-max": { max: "960px" },
      xl: "1140px",
      "2xl": "1320px",
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.125rem', '1.75rem'],
      xl: ['1.25rem', '1.75rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['1.25rem', '2.25rem'],
      'fs-5': '5px',
      'fs-6': '6px',
      'fs-7': '7px',
      'fs-8': '8px',
      'fs-9': '9px',
      'fs-10': '10px',
      'fs-11': '11px',
      'fs-12': '12px',
      'fs-13': '13px',
      'fs-14': '14px',
      'fs-15': '15px',
      'fs-16': '16px',
      'fs-17': '17px',
      'fs-18': '18px',
      'fs-19': '19px',
      'fs-20': '20px',
      'fs-21': '21px',
      'fs-22': '22px',
      'fs-23': '23px',
      'fs-24': '24px',
      'fs-25': '25px',
      'fs-26': '26px',
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
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      
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
  safelist: [
              "fixed",
              "absolute",
              {
                pattern: /bg-.+/,
                variants: ['lg', 'hover', 'focus', 'focus-within', 'active', 'lg:hover'],
              },
              {
                pattern: /text-.+/,
                variants: ['lg', 'hover', 'focus', 'focus-within', 'active', 'lg:hover'],
              },
              {
                pattern: /(flex)|(flex-.+)|(justify-.+)|(items-.+)|(inline-.+)|(grow)|(shrink)|(hidden)|(block)|(grid)|(grid-.+)/,
                 variants: ['lg', 'md', 'sm']
              },
              {
                pattern: /(rounded-.+)/,
              },
              {
                pattern: /(fs-.+)/,
              },
              {
                pattern: /(fw.+)/,
              },
              {
                pattern: /(m-.+)|(mx-.+)|(my-.+)|(ms-.+)|(me-.+)|(mt-.+)|(mb-.+)|(ml-.+)|(mr-.+)|(p-.+)|(px-.+)|(py-.+)|(ps-.+)|(pe-.+)|(pt-.+)|(pb-.+)|(pl-.+)|(pr-.+)/,
                variants: ['lg', 'md', 'sm']
              },
              {
                pattern: /opacity-.+/,
                variants: ['hover', 'focus', 'md', 'lg']
              },
              {
                pattern: /(w-.+)|(h-.+)|(min-w-.+)|(max-w-.+)|(min-h-.+)|(max-h-.+)/,
                variants: ['md', 'lg']
              },
              {
                pattern: /(border-.+)|(ring-.+)|(shadow-.+)|(transition-.+)/,
              },
            ]
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