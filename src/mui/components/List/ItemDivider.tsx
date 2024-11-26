import * as React  from "react";

import Divider, {type DividerProps} from "../Divider";


export const ItemDivider = React.forwardRef(
    (props:DividerProps, ref)=> 
      <Divider {...props} area-disabled="true" ref={ref as any}/>);

export type {
  DividerProps as ItemDividerProps
}  
export default ItemDivider;