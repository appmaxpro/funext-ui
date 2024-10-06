import color from "color";

const plugins = {
  colorVars: function({ addBase, theme }) {
    function get(val){
      if (val) {
        var cc = color(val);
        return `${cc.red()} ${cc.green()} ${cc.blue()}`
      }
    }
    function canExport(key){
      key = key+'';
      return key === '50' || key === '500' || key === '900';
    }
    function extractColorVars(colorObj, colorGroup = '') {
      const colorVar = Object.keys(colorObj).reduce((vars, colorKey) => {
        const value = colorObj[colorKey];

        const newVars =
          typeof value === 'string'
            ? colorKey === 'DEFAULT' || colorKey === '500'
            ? { [`--tw${colorGroup}-rgb`]: get(value), [`--tw${colorGroup}`]: value }
              : (canExport(colorKey) || colorGroup === '-gray' || colorGroup === '-slate'
                ? 
                { 
                  [`--tw${colorGroup}-${colorKey}-rgb`]: get(value) ,
                  [`--tw${colorGroup}-${colorKey}`]: value
                }
                : {})
            : extractColorVars(value, `-${colorKey}`);

        return { ...vars, ...newVars };
      }, {});
      return {
        ...colorVar,
        [`--tw${colorGroup}-text`]: colorVar[`--tw${colorGroup}-50`],
        [`--tw${colorGroup}-text-rgb`]: colorVar[`--tw${colorGroup}-50-rgb`]
      }
    }
    
    const gray = theme('colors')['gray'] || {};
    const colors = extractColorVars(theme('colors'));
    const bodyColor = get(gray['900']);
    const tertiaryColor = get(gray['500']);
    
    var defaults = {};
    var white = defaults['white'] || '#ffffff';
    var black = defaults['black'] || '#000000'; 
    var dark = defaults['dark'] || colors['--tw-slate-950']; 
    var light = defaults['light'] || colors['--tw-slate-50'];

    const lightScheme = {
      body_color: dark,
      body_bg: white,
      emphasis_color: black,

      body_secondary_color: colors['--tw-gray-800'],
      body_secondary_bg: colors['--tw-gray-200'],
      
      body_tertiary_color: colors['--tw-slate-700'],
      body_tertiary_bg: colors['--tw-slate-100'],

      border_color: colors['--tw-slate-300'],
      border_color_min: colors['--tw-slate-200'],

      header_min: colors['--tw-slate-50'],
      header_med: colors['--tw-slate-100'],
      header_max: colors['--tw-slate-200'],

      hd_sx: colors['--tw-slate-50'],
      hd_sm: '#F3F6F9', //#f6f8fa
      hd_md: colors['--tw-slate-200'],
      hd_lg: colors['--tw-slate-300'],
      hd_xl: colors['--tw-slate-400'],

      divide: colors['--tw-slate-300'],

      white: white,
      black: black,
      light: light,
      dark: dark,
      
      ...defaults.lightScheme
    }

    const darkScheme = {
      body_color: lightScheme.body_bg ,
      body_bg: lightScheme.body_color,
      emphasis_color: white,
      
      body_secondary_color: lightScheme.body_secondary_bg,
      body_secondary_bg: lightScheme.body_secondary_color,
      
      body_tertiary_color: lightScheme.body_tertiary_bg,
      body_tertiary_bg: lightScheme.body_tertiary_color,

      border_color: colors['--tw-slate-700'],
      border_color_min: colors['--tw-slate-800'],

      header_min: colors['--tw-slate-900'],
      header_med: colors['--tw-slate-800'],
      header_max: colors['--tw-slate-700'],

      hd_sx: colors['--tw-slate-950'],
      hd_sm: colors['--tw-slate-900'],
      hd_md: colors['--tw-slate-800'],
      hd_lg: colors['--tw-slate-700'],
      hd_xl: colors['--tw-slate-600'],

      white: black,
      black: white,
      light: dark,
      dark: light,

      divide: colors['--tw-slate-700'],
      ...defaults.darkScheme
    }

    function makeScheme(colors ){
        return Object.entries(colors)
          .map(([k, v]) => ({
             ['--tw-'+k.replaceAll('_', '-')]: v,
             ['--tw-'+k.replaceAll('_', '-')+'-rgb']: get(v),
             ...((k.includes('secondary') || k.includes('tertiary')) &&
                {
                  ['--tw-'+k.replaceAll('body_', '').replaceAll('_', '-')]: v,
                  ['--tw-'+k.replaceAll('body_', '').replaceAll('_', '-')+'-rgb']: get(v),
                }
             )
          }))
          .reduce((prev, cur)=> ({...prev, ...cur}), {});
    }
    
    addBase({
      ':root': colors,
      ':root, [data-theme=light]': makeScheme(lightScheme),
      '[data-theme=dark]':makeScheme(darkScheme),
    });
  },

  components: function({ addComponents }) {
    addComponents({
      '.toolbar': {
        minHeight: '56px',
        '@media (min-width: 0px)': {
          '@media (orientation: landscape)': {
            minHeight: '48px',
          }
        },
        '@media (min-width: 600px)': {
          minHeight: '64px',
        },
      }
    });

  }
}
export default plugins;
//module.exports = plugins;