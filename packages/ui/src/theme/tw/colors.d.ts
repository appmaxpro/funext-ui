
export interface Color {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100: string;
  A200: string;
  A400: string;
  A700: string;
}

export interface ThemeColors {
  inherit: "inherit";
  current: "currentColor";
  transparent: "transparent";
  white: "#ffffff";
  black: "#000000";

  primary: Color;
  light: Color;
  slate: Color;
  gray: Color;
  orange: Color;
  green: Color;
  cyan: Color;
  sky: Color;
  blue: Color;
  indigo: Color;
  purple: Color;
  pink: Color;
  red: Color;
}

let colors:ThemeColors = {}; 

export default colors; 