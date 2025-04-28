
import { 
  ThemeOptions, 
  Theme as UMuiTheme,
 } 
from '../theme';
import createTheme  from './createTheme';

const rawTheme:ThemeOptions = {
  //cssVarPrefix: 'mux',
  palette: {
    mode: 'light',
    primary: {
      main: '#5037ff',
    },
    secondary: {
      main: '#f55342',
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
  components: {
    MuxDivider: {

    },
    MuxAutoSelect: {
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
        panel: {
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

const defaultTheme = createTheme(rawTheme);

export default defaultTheme;