import React from "react";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { useTabs, setIndicator } from "./TabsContext";

// types
import type { indicatorProps, className, children } from "../../types/components/tabs";

export interface TabsHeaderProps extends React.ComponentProps<"ul"> {
  indicatorProps?: indicatorProps;
  className?: className;
  children: children;
}

export const TabsHeader = React.forwardRef<HTMLUListElement, TabsHeaderProps>(
  ({ indicatorProps, className, children, ...rest }, ref) => {
    // 1. init
    const { tabsHeader } = useTailwindTheme();
    const { defaultProps, styles } = tabsHeader;
    const { state, dispatch } = useTabs();
    const { orientation } = state;

    React.useEffect(() => {
      setIndicator(dispatch as any, indicatorProps as any);
    }, [dispatch, indicatorProps]);

    // 2. set default props
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const tabsHeaderClasses = twMerge(
      classnames(objectsToString(styles.base), {
        [styles[orientation] && objectsToString(styles[orientation])]: orientation,
      }),
      className,
    );

    // 4. return
    return (
      <nav>
        <ul {...rest} ref={ref} role="tablist" className={tabsHeaderClasses}>
          {children}
        </ul>
      </nav>
    );
  },
);


TabsHeader.displayName = "Mux.TabsHeader";

export default TabsHeader;
