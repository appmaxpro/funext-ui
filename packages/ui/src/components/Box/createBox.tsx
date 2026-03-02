"use client";
import * as React from "react";
import { clsx, useTheme, styled  } from "../../styles";

import extendSxProp from "../../theme/extendSxProp";
import styleFunctionSx from "@mui/system/styleFunctionSx";
import {
  BoxTypeMap,
  BoxOwnProps,
  createBox as muxCreateBox,
} from "@mui/system";

import { Theme as SystemTheme } from "../../theme";
import extendedSxConfig, {
  muxExtendedSxConfig,
} from "../../theme/extendedSxConfig";

type BoxOptions<T> = {
  themeId?: string;
  defaultTheme?: T;
  defaultClassName?: string;
  generateClassName?: (componentName: string) => string;
};


///const propSet = new Set(Object.keys(muxExtendedSxConfig));
//const boxExtendedSxConfig = styleFunctionSx(muxExtendedSxConfig);

/*
const BoxRoot = defStyled(muxCreateBox(), {
    shouldForwardProp: (prop:any) => 
      prop !== 'theme' &&
      prop !== 'sx' &&
      prop !== 'as'
  })(boxExtendedSxConfig);
*/
export default function createBox<
  T extends SystemTheme,
  AdditionalProps extends Record<string, unknown> = {},
>(options: BoxOptions<T> = {}) {
  const {
    //themeId,
    defaultTheme,
    defaultClassName = "MuxBox-root",
    generateClassName,
  } = options;

  const BoxRoot = styled('div', {
    name: 'Box',
    shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'sx' && prop !== 'as',
  })('');

  const Box = React.forwardRef(function Box(inProps, ref) {
    const theme: SystemTheme = useTheme(defaultTheme);
    const {
      className,
      component = "div",
      ...other
    } = extendSxProp(inProps);

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
  Box.displayName = "MuxBox";
  return Box;
}
