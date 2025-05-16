'use client';
import * as React from 'react';
import {clsx, useTheme, styled as defStyled} from '../../styles';

import extendSxProp from '../../theme/extendSxProp';
import styleFunctionSx from '@mui/system/styleFunctionSx';

import { Theme as SystemTheme } from '../../theme';

type BoxOptions<T> = {
  themeId?: string;
  defaultTheme?: T;
  defaultClassName?: string;
  generateClassName?: (componentName: string) => string
}

export function sizingTransform(value:any) {
  return value <= 1 && value !== 0 ? `${value * 100}%` : value;
}

export default function createBox<
  T extends SystemTheme,
  AdditionalProps extends Record<string, unknown> = {}
>(options:BoxOptions<T> = {}) {
  const { themeId, defaultTheme, defaultClassName = 'MuxBox-root', generateClassName } = options;
  const BoxRoot = defStyled('div', {
    shouldForwardProp: (prop:any) => prop !== 'theme' && prop !== 'sx' && prop !== 'as',
  })(styleFunctionSx as any);

  const Box = React.forwardRef(function Box(inProps, ref) {
    const theme:SystemTheme = useTheme(defaultTheme);
    const { className, component = 'div', ...other }:any = extendSxProp(inProps);
        
    //console.log("Test box compose:", compose(VX1, VX2, VX3)({VX3: .66}))
    //console.log("createBox: sx:", other.sx);
    /*
    const {
      sx, 
      d,
      fw,
      rounded,
      border,
      ...rest
    } = other;

    const newSx = {
      ...sx,
      d,
      fw
    }*/

    

    
    return (
      <BoxRoot
        as={component}
        ref={ref}
        className={clsx(
          className,
          generateClassName ? generateClassName(defaultClassName) : defaultClassName,
        )}
        theme={theme}
        {...other}
        
      />
    );
  });

  return Box;
}