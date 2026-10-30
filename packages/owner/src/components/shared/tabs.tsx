import React from "react";

import { Tabs as ScrollableTabs } from "react-tabs-scrollable";
import "react-tabs-scrollable/dist/rts.css";
// you must use this css file in order to apply the styles and put it in the bottom of your imports
import "./tabs.css";
import {
  IconButton,
  useRtl,
  SvgIcons,
  styled,
  ButtonBase,
  type SxComponentProps,
  type ButtonBaseProps,
} from "~/ui";

interface TabProps extends ButtonBaseProps {
  children: React.ReactNode;
}

type Mode =
  | "scrollSelectedToCenterFromView"
  | "scrollSelectedToCenter"
  | "scrollSelectedToEnd";
interface Props extends React.ComponentPropsWithRef<"div"> {
  animationDuration?: number;
  navBtnCLickAnimationDuration?: number;
  selectedAnimationDuration?: number;
  didReachEnd?: Function;
  didReachStart?: Function;
  hideNavBtnsOnMobile?: boolean;
  hideNavBtns?: boolean;
  tabsScrollAmount?: number;
  mode?: Mode;
  tabsContainerRef?: React.RefObject<HTMLDivElement> | any;
  tabRef?: React.RefObject<HTMLDivElement> | any;
  navBtnStyle?: object;
  tabsContainerStyle?: object;
  tabsUpperContainerStyle?: object;
  tabsUpperContainerClassName?: string;
  tabsContainerClassName?: string;
  showTabsScroll?: boolean;
  getTabsBoundingClientRects?: Function;
  action?: React.Ref<{
    onLeftNavBtnClick: () => void;
    onRightNavBtnClick: () => void;
    goToStart: () => void;
    goToEnd: () => void;
  }>;
  TabComponent?: React.ElementType | React.ComponentType | undefined;
  tabs: Array<TabProps>;
  activeTab: number;
  onTabClick: (e: React.BaseSyntheticEvent, id: number) => void;
}

export default function Tabs(props: Props) {
  const {
    activeTab,
    onTabClick: onTabClickProps,
    TabComponent = Tab,
    tabs,
    onTabClick,
    ...others
  } = props;

  //const [activeTab, setActiveTab] = React.useState(10);
  const rtl = useRtl();

  const LeftIcon = rtl ? SvgIcons.ChevronRight : SvgIcons.ChevronLeft;
  const RightIcon = rtl ? SvgIcons.ChevronLeft : SvgIcons.ChevronRight;
  // define a onClick function to bind the value on tab click
  /*
  const onTabClick = React.useCallback((e: React.BaseSyntheticEvent, index: number) => {
    onTabClickProps(tabs[index].id, e);
  }, EMPTY_ARRAY);*/

  return (
    <ScrollableTabs
      hideNavBtnsOnMobile={true}
      navBtnAs={IconButton}
      leftBtnIcon={<LeftIcon />}
      rightBtnIcon={<RightIcon />}
      isRTL={rtl}
      {...others}
      activeTab={activeTab}
      onTabClick={onTabClick}
    >
      {/* generating an array to loop through it  */}
      {tabs.map((tab, index) => (
        <TabComponent
          {...(tab as any)}
          key={tab.id}
          selected={index === activeTab}
        />
      ))}
    </ScrollableTabs>
  );
}

const TabRoot = styled(ButtonBase)();

interface BTabProps extends ButtonBaseProps {
  selected?: boolean;
  component?: SxComponentProps["as"];
}

const Tab = React.forwardRef(
  (
    { className = "", selected, component, children, ...props }: BTabProps,
    ref,
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
  },
);
