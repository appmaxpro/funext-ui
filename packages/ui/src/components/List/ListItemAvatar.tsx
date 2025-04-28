'use client';
import * as React from 'react';
import { 
  SxComponentProps, 
  styled, 
  useMuxDefaultProps
} from "../../styles";

import type{StyledComponent} from "../../styles";


export interface ListItemAvatarProps extends SxComponentProps<'div'> {
  /**
   * The content of the component, normally an `Avatar`.
   */
  children?: React.ReactNode;

  spaceTop?: boolean;
}

const ListItemAvatarRoot = styled('div', {
  name: 'MuxListItemAvatar',
  slot: 'Root',
})({
  minWidth: 56,
  flexShrink: 0,
  '&[data-space-top]':{
    marginTop: 8,
  },
  
  
}) as StyledComponent<ListItemAvatarProps>;

/**
 * A simple wrapper to apply `List` styles to an `Avatar`.
 */
export const ListItemAvatar = React.forwardRef<HTMLElement, ListItemAvatarProps>(function ListItemAvatar(inProps, ref) {
  const props = useMuxDefaultProps({
    props: inProps,
    name: 'MuiListItemAvatar',
  });

  const { spaceTop, ...other } = props;
  
  return (
    <ListItemAvatarRoot
      data-space-top={spaceTop ? '' : undefined}
      ref={ref as any}
      {...other}
    />
  );
});