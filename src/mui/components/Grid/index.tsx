'use client';
import createGrid  from './createGrid';
//import { SxProps, SystemProps } from '@mui/system';
import { OverridableComponent, OverrideProps } from '../../props';
import { 
  Breakpoint,
  styled, 
  SxThemeProps, 
  SystemThemeProps, 
  useMuxDefaultProps 
} from '../../styles';
import React from 'react';
import {GridProps, GridTypeMap} from './GridProps';

export * from './GridProps';

export {default as gridClasses} from './gridClasses';
export * from './gridClasses';

export type GridSlot = 'root';

/**
 *
 * Demos:
 *
 * - [Grid version 2](https://next.mui.com/material-ui/react-grid2/)
 *
 * API:
 *
 * - [Grid API](https://next.mui.com/material-ui/api/grid-2/)
 */
export const Grid = createGrid({
  createStyledComponent: styled('div', {
    name: 'MuxGrid',
    slot: 'Root',
    overridesResolver: (props:any, styles:any) => styles.root,
  }),
  componentName: 'MuxGrid',
  useThemeProps: (inProps) => useMuxDefaultProps({ props: inProps, name: 'MuxGrid' }),
}) as OverridableComponent<GridTypeMap>;

export const Row = React.forwardRef<Omit<GridProps, 'direction' | 'columnSpacing' | 'rowSpacing'>, HTMLDivElement>(function(props, ref){
  // eslint-disable-next-line react-compiler/react-compiler
  //@ts-ignore
   return <Grid {...props} ref={ref} direction="row"/>
})


export const Col = React.forwardRef<Omit<GridProps, 'direction' | 'columnSpacing' | 'rowSpacing'>, HTMLDivElement>(function(props, ref){
  // eslint-disable-next-line react-compiler/react-compiler
  //@ts-ignore
   return <Grid {...props} ref={ref} direction="column"/>
})

export const Flex = Grid;

export default Grid;