import { ComponentType } from 'react'
import Badge, { BadgeProps } from '../../Badge'
import Content, { ContentProps } from './Content'
import Navigation, {
  NavigationProps,
  DefaultArrow as Arrow,
  ArrowProps,
} from './Navigation';
import IconButton, { IconButtonProps } from '../../IconButton';
import { MaterialIcon } from '../../../../icons/material-icon';

export interface PopoverComponents {
  Badge: ComponentType<BadgeProps>
  Close: ComponentType<IconButtonProps>
  Content: ComponentType<ContentProps>
  Navigation: ComponentType<NavigationProps>
  Arrow: ComponentType<ArrowProps>
}

export type PopoverComponentsType = Partial<PopoverComponents>

export const components = {
  Badge,
  Close: (props:IconButtonProps) => (<IconButton {...props}><MaterialIcon icon='close'/></IconButton>),
  Content,
  Navigation,
  Arrow,
}

export type PopoverComponentGeneric = typeof components

export const defaultComponents = (
  comps: PopoverComponentsType
): PopoverComponentGeneric =>
  ({
    ...components,
    ...comps,
  }) as PopoverComponentGeneric