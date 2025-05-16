import deepmerge from '@mui/utils/deepmerge';
import { 
  darken, 
  getContrastRatio, 
  lighten 
} from '@mui/system/colorManipulator';

import colors from './tw/theme-colors';
import type {Color} from './tw/colors';
import { isDevelopment } from '../utils';

export type PaletteMode = 'light' | 'dark';

export {};
// use standalone interface over typeof colors/commons
// to enable module augmentation
export interface CommonColors {
  black: string;
  white: string;
}

export type ColorPartial = Partial<Color>;

export interface TypeText {
  primary: string;
  secondary: string;
  disabled: string;
  icon?: string;
}

export interface TypeAction {
  active: string;
  hover: string;
  hoverOpacity: number;
  selected: string;
  selectedOpacity: number;
  disabled: string;
  disabledOpacity: number;
  disabledBackground: string;
  focus: string;
  focusOpacity: number;
  activatedOpacity: number;
  activeGray: string;
}

export interface TypeBackground {
  default: string;
  paper: string;
}

export type TypeDivider = string;

export type PaletteColorOptions = SimplePaletteColorOptions | ColorPartial;

export interface SimplePaletteColorOptions {
  light?: string;
  main: string;
  dark?: string;
  contrastText?: string;
}

export interface PaletteColor {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

export interface TypeObject {
  text: TypeText;
  action: TypeAction;
  divider: TypeDivider;
  background: TypeBackground;
}

export type PaletteTonalOffset =
  | number
  | {
      light: number;
      dark: number;
    };


export interface PaletteAugmentColorOptions {
  color: PaletteColorOptions;
  mainShade?: number | string;
  lightShade?: number | string;
  darkShade?: number | string;
  name?: number | string;
}

export interface Palette {
  common: CommonColors;
  mode: PaletteMode;
  contrastThreshold: number;
  tonalOffset: PaletteTonalOffset;
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  grey: Color;
  text: TypeText;
  divider: TypeDivider;
  action: TypeAction;
  background: TypeBackground;
  getContrastText: (background: string) => string;
  augmentColor: (options: PaletteAugmentColorOptions) => PaletteColor;
  twColors?: Array<string>;
}

export interface Channels {
  mainChannel: string;
  lightChannel: string;
  darkChannel: string;
  contrastTextChannel: string;
}

export type PartialTypeObject = { [P in keyof TypeObject]?: Partial<TypeObject[P]> };

export interface PaletteOptions {
  primary?: PaletteColorOptions;
  secondary?: PaletteColorOptions;
  error?: PaletteColorOptions;
  warning?: PaletteColorOptions;
  info?: PaletteColorOptions;
  success?: PaletteColorOptions;
  dark?: PaletteColorOptions;
  light?: PaletteColorOptions;
  mode?: PaletteMode;
  tonalOffset?: PaletteTonalOffset;
  contrastThreshold?: number;
  common?: Partial<CommonColors>;
  grey?: ColorPartial;
  text?: Partial<TypeText>;
  divider?: string;
  action?: Partial<TypeAction>;
  background?: Partial<TypeBackground>;
  getContrastText?: (background: string) => string;
}
const common:any = {
  black: '#000',
  white: '#fff',
};


export const light: TypeObject = {
  // The colors used to style the text.
  text: {
    // The most important text.
    primary: 'rgba(0, 0, 0, 0.87)',
    // Secondary text.
    secondary: 'rgba(0, 0, 0, 0.6)',
    // Disabled text have even lower visual prominence.
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  // The color used to divide different elements.
  divider: 'rgba(0, 0, 0, 0.12)',
  // The background colors used to style the surfaces.
  // Consistency between these values is important.
  background: {
    paper: common.white,
    default: common.white,
  },
  // The colors used to style the action elements.
  action: {
    // The color of an active action like an icon button.
    active: 'rgba(0, 0, 0, 0.54)',
    // The color of an hovered action.
    hover: 'rgba(0, 0, 0, 0.04)',
    hoverOpacity: 0.04,
    // The color of a selected action.
    selected: 'rgba(0, 0, 0, 0.08)',
    selectedOpacity: 0.08,
    // The color of a disabled action.
    disabled: 'rgba(0, 0, 0, 0.26)',
    // The background color of a disabled action.
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(0, 0, 0, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
    activeGray: '#F3F6F9'
  },
};

export const dark:TypeObject = {
  text: {
    primary: common.white,
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    icon: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  background: {
    paper: '#121212',
    default: '#121212',
  },
  action: {
    active: common.white,
    hover: 'rgba(255, 255, 255, 0.08)',
    hoverOpacity: 0.08,
    selected: 'rgba(255, 255, 255, 0.16)',
    selectedOpacity: 0.16,
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(255, 255, 255, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.24,
    activeGray: '#F3F6F9'
  },
};

function addLightOrDark(intent:any, direction:string, shade:any, tonalOffset:any) {
  const tonalOffsetLight = tonalOffset.light || tonalOffset;
  const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;

  if (!intent[direction]) {
    if (intent.hasOwnProperty(shade)) {
      intent[direction] = intent[shade];
    } else if (direction === 'light') {
      intent.light = lighten(intent.main, tonalOffsetLight);
    } else if (direction === 'dark') {
      intent.dark = darken(intent.main, tonalOffsetDark);
    }
  }
}



export default function createPalette(palette:any) {
  const { mode = 'light', contrastThreshold = 2, tonalOffset = 0.2, ...other } = palette;

  const primary = palette.primary || colors.primary;
  const secondary = palette.secondary || colors.pink;
  const error = palette.error || colors.red;
  const info = palette.info || colors.sky;
  const success = palette.success || colors.green;
  const warning = palette.warning || colors.orange;
  const darkCp = palette.dark || colors.slate;
  const lightCp = palette.light || colors.light;
  // Use the same logic as
  // Bootstrap: https://github.com/twbs/bootstrap/blob/1d6e3710dd447de1a200f29e8fa521f8a0908f70/scss/_functions.scss#L59
  // and material-components-web https://github.com/material-components/material-components-web/blob/ac46b8863c4dab9fc22c4c662dc6bd1b65dd652f/packages/mdc-theme/_functions.scss#L54
  function getContrastText(background:any) {
    const contrastText =
      getContrastRatio(background, dark.text.primary) >= contrastThreshold
        ? dark.text.primary
        : light.text.primary;

    if (isDevelopment) {
      const contrast = getContrastRatio(background, contrastText);
      if (contrast < 3 && false) {
        console.error(
          [
            `MUI: The contrast ratio of ${contrast}:1 for ${contrastText} on ${background}`,
            'falls below the WCAG recommended absolute minimum contrast ratio of 3:1.',
            'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast',
          ].join('\n'),
        );
      }
    }

    return contrastText;
  }

  const augmentColor = ({ color, name, mainShade = 500, lightShade = 300, darkShade = 700 }:any) => {
    color = { ...color };
    if (!color.main && color[mainShade]) {
      color.main = color[mainShade];
    }

    if (!color.hasOwnProperty('main')) {
      throw new Error(
        `MUI: The color${(name ? ' '+name : '')} provided to augmentColor(color) is invalid.\n
          'The color object needs to have a 'main' property or a '${mainShade}' property.`,
      );
    }

    if (typeof color.main !== 'string') {
      throw new Error(
        'MUI: The color%s provided to augmentColor(color) is invalid.\n' +
          '`color.main` should be a string, but `%s` was provided instead.\n' +
          '\n' +
          'Did you intend to use one of the following approaches?\n' +
          '\n' +
          'import { green } from "@mui/material/colors";\n' +
          '\n' +
          'const theme1 = createTheme({ palette: {\n' +
          '  primary: green,\n' +
          '} });\n' +
          '\n' +
          'const theme2 = createTheme({ palette: {\n' +
          '  primary: { main: green[500] },\n' +
          '} });',
        name ? ` (${name})` : '',
        //@ts-ignore
        JSON.stringify(color.main),
      );
    }

    addLightOrDark(color, 'light', lightShade, tonalOffset);
    addLightOrDark(color, 'dark', darkShade, tonalOffset);
    if (!color.contrastText) {
      color.contrastText = getContrastText(color.main);
    }

    return color;
  };

  const modes:any = { dark, light };

  if (isDevelopment) {
    if (!modes[mode]) {
      console.error(`MUI: The palette mode \`${mode}\` is not supported.`);
    }
  }

  const paletteOutput = deepmerge(
    {
      // A collection of common colors.
      common: { ...common }, // prevent mutable object.
      // The palette mode, can be light or dark.
      mode,
      // The colors used to represent primary interface elements for a user.
      primary: augmentColor({ color: primary, name: 'primary' }),
      // The colors used to represent secondary interface elements for a user.
      secondary: augmentColor({
        color: secondary,
        name: 'secondary',
        //mainShade: 'A400',
        //lightShade: 'A200',
        //darkShade: 'A700',
      }),
      twColors: Object.keys(colors).filter((k) => Boolean((colors as any)[k]['500'])),
      // The colors used to represent interface elements that the user should be made aware of.
      error: augmentColor({ color: error, name: 'error' }),
      // The colors used to represent potentially dangerous actions or important messages.
      warning: augmentColor({ color: warning, name: 'warning' }),
      // The colors used to present information to the user that is neutral and not necessarily important.
      info: augmentColor({ color: info, name: 'info' }),
      // The colors used to indicate the successful completion of an action that user triggered.
      success: augmentColor({ color: success, name: 'success' }),
      light: augmentColor({ color: lightCp, name: 'light', mainShade:'400', lightShade: '200', darkShade: '950' }),
      dark: augmentColor({ color: darkCp, name: 'dark', mainShade:'900', lightShade: '400', darkShade: '950'  }),
      // The grey colors.
      grey: {
        ...colors.gray,
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
      },
      slate: colors.slate,
      // Used by `getContrastText()` to maximize the contrast between
      // the background and the text.
      contrastThreshold,
      // Takes a background color and returns the text color that maximizes the contrast.
      getContrastText,
      // Generate a rich color object.
      augmentColor,
      // Used by the functions below to shift a color's luminance by approximately
      // two indexes within its tonal palette.
      // E.g., shift from Red 500 to Red 300 or Red 700.
      tonalOffset,
      // The light and dark mode object.
      ...modes[mode],
    },
    other,
  );

  return paletteOutput;
}