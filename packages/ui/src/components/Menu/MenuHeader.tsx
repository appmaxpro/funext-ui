import * as React from "react";
import ListSubheader, { type ListSubheaderProps } from "../List/ListSubheader";

import { styled } from "../../styles";

export const MenuHeader = React.forwardRef((props: ListSubheaderProps, ref) => (
  <ListSubheader
    {...props}
    sx={{
      lineHeight: "normal",
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '16px',
      paddingBottom: '4px'
    }}
    area-disabled="true"
    ref={ref as any}
  />
));

export default MenuHeader;

