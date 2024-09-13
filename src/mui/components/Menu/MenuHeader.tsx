
import * as React  from "react";
import ListSubheader, {type ListSubheaderProps} from "../List/ListSubheader";

export const MenuHeader = React.forwardRef((props:ListSubheaderProps, ref)=>
   <ListSubheader {...props} area-disabled="true" ref={ref}/>);

export default MenuHeader;