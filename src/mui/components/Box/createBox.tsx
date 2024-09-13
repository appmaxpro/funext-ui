'use client';
import * as React from 'react';
import {clsx, useTheme} from '../../styles';

import extendSxProp from '../../theme/extendSxProp';
import styleFunctionSx from '@mui/system/styleFunctionSx';
import {compose, style} from '@mui/system';
import emStyled from '@emotion/styled';

import { Theme as SystemTheme } from '../../theme';



function styled(tag:any, options:any) {
  const stylesFactory = emStyled(tag, options);

  if (process.env.NODE_ENV !== 'production') {
    return (...styles:Array<any>[]) => {
      const component = typeof tag === 'string' ? `"${tag}"` : 'component';
      if (styles.length === 0) {
        console.error(
          [
            `MUI: Seems like you called \`styled(${component})()\` without a \`style\` argument.`,
            'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.',
          ].join('\n'),
        );
      } else if (styles.some((style) => style === undefined)) {
        console.error(
          `MUI: the styled(${component})(...args) API requires all its args to be defined.`,
        );
      }
      return stylesFactory(...styles);
    };
  }

  return stylesFactory;
}

type BoxOptions<T> = {
  themeId?: string;
  defaultTheme?: T;
  defaultClassName?: string;
  generateClassName?: (componentName: string) => string
}

export function sizingTransform(value:any) {
  return value <= 1 && value !== 0 ? `${value * 100}%` : value;
}

const VX1 = style({
  prop: 'VX1',
  transform: sizingTransform,
});


const VX2 = style({
  prop: 'VX2',
  transform: sizingTransform,
});

const VX3 = style({
  prop: 'VX3',
  transform: sizingTransform,
});

export default function createBox<
  T extends SystemTheme,
  AdditionalProps extends Record<string, unknown> = {}
>(options:BoxOptions<T> = {}) {
  const { themeId, defaultTheme, defaultClassName = 'MuxBox-root', generateClassName } = options;
  const BoxRoot = styled('div', {
    shouldForwardProp: (prop:any) => prop !== 'theme' && prop !== 'sx' && prop !== 'as',
  })(styleFunctionSx as any);

  const Box = React.forwardRef(function Box(inProps, ref) {
    const theme:SystemTheme = useTheme(defaultTheme);
    const { className, component = 'div', ...other }:any = extendSxProp(inProps);

    
    
    //console.log("Test box compose:", compose(VX1, VX2, VX3)({VX3: .66}))
    console.log("createBox: sx:", other.sx);
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