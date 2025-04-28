import * as React from 'react';
import getDisplayName from '@mui/utils/getDisplayName';
import { getThemeProps } from '@mui/system/useThemeProps';
import { useMediaQuery } from '@mui/system';
import { PropInjector } from '../../props';
import {useTheme, Breakpoint} from '../../styles';
import { useEnhancedEffect } from '../../hooks';
const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl'];

export interface WithWidthOptions {
  withTheme?: boolean;
  noSSR?: boolean;
  initialWidth?: Breakpoint;
  resizeInterval?: number;
}

export interface WithWidth {
  width: Breakpoint;
}

export interface WithWidthProps extends Partial<WithWidth> {
  innerRef?: React.Ref<any>;
}



// By default, returns true if screen width is the same or greater than the given breakpoint.
export const isWidthUp = (breakpoint:Breakpoint, width:Breakpoint, inclusive:boolean = true) => {
  if (inclusive) {
    return breakpointKeys.indexOf(breakpoint) <= breakpointKeys.indexOf(width);
  }
  return breakpointKeys.indexOf(breakpoint) < breakpointKeys.indexOf(width);
};

// By default, returns true if screen width is less than the given breakpoint.
export const isWidthDown = (breakpoint:Breakpoint, width:Breakpoint, inclusive:boolean = false) => {
  if (inclusive) {
    return breakpointKeys.indexOf(width) <= breakpointKeys.indexOf(breakpoint);
  }
  return breakpointKeys.indexOf(width) < breakpointKeys.indexOf(breakpoint);
};

export function withWidth(
  options?: WithWidthOptions,
): PropInjector<WithWidth, WithWidthProps>;

export function withWidth(options:WithWidthOptions = {})
 : PropInjector<WithWidth, WithWidthProps> { 
  return (Component) => {
    const {
      withTheme: withThemeOption = false,
      noSSR = false,
      initialWidth: initialWidthOption,
    } = options;

    function WithWidth(props:any) {
      const contextTheme = useTheme();
      const theme = props.theme || contextTheme;
      const { initialWidth, width, ...other } = getThemeProps({
        theme,
        name: 'MuxWithWidth',
        props,
      });

      const [mountedState, setMountedState] = React.useState(false);
      useEnhancedEffect(() => {
        setMountedState(true);
      }, []);

      /**
       * innerWidth |xs      sm      md      lg      xl
       *            |-------|-------|-------|-------|------>
       * width      |  xs   |  sm   |  md   |  lg   |  xl
       */
      const keys = theme.breakpoints.keys.slice().reverse();
      const widthComputed = keys.reduce((output:any, key:any) => {
        // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const matches = useMediaQuery(theme.breakpoints.up(key));
        return !output && matches ? key : output;
      }, null);

      const more = {
        width:
          width ||
          (mountedState || noSSR ? widthComputed : undefined) ||
          initialWidth ||
          initialWidthOption,
        ...(withThemeOption ? { theme } : {}),
        ...other,
      };

      // When rendering the component on the server,
      // we have no idea about the client browser screen width.
      // In order to prevent blinks and help the reconciliation of the React tree
      // we are not rendering the child component.
      //
      // An alternative is to use the `initialWidth` property.
      if (more.width === undefined) {
        return null;
      }

      return <Component {...more} />;
    }

    if (process.env.NODE_ENV !== 'production') {
      WithWidth.displayName = `WithWidth(${getDisplayName(Component)})`;
    }

    return WithWidth;
  }
}

export default withWidth;