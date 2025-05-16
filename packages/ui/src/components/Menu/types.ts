
// generic types
import type { 
  DismissProps, 
  ArrowProps, 
  AnimationProps, 
  OffsetProps,
  Placement ,
  Strategy
} from "../../types/generic";

/**, 
 * This file contains the types and prop-types for Menu and Menu, MenuCore, MenuHandler, MenuList, MenuItem and MenuContext components.
 */

// typescript types
export type Handler<T=any> = React.Dispatch<React.SetStateAction<T>>;
export type SetRef<T=Element> = (userProps?: React.HTMLProps<T>) => T ;

export interface MenuDismissProps extends DismissProps {
  itemPress?: boolean;
}

export type { 
  ArrowProps, 
  AnimationProps, 
  OffsetProps,
  Placement ,
  Strategy
}