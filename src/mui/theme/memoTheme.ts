import { Theme } from './createTheme';
import defaultTheme from './defaultTheme';
type ThemeStyleFunction = (props: { theme: Theme }) => any;

// We need to pass an argument as `{ theme }` for PigmentCSS, but we don't want to
// allocate more objects.
const arg = { theme: undefined as unknown as Theme };

/**
 * Memoize style function on theme.
 * Intended to be used in styled() calls that only need access to the theme.
 */
export default function memoTheme(styleFn: ThemeStyleFunction) {
  let lastValue: any;//CSSInterpolation;
  let lastTheme: Theme;

  return (props: { theme: Theme }) => {
    let value = lastValue;
    if (value === undefined || props.theme !== lastTheme) {
      let theme = props.theme;
      if (!props.theme.palette || !props.theme.palette.background){
        theme = defaultTheme;
      } 

      arg.theme = theme;

      value = styleFn(arg);

      lastValue = value;
      lastTheme = theme;
    }

    return value;
  };
}