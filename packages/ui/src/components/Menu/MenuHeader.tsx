import * as React from "react";
import ListSubheader, { type ListSubheaderProps } from "../List/ListSubheader";

import { styled } from "../../styles";

const ListSubheaderRoot = styled(ListSubheader)({
  lineHeight: "normal",
  paddingLeft: '10px',
  paddingRight: '10px',
  paddingTop: '16px',
  paddingBottom: '4px'
})


export const MenuHeader = React.forwardRef((props: ListSubheaderProps, ref) => (
  <ListSubheaderRoot
    area-disabled="true"
    {...props}    
    ref={ref as any}
  />
));

export default MenuHeader;

