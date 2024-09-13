'use client';
import * as React from 'react';
import {ListContext} from './ListContext';

import { 
  SxComponentProps, 
  styled, 
  useMuiDefaultProps ,
  clsx,
  composeClasses,
  generateUtilityClasses ,
  generateUtilityClass 
} from "../../styles";

import type{StyledComponent} from "../../styles";

const useUtilityClasses = (ownerState:any) => {
  const { alignItems, classes } = ownerState;

  const slots = {
    root: ['root', alignItems === 'flex-start' && 'alignItemsFlexStart'],
  };

  return composeClasses(slots, getListItemAvatarUtilityClass, classes);
};

export interface ListItemAvatarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element when the parent `ListItem` uses `alignItems="flex-start"`. */
  alignItemsFlexStart: string;
}

export type ListItemAvatarClassKey = keyof ListItemAvatarClasses;

export function getListItemAvatarUtilityClass(slot: string): string {
  return generateUtilityClass('MuxListItemAvatar', slot);
}

const listItemAvatarClasses: ListItemAvatarClasses = generateUtilityClasses('MuxListItemAvatar', [
  'root',
  'alignItemsFlexStart',
]);

interface ListItemAvatarRootProps extends SxComponentProps<'div'>{
  ownerState: any;
}

export interface ListItemAvatarProps extends SxComponentProps<'div'> {
  /**
   * The content of the component, normally an `Avatar`.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ListItemAvatarClasses>;
}

const ListItemAvatarRoot = styled('div', {
  name: 'MuxListItemAvatar',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, ownerState.alignItems === 'flex-start' && styles.alignItemsFlexStart];
  },
})({
  minWidth: 56,
  flexShrink: 0,
  variants: [
    {
      props: {
        alignItems: 'flex-start',
      },
      style: {
        marginTop: 8,
      },
    },
  ],
}) as StyledComponent<ListItemAvatarRootProps>;

/**
 * A simple wrapper to apply `List` styles to an `Avatar`.
 */
export const ListItemAvatar = React.forwardRef<HTMLElement, ListItemAvatarProps>(function ListItemAvatar(inProps, ref) {
  const props = useMuiDefaultProps({
    props: inProps,
    name: 'MuiListItemAvatar',
  });

  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const ownerState = { ...props, alignItems: (context as any).alignItems };
  const classes = useUtilityClasses(ownerState);

  return (
    <ListItemAvatarRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref as any}
      {...other}
    />
  );
});