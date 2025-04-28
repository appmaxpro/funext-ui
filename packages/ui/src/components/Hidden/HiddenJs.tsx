'use client';
import * as React from 'react';
import exactProp from '@mui/utils/exactProp';
import withWidth, { isWidthDown, isWidthUp } from './withWidth';

import { 
  useTheme,
  Breakpoint
} from '../../styles';

export interface HiddenJsProps {
  width?: Breakpoint;
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
  children?:React.ReactNode;
  className?:string;
  type?: 'hidden' | 'visible'
}

/**
 * @ignore - internal component.
 */
function HiddenJs(props:HiddenJsProps) {
  const { children, only, width, type='hidden' } = props;
  const theme = useTheme();
  const defaultHidden = type === 'hidden';
  let visible = defaultHidden;

  // `only` check is faster to get out sooner if used.
  if (only) {
    if (Array.isArray(only)) {
      for (let i = 0; i < only.length; i += 1) {
        const breakpoint = only[i];
        if (width === breakpoint) {
          visible = !defaultHidden;
          break;
        }
      }
    } else if (only && width === only) {
      visible = !defaultHidden;
    }
  }

  // Allow `only` to be combined with other props. If already hidden, no need to check others.
  if (visible === defaultHidden) {
    // determine visibility based on the smallest size up
    for (let i = 0; i < theme.breakpoints.keys.length; i += 1) {
      const breakpoint = theme.breakpoints.keys[i];
      const breakpointUp = props[`${breakpoint}Up`];
      const breakpointDown = props[`${breakpoint}Down`];
      if (
        (breakpointUp && isWidthUp(breakpoint, width!)) ||
        (breakpointDown && isWidthDown(breakpoint, width!))
      ) {
        visible = !defaultHidden;
        break;
      }
    }
  }

  if (!visible) {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

if (process.env.NODE_ENV !== 'production') {
  //@ts-ignore
  HiddenJs.propTypes = exactProp(HiddenJs.propTypes);
}

export default withWidth()(HiddenJs);