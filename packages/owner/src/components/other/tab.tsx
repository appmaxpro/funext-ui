import React from "react";
import "./styles.css";
import "react-tabs-scrollable/dist/rts.css";
// you must use this css file in order to apply the styles and put it in the bottom of your imports
//import "./mui-tabs.css";
import { styled, ButtonBase, type SxComponentProps, type ButtonBaseProps } from "@funext/ui";

const TabRoot = styled(ButtonBase)()

interface TabProps extends ButtonBaseProps{
  selected?: boolean;
  component?: SxComponentProps['as'];
}
const Tab = React.forwardRef(
  (
    { className = "", selected, component, children, ...props }: TabProps,
    ref
  ) => {

    const tabClassNames = `${className} ${
      selected ? "rts___tab___selected" : ""
    }`.trim();
    return (
      <TabRoot
        as={component}
        {...props}
        className={tabClassNames}
        ref={ref as React.RefObject<HTMLDivElement>}
        
      >
        {children}
      </TabRoot>
    );
  }
);
export default Tab;