import dsc from '@mui/system/styleFunctionSx/defaultSxConfig';

import {
  compose, 
  style, 
  SxConfig, 
} from '@mui/system';

import {
  width as sWidth,
  height as sHeight
} from '@mui/system/sizing';


import { 
  createUnaryUnit, 
  getValue 
} from '@mui/system/spacing';

import { handleBreakpoints } from '@mui/system/breakpoints';
import responsivePropType from '@mui/system/responsivePropType';



function sizingTransform(value:any) {
  return value <= 1 && value !== 0 ? `${value * 100}%` : value;
}

export const width = style({
  prop: 'w',
  cssProperty: 'width',
  transform: sizingTransform,
});

export const height = style({
  prop: 'h',
  cssProperty: 'height',
  transform: sizingTransform,
});


const createGapProp = (t:string, tt:string) => {
  const result = (props:any) => {
    const val = props[t];
    if (val || val === 0) {
      const transformer = createUnaryUnit(props.theme, 'spacing', 8, tt);
      const styleFromPropValue = (propValue:any) => ({
        [tt]: getValue(transformer, propValue),
      });
      return handleBreakpoints(props, val, styleFromPropValue);
    }
    return null;
  }
  result.filterProps = [t];
  return result;
}

const extendedSxConfig:SxConfig = {
  ...dsc,
  ms: dsc.marginInlineStart,
  me: dsc.marginInlineEnd,
  ps: dsc.paddingInlineStart,
  pe: dsc.paddingInlineEnd,
  // borders
  w: {
    style: width
  },
  h: {
    style: height
  },
  d: {
    style: style({
      prop: 'd',
      cssProperty: 'display',
      transform: (value:any) => value,
    })
  },
  g: {style: createGapProp('g', 'gap'), cssProperty: 'gap'},
  rg: {style: createGapProp('rg', 'rowGap'), cssProperty: 'rowGap'},
  cg: {style: createGapProp('cg', 'columnGap'), cssProperty: 'columnGap'},
  c: {...dsc.color, cssProperty: 'color'},
  bg: dsc.bgcolor,
  fs: dsc.fontSize,
  fw: {
    themeKey: 'typography',
    cssProperty: 'fontWeight'
  },
  fd: {
    style: style({
      prop: 'fd',
      cssProperty: 'flexDirection',
      transform: (value:any) => value === 'col' ? 'column' : value,
    })
  }
};


export default extendedSxConfig;