import React from 'react'
import {styled, StyledComponent, Breakpoint, Theme} from '../../styles';
import Box from './Box';
import type{ BoxAdditionalProps, BoxProps } from './type';
import { BoxTypeMap } from '@mui/system';
import { OverrideProps } from '../../uprops';

type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | { [key in Breakpoint]?: T | null };

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

/*
export type FlexProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = BoxAdditionalProps,
> = Omit<OverrideProps<BoxTypeMap<AdditionalProps, RootComponent, Theme>, RootComponent>, 'display' | 'd'>;
*/

export interface FlexProps extends Omit<BoxProps, 'display' | 'd'> {
  d?: ResponsiveStyleValue<'none'>;
  display?: ResponsiveStyleValue<'none'>;
  direction?: ResponsiveStyleValue<FlexDirection>;
}

export interface InlineProps extends Omit<BoxProps, 'display' | 'd'> {
  d?: ResponsiveStyleValue<'none'>;
  display?: ResponsiveStyleValue<'none'>;
  direction?: ResponsiveStyleValue<FlexDirection>;
}


export const Flex = styled(Box, {
  name: "Flex",
})({
  display: 'flex'
}) ;

/*
export const Flex:React.ForwardRefExoticComponent<StyledComponent<FlexProps>> = React.forwardRef((props, ref) => 
  <Box data-ui="Flex" display='flex' {...props}  ref={ref}/>)
*/

export const InLine = styled(Box)({
  display: 'inline-flex'
}) as StyledComponent<InlineProps>;


export const Stack = styled(Box, {
  name: "Stack",
})({
  display: 'flex',
  flexDirection: 'column'
}) ;


export default Flex;  