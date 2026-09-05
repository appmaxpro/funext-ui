'use client';
import * as React from 'react';
import {capitalize} from '../../utils';
import { 
  generateUtilityClass ,
  generateUtilityClasses,
  useTheme,
  styled,
  composeClasses,
  clsx,
  Breakpoint,
  SxComponentProps
} from '../../styles';

export function getHiddenCssUtilityClass(slot: string) {
  return generateUtilityClass('PrivateHiddenCss', slot);
}

export const hiddenCssClasses = generateUtilityClasses('PrivateHiddenCss', [
  'root',
  'xlDown',
  'xlUp',
  'onlyXl',
  'lgDown',
  'lgUp',
  'onlyLg',
  'mdDown',
  'mdUp',
  'onlyMd',
  'smDown',
  'smUp',
  'onlySm',
  'xsDown',
  'xsUp',
  'onlyXs',
]);

const useUtilityClasses = (ownerState:any) => {
  const { classes, breakpoints } = ownerState;

  const slots = {
    root: [
      'root',
      ...breakpoints.map(({ breakpoint, dir }:any) => {
        return dir === 'only'
          ? `${dir}${capitalize(breakpoint)}`
          : `${breakpoint}${capitalize(dir)}`;
      }),
    ],
  };

  return composeClasses(slots, getHiddenCssUtilityClass, classes);
};

// FIXME(romgrk): Can't use memoTheme here, should we memo also on ownerState?
const HiddenCssRoot = styled('div', {
  name: 'PrivateHiddenCss',
  slot: 'Root',
})(({ theme, ownerState }) => {
  const hidden = {
    display: 'none',
  };

  return {
    ...ownerState.breakpoints
      .map(({ breakpoint, dir }:any) => {
        if (dir === 'only') {
          return {
            [theme.breakpoints.only(breakpoint)]: hidden,
          };
        }
        return dir === 'up'
          ? {
              [theme.breakpoints.up(breakpoint)]: hidden,
            }
          : {
              [theme.breakpoints.down(breakpoint)]: hidden,
            };
      })
      .reduce((r:any, o:any) => {
        Object.keys(o).forEach((k) => {
          r[k] = o[k];
        });
        return r;
      }, {}),
  };
});

export interface HiddenCssProps extends SxComponentProps {
  lgDown?: boolean;
  lgUp?: boolean;
  mdDown?: boolean;
  mdUp?: boolean;
  only?: Breakpoint | Breakpoint[];
  smDown?: boolean;
  smUp?: boolean;
  xlDown?: boolean;
  xlUp?: boolean;
  xsDown?: boolean;
  xsUp?: boolean;
}
/**
 * @ignore - internal component.
 */
function HiddenCss(props:HiddenCssProps) {
  const { children, className, only, ...other } = props;
  const theme = useTheme();

  if (process.env.NODE_ENV !== 'production') {
    const unknownProps = Object.keys(other).filter((propName) => {
      const isUndeclaredBreakpoint = !theme.breakpoints.keys.some((breakpoint) => {
        return `${breakpoint}Up` === propName || `${breakpoint}Down` === propName;
      });
      return !['classes', 'theme', 'isRtl', 'sx'].includes(propName) && isUndeclaredBreakpoint;
    });

    if (unknownProps.length > 0) {
      console.error(
        `MUI: Unsupported props received by \`<Hidden implementation="css" />\`: ${unknownProps.join(
          ', ',
        )}. Did you forget to wrap this component in a ThemeProvider declaring these breakpoints?`,
      );
    }
  }

  const breakpoints = [];

  for (let i = 0; i < theme.breakpoints.keys.length; i += 1) {
    const breakpoint = theme.breakpoints.keys[i];
    const breakpointUp = other[`${breakpoint}Up`];
    const breakpointDown = other[`${breakpoint}Down`];

    if (breakpointUp) {
      breakpoints.push({ breakpoint, dir: 'up' });
    }
    if (breakpointDown) {
      breakpoints.push({ breakpoint, dir: 'down' });
    }
  }

  if (only) {
    const onlyBreakpoints = Array.isArray(only) ? only : [only];
    onlyBreakpoints.forEach((breakpoint) => {
      breakpoints.push({ breakpoint, dir: 'only' });
    });
  }

  const ownerState = {
    ...props,
    breakpoints,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <HiddenCssRoot className={clsx(classes.root, className)} ownerState={ownerState}>
      {children}
    </HiddenCssRoot>
  );
}

export default HiddenCss;