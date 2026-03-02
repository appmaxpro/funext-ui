import React from "react";

import { Tabs as ScrollableTabs } from "react-tabs-scrollable";
import "react-tabs-scrollable/dist/rts.css";
// you must use this css file in order to apply the styles and put it in the bottom of your imports
import "./styles.css";
import { IconButton, useRtl, Icons, type ButtonBaseProps } from "@funext/ui";
import Tab from "./tab";


export interface TabProps extends ButtonBaseProps {
  id: string;
  children: React.ReactNode;
}

type Mode =
  | "scrollSelectedToCenterFromView"
  | "scrollSelectedToCenter"
  | "scrollSelectedToEnd";
interface Props extends React.ComponentPropsWithRef<'div'>{
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
  activeTab: string;
  onTabClick: (id: string, e: React.BaseSyntheticEvent) => void;
}

export default function Tabs(props: Props) {
  const {
    activeTab,
    onTabClick: onTabClickProps,
    TabComponent = Tab,
    tabs,
    ...others
  } = props;

  //const [activeTab, setActiveTab] = React.useState(10);
  const rtl = useRtl();
  
  const LeftIcon = rtl ? Icons.ChevronRight : Icons.ChevronLeft;
  const RightIcon = rtl ? Icons.ChevronLeft : Icons.ChevronRight;
  // define a onClick function to bind the value on tab click
  const onTabClick = (e: React.BaseSyntheticEvent, index: number) => {
    onTabClickProps(tabs[index].id, e);
  };
  
  return (
    <ScrollableTabs
      hideNavBtnsOnMobile={false}
      navBtnAs={IconButton}
      leftBtnIcon={<LeftIcon />}
      rightBtnIcon={<RightIcon />}
      isRTL={rtl}
      {...others}
      activeTab={React.useMemo(
        () => tabs.findIndex((tab) => tab.id === activeTab),
        [activeTab],
      )}
      onTabClick={onTabClick}
    >
      {/* generating an array to loop through it  */}
      {tabs.map((tab) => (
        <TabComponent key={tab.id} selected={tab.id === activeTab} {...(tab as any)} />
      ))}
    </ScrollableTabs>
  );
}
