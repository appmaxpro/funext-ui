import { ComponentType } from 'react'
import Badge, { BadgeProps } from '../../Badge'
import Content, { ContentProps } from './Content'
import Navigation, {
  NavigationProps,
  DefaultArrow as Arrow,
  ArrowProps,
} from './Navigation';
import IconButton, { IconButtonProps } from '../../IconButton';
import Close from '../../internal/svg-icons/Close';

export interface PopoverSlots {
  Badge: ComponentType<BadgeProps>;
  Close: ComponentType<IconButtonProps>;
  Content: ComponentType<ContentProps>;
  Navigation: ComponentType<NavigationProps>;
  Arrow: ComponentType<ArrowProps>;
}

export interface PopoverSlotProps {
  badge?: BadgeProps;
  close?: IconButtonProps;
  content?: ContentProps;
  navigation?: NavigationProps;
  arrow?: ArrowProps;
}

export type PopoverSlotsType = Partial<PopoverSlots>;

export const components = {
  Badge,
  Close: (props:IconButtonProps) => (<IconButton variant='filled' color='inherit' {...props} ><Close/></IconButton>),
  Content,
  Navigation,
  Arrow,
}

export type PopoverComponentGeneric = typeof components

export const defaultSlots = (
  comps?: PopoverSlotsType
): PopoverSlots =>
  ({
    ...components,
    ...comps,
  })