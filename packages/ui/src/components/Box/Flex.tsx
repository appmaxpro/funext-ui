import React from 'react'
import {styled, StyledComponent, Breakpoint} from '../../styles';
import Box from './Box';
import type{ BoxProps } from './type';

type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | { [key in Breakpoint]?: T | null };

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

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


export const Flex = styled(Box)({
  display: 'flex'
}) as StyledComponent<FlexProps>;

export const InLine = styled(Box)({
  display: 'inline-flex'
}) as StyledComponent<InlineProps>;


export default Flex;  