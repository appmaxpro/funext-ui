import { 
  ComponentsOverrides,
  ComponentsVariants,
  PaletteColorOptions, 
  ThemeOptions, 
  ColorSystemOptions, 
  CssVarsTheme,
  Theme as UMuiTheme,
 } 
from '@mui/material/styles';
import { CacheProvider, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { alpha } from '../../mui/utils';
import { blueGrey} from '@mui/material/colors';
import type{ AutoSelectProps } from '../../core/select/AutoSelect';

import { useStyleProps } from '../../core';
import { createTheme, extendTheme } from '@mui/material/styles';
import { Actions } from '../../core/select/select.stories';

import type { 
  DividerProps,
  DividerClassKey,
  PanelProps,
  PanelClassKey,
  CardProps,
  CardClassKey,
} from '../../mui';
import deepmerge from 'deepmerge';

export type Theme = typeof muiTheme & {
  [key:string]: any
};

type TypeTheme = Omit<Theme, 'components'>;

// Be clear about what the [@emotion/React].THeme is extending
type UiTheme = Theme;

/**
 * Configure Emotion to use our theme
 */
declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface Theme extends UiTheme {}
}

declare module '@mui/material/styles' {

  // allow configuration using `createTheme`
  export interface ColorSystemOptions {
   
  }
  export interface ThemeOptions {

  }

  interface ComponentNameToClassKey {
    MuiAutoSelect: 'root' | 'clearIcon' | 'componentsProps' | 'disabled' 
    | 'loading' | 'popupIcon' | 'fullWidth' | 'listbox' | 'paper' | 'popper' | 'styleOverrides';
    MuxDivider: DividerClassKey;
    MuxPanel: PanelClassKey;
    MuxCard: CardClassKey
  }

  interface ComponentsPropsList {
    MuiAutoSelect: Partial<AutoSelectProps<any, any, any, any, any>>;
    MuxDivider: Partial<DividerProps<any, any>>;
    MuxPanel: Partial<PanelProps<any, any>>;
    MuxCard: Partial<CardProps<any, any>>;
  }

  interface TypeAction {
    activeGray?: string;
  }

  interface Components {
    MuiAutoSelect?: {
      defaultProps?: ComponentsPropsList['MuiAutoSelect'];
      styleOverrides?: ComponentsOverrides<TypeTheme>['MuiAutoSelect'];
      variants?: ComponentsVariants['MuiAutoSelect'];
    };
    MuxDivider?: {
      defaultProps?: ComponentsPropsList['MuxDivider'];
      styleOverrides?: ComponentsOverrides<TypeTheme>['MuxDivider'];
      variants?: ComponentsVariants['MuxDivider'];
    };
    MuxPanel?: {
      defaultProps?: ComponentsPropsList['MuxPanel'];
      styleOverrides?: ComponentsOverrides<TypeTheme>['MuxPanel'];
      variants?: ComponentsVariants['MuxPanel'];
    };
    MuxCard?: {
      defaultProps?: ComponentsPropsList['MuxCard'];
      styleOverrides?: ComponentsOverrides<TypeTheme>['MuxCard'];
      variants?: ComponentsVariants['MuxCard'];
    };
  }

}

const rawTheme = {
  cssVarPrefix: 'mui',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#5037ff',
        },
        secondary: {
          main: '#f55342',
        },
        grey: {
          ...blueGrey,
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },
        action: {
          active: 'rgba(12, 9, 6, .54)',// '#F3F6F9' <=inverted=> #0c0906,
          hover: 'rgba(12, 9, 6, .04)',
          hoverOpacity: .04,
          selected: 'rgba(12, 9, 6, .08)',
          selectedOpacity: 0.08,
          disabled: 'rgba(0, 0, 0, 0.26)',
          disabledBackground: 'rgba(0, 0, 0, 0.12)',
          disabledOpacity: 0.38,
          focus: 'rgba(0, 0, 0, 0.12)',
          focusOpacity: 0.12,
          activatedOpacity: 0.12,
          activeGray: '#F3F6F9'
        }
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#5037ff',
        },
        secondary: {
          main: '#f55342',
        },
      },
    },
  },
  components: {
    MuiList: {
      defaultProps: {
        dense: false,
      }
    },
    MuiMenu:{
      styleOverrides: {
        root: {
          marginTop: '8px'
        },
        paper: ({ theme }) => theme.unstable_sx( {
          minWidth: '180px',
          borderRadius: 3,
          overflow: 'visible',
        }),
        list: {
          padding: '8px 4px',
        },
      } 
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            borderRadius: 2,
          '& .menu-icon': {
            fontSize: 18,
            color: theme.palette.text.secondary,
            marginRight: theme.spacing(1.5),
          },
          '&:active': {
            backgroundColor: alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity + .05,
            ),
          },
          '&:hover': {
            backgroundColor: alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity - .04,
            ),
          },
          })
      }
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      }
    },
    MuiButton: {
    },
    MuiButtonGroup: {
    },
    MuiFab: {
    },/*
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      }
    },*/
    MuiTextField: {
      defaultProps: {
        size: 'small',
      }
    },
    MuxDivider: {

    },
    
    MuiAutoSelect: {
      styleOverrides: {
        root: {
           sx: {
              marginTop: '30px',
              marginBottom: '30px',
           }
        },
        popper: {
          marginTop: '8px',
        },
        paper: {
          cx: {
            minWidth: '180px',
            borderRadius: 3,
            overflow: 'visible',
            marginTop: '8px',
          }
        },
        listbox: {
          padding: '8px 4px',
        }
      }
    },

    
  },
};

const muiTheme = createTheme(rawTheme);

export function createMuiThemeX(option?: ColorSystemOptions):Theme {
  return (option && extendTheme(option as any) || muiTheme);
}

export function createMuiTheme(option?: ThemeOptions):Theme {
  
  const {cssVarPrefix, colorSchemes, ...rest} = rawTheme;

  const mode = (option as any)?.pallet?.mode ?? 'light';

  const defPallet = (colorSchemes as any)[mode]?.pallet ?? colorSchemes.light;
  
  const resultPallet = deepmerge(defPallet, (option as any)?.pallet || {});

  const partComps = deepmerge(rest, option || {});


  return createTheme({
    ...(partComps as any),
    pallet: {
      mode,
      ...(resultPallet as any)
    }
  });
}

export const defaultTheme:Theme = muiTheme;
