import * as React from 'react';
import { SxProps } from '@mui/system';
import { Theme } from '../../styles';
import { BadgeClasses } from './badgeClasses';
import { CreateSlotsAndSlotProps, OverridableComponent, OverridableStringUnion, OverrideProps, SlotProps } from '../../theme/tw/props';

export interface BadgePropsVariantOverrides {}
export interface BadgePropsColorOverrides {}
export interface BadgeRootSlotPropsOverrides {}
export interface BadgeBadgeSlotPropsOverrides {}

export interface BadgeSlots {
  /**
   * The component that renders the root.
   * @default span
   */
  root: React.ElementType;
  /**
   * The component that renders the badge.
   * @default span
   */
  badge: React.ElementType;
}

export type BadgeSlotsAndSlotProps = CreateSlotsAndSlotProps<
  BadgeSlots,
  {
    /**
     * Props forwarded to the root slot.
     * By default, the avaible props are based on the span element.
     */
    root: SlotProps<'span', BadgeRootSlotPropsOverrides, BadgeOwnerState>;
    /**
     * Props forwarded to the label slot.
     * By default, the avaible props are based on the span element.
     */
    badge: SlotProps<'span', BadgeBadgeSlotPropsOverrides, BadgeOwnerState>;
  }
>;

export type BadgeOwnerState = Omit<BadgeOwnProps, 'slotProps' | 'slots'> & {
    content: React.ReactNode;
    invisible: boolean;
    max: number;
    displayValue: React.ReactNode;
    showZero: boolean;
    placement: BadgeOrigin;
    color: OverridableStringUnion<
      'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning',
      BadgePropsColorOverrides
    >;
    shape: 'square' | 'circle';
    variant: OverridableStringUnion<'standard' | 'dot', BadgePropsVariantOverrides>;
};

export interface BadgeOrigin {
  vertical?: 'top' | 'bottom';
  horizontal?: 'left' | 'right';
}

export interface BadgeOwnProps extends BadgeSlotsAndSlotProps {
  /**
   * The anchor of the badge.
   * @default {
   *   vertical: 'top',
   *   horizontal: 'right',
   * }
   */
  placement?: BadgeOrigin;
  /**
   * The content rendered within the badge.
   */
  content?: React.ReactNode;
  /**
   * The badge will be added relative to this node.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<BadgeClasses>;
  /**
   * @ignore
   */
  className?: string;
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'default'
   */
  color?: OverridableStringUnion<
    'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning',
    BadgePropsColorOverrides
  >;
  /**
   * The extra props for the slot components.
   * You can override the existing props or add new ones.
   *
   * @deprecated use the `slotProps` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  componentsProps?: BadgeOwnProps['slotProps'];
  /**
   * The components used for each slot inside.
   *
   * @deprecated use the `slots` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  components?: {
    Root?: React.ElementType;
    Badge?: React.ElementType;
  };
  /**
   * If `true`, the badge is invisible.
   * @default false
   */
  invisible?: boolean;
  /**
   * Max count to show.
   * @default 99
   */
  max?: number;
  /**
   * Wrapped shape the badge should shape.
   * @default 'square'
   */
  shape?: 'square' | 'circle';
  /**
   * Controls whether the badge is hidden when `content` is zero.
   * @default false
   */
  showZero?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;
  /**
   * The variant to use.
   * @default 'standard'
   */
  variant?: OverridableStringUnion<'standard' | 'dot', BadgePropsVariantOverrides>;
}

export interface BadgeTypeMap<
  RootComponent extends React.ElementType = 'span',
  AdditionalProps = {},
> {
  props: AdditionalProps & BadgeOwnProps;
  defaultComponent: RootComponent;
}

type BadgeRootProps = NonNullable<BadgeTypeMap['props']['slotProps']>['root'];
type BadgeBadgeProps = NonNullable<BadgeTypeMap['props']['slotProps']>['badge'];

export declare const BadgeRoot: React.FC<BadgeRootProps>;
export declare const BadgeMark: React.FC<BadgeBadgeProps>;


export type BadgeProps<
  RootComponent extends React.ElementType = BadgeTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<BadgeTypeMap<RootComponent, AdditionalProps>, RootComponent> & {
  component?: React.ElementType;
};
