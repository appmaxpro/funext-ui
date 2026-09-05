
export interface ZIndex {
  mobileStepper: number;
  speedDial: number;
  appBar: number;
  drawer: number;
  modal: number;
  snackbar: number;
  tooltip: number;
  fab: number;
}

export type ZIndexOptions = Partial<ZIndex>;
// We need to centralize the zIndex definitions as they work
// like global values in the browser.
export const zIndex:ZIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

export function getOverlayAlpha(elevation: number): number {
  let alphaValue;
  if (elevation < 1) {
    alphaValue = 5.11916 * elevation ** 2;
  } else {
    alphaValue = 4.5 * Math.log(elevation + 1) + 2;
  }
  return Math.round(alphaValue * 10) / 1000;
}

export function shouldSkipGeneratingVar(keys: string[]) {
  return (
    !!keys[0].match(
      /(cssVarPrefix|colorSchemeSelector|typography|mixins|breakpoints|direction|transitions)/,
    ) ||
    !!keys[0].match(/sxConfig$/) || // ends with sxConfig
    (keys[0] === 'palette' && !!keys[1]?.match(/(mode|contrastThreshold|tonalOffset)/))
  );
}