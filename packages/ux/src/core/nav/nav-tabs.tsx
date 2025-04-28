'use client'
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  generateUtilityClass,
  composeClasses,
  styled,
  SxThemeProps,
  memoTheme,
  SxComponentProps,
} from "../../../../ui/src/mui/styles";

import { MaterialIcon } from "../../../../ui/src/icons/material-icon";
import { clsx } from "../clsx";
import { useCoreTheme } from "../styles";
import { getRGB } from "./utils";

import styles from "./nav-tabs.module.scss";
import { ButtonBase, IconButton, TouchRipple as Ripple, useRefs, useRtl } from "../../../../ui/src/mui";
export interface NavTabItem {
  /**
   * The item id should be unique among all the tab items.
   *
   */
  id: string;

  /**
   * The display title.
   *
   */
  title: React.ReactNode;

  /**
   * The icon to show.
   */
  icon?: React.FC<{ color?: string }>;

  /**
   * The renderer to customize tab rendering
   */
  render?: React.FC<{
    item: NavTabItem;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
  }>;

  /**
   * The color for the icon.
   *
   */
  iconColor?: string;

  /**
   * Associate any data
   *
   */
  data?: any;

  /**
   * The click handler.
   *
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  /**
   * The auxclick handler.
   */
  onAuxClick?: React.MouseEventHandler<HTMLDivElement>;

  /**
   * The context menu handler.
   *
   */
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;

  
}

export interface NavTabsProps {
  /**
   * List of tabs.
   *
   */
  items: NavTabItem[];

  /**
   * The id of the active tab.
   */
  active?: string;

  /**
   * The class name.
   */
  className?: string;

  /**
   * The click event handler.
   *
   */
  onItemClick?: (item: NavTabItem) => void;
}

type ContextValue = {
  active: string | null;
  activeElement: HTMLElement | null;
  setActive: (
    id: string | null,
    element: HTMLElement | null,
    persist?: boolean,
  ) => void;
};

const NavTabsContext = createContext<ContextValue>({
  active: null,
  activeElement: null,
  setActive: () => {},
});

const useTabs = () => {
  const { active, activeElement, setActive } = useContext(NavTabsContext);
  return {
    active,
    activeElement,
    setActive,
  };
};

const NavTabsContainerRoot = styled('div', {
  name: 'MuxNavTabsContainer',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
});

const NavTabsScrollRoot = styled('div', {
  name: 'MuNavTabsScroll',
  overridesResolver: (props, styles) => styles.root,
})({
  position: 'relative',
  display: 'flex',
  overflow: 'hidden',
  flexGrow: 1
});

const NavButton = styled(ButtonBase, {
  name: 'MuNavButton',
  overridesResolver: (props, styles) => styles.root,
})('');

const NavTabsRoot = styled('div', {
  name: 'MuxNavTabs',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  display: 'flex',
});

const margin = 50 - 12;

export const NavTabs = forwardRef<HTMLDivElement, NavTabsProps>(
  (props, ref) => {
    const { className, items, onItemClick } = props;

    const isRtl = useRtl();

    const [indicator, setIndicator] = useState<{ x: number; w: number }>({
      x: 0,
      w: 0,
    });

    const [stripElement, stripRef] = useState<HTMLDivElement | null>(null);
    const [startArrow, setStartArrow] = useState(false);
    const [endArrow, setEndArrow] = useState(false);

    const [active, setActiveTab] = useState<string | null>(() => {
      return props.active ?? items.find(Boolean)?.id ?? null;
    });

    const [activeElement, setActiveElement] = useState<HTMLElement | null>(
      null,
    );


    const setIndicatorBounds = (tabElement?:HTMLElement) => {
      tabElement ??= activeElement!;
      if (tabElement?.getAttribute('data-tab-id') !== active) {
        if(tabElement){
          setIndicator({ x: 0, w: 0 });
        }
      } else {
        const x = isRtl
        ? stripElement!.clientWidth -
          tabElement.offsetLeft -
          tabElement.offsetWidth
          : tabElement.offsetLeft;
        const w = tabElement.offsetWidth;
        if (w > 0) {
          setIndicator({ x, w });
        }
      }      
    }


    const scrollIn = useCallback(
      (element: HTMLElement) => {
        if (stripElement) {
          
          const scrollLeft = stripElement.scrollLeft;
          const scrollRight = scrollLeft + stripElement.clientWidth;
          const left = element.offsetLeft - margin;
          const right = element.offsetLeft + element.offsetWidth + margin;

          const diff =
            right > scrollRight
              ? right - scrollRight
              : left < scrollLeft
                ? -(scrollLeft - left)
                : 0;
          
          if (diff) {
            stripElement.scroll({
              left: scrollLeft + diff,
              behavior: "smooth",
            });
          }
        }
      },
      [stripElement],
    );

    const setActive = useCallback(
      (id: string | null, element: HTMLElement | null, persist = true) => {
        persist && setActiveTab(id);
        setActiveElement(element);
        if (element) {
          scrollIn(element);
        }
        
      },
      [scrollIn, setActiveElement, setActiveTab],
    );

    const handleItemClick = useCallback(
      (item: NavTabItem) => {
        onItemClick?.(item);
      },
      [onItemClick],
    );

    const activateScrollArrows = useCallback(() => {
      const elem = stripElement;
      if (elem) {
        const start = isRtl ? Math.abs(elem.scrollLeft) : elem.scrollLeft;
        const width = elem.clientWidth;
        const end = elem.scrollWidth - width - start;

        setStartArrow(start > 0);
        setEndArrow(end > 0);
      }
    }, [isRtl, stripElement]);

    const getScrollSize = useCallback(() => {
      if (stripElement && stripElement.firstChild) {
        const elems = Array.from(
          (stripElement.firstChild as HTMLElement).children,
        );
        const max = stripElement.clientWidth;
        let size = 0;
        for (let i = 0; i < elems.length; i++) {
          const elem = elems[i] as HTMLElement;
          const elemSize = elem.offsetWidth;
          size += elemSize;
          if (size > max) {
            break;
          }
        }
        return Math.max(max, size);
      }
      return 0;
    }, [stripElement]);

    const onScrollToStart = useCallback(() => {
      if (stripElement) {
        stripElement.scroll({
          left: isRtl
            ? stripElement.scrollLeft - getScrollSize()
            : stripElement.scrollLeft + getScrollSize(),
          behavior: "smooth",
        });
      }
    }, [getScrollSize, isRtl, stripElement]);

    const onScrollToEnd = useCallback(() => {
      if (stripElement) {
        stripElement.scroll({
          left: isRtl
            ? stripElement.scrollLeft + getScrollSize()
            : stripElement.scrollLeft - getScrollSize(),
          behavior: "smooth",
        });
      }
    }, [getScrollSize, isRtl, stripElement]);

    useLayoutEffect(() => {
      if (activeElement && stripElement) {
        const observer = new ResizeObserver(()=> {
          setIndicatorBounds();
          scrollIn(activeElement);
        });
        observer.observe(activeElement);
        setIndicatorBounds();
        return () => {
          observer.disconnect();
        };
      }
    }, [activeElement, isRtl, stripElement, items]);

    useLayoutEffect(() => {
      if (stripElement) {
        const observer = new ResizeObserver(() => {
          activateScrollArrows();
        });
        observer.observe(stripElement);
        return () => {
          observer.disconnect();
        };
      }
    }, [activateScrollArrows, stripElement, items]);

    useEffect(() => {
      if (props.active !== active && props.active != undefined) {
        setActive(props.active ?? null, null);
      }
    }, [items, active, props.active, setActive]);

    return (
      <NavTabsContext.Provider value={{ active, activeElement, setActive }}>
        <NavTabsContainerRoot className={clsx(styles.container, className)} ref={ref}>
            <div
              className={clsx(styles.arrow, isRtl ? styles.right : styles.left, {
                [styles.active]: startArrow,
              })}
            >
              <NavButton onClick={onScrollToEnd} ripple focusRipple  className={clsx(styles['arrow-icon'])}>
                <MaterialIcon
                  icon={isRtl ? "keyboard_arrow_right" : "keyboard_arrow_left"}
                  size={24}
                  
                />
              </NavButton>
            </div>
          <NavTabsScrollRoot
            ref={stripRef}
            onScroll={activateScrollArrows}
          >
            <NavTabsRoot>
              {items.map((item) => (
                <NavTab
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
              <div style={{width: 2 * margin}}/>
            </NavTabsRoot>
            <div
              className={styles.indicator}
              style={
                isRtl
                  ? {
                      right: indicator.x,
                      width: indicator.w,
                    }
                  : {
                      left: indicator.x,
                      width: indicator.w,
                    }
              }
            ></div>
          </NavTabsScrollRoot>
          
            <div
              className={clsx(styles.arrow, isRtl ? styles.left : styles.right, {
                [styles.active]: endArrow,
              })}
            >
              <NavButton onClick={onScrollToStart} ripple focusRipple className={clsx(styles['arrow-icon'])}>
                <MaterialIcon
                  icon={isRtl ? "keyboard_arrow_left" : "keyboard_arrow_right"}
                  size={24}
                />
              </NavButton>
            </div>
        </NavTabsContainerRoot>
      </NavTabsContext.Provider>
    );
  },
);

const tabClass = {
  root : 'MuxTab',
  selected: 'Mux-selected'
}

const NavTabRoot = styled(ButtonBase, {
  name: 'MuxNavTab',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: 'hidden',
  [`&.${tabClass.selected}`]: {
    //pointerEvents: "none", // Disable link interactions
    cursor: "default",
  }
});

interface NavTabProps extends SxComponentProps<'div'>{
  item: NavTabItem;
  onItemClick?: (item: NavTabItem) => void;
}

const NavTab = forwardRef<HTMLDivElement, NavTabProps>((props, ref) => {
  const { item, onItemClick } = props;
  const { onClick, onAuxClick, onContextMenu } = item;

  const { active, setActive } = useTabs();
  const [elRef, setElRef] = useState<HTMLDivElement|null>(null);
  const elementRef = useRefs(ref, setElRef);
  const isActive = active === item.id;
  
  const handleClick = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      setActive(item.id, elRef);
      onItemClick?.(item);
      onClick?.(e);
    },
    [elRef, item, onClick, onItemClick, setActive],
  );

  useEffect(() => {
    if (isActive) {
      setActive(item.id, elRef, false);
    }
  }, [elRef, isActive, item.id, setActive]);

  const ownerState = {
    selected: isActive
  }

  return (
    
    <NavTabRoot 
      className={clsx(styles.tab, isActive && tabClass.selected, isActive && styles.active)}
      area-active={isActive ? 'true' : undefined}
      data-tab-id={item.id}
      // @ts-ignore
      onClick={handleClick as any}
      ripple={!active}
      //@ts-ignore
      onAuxClick={onAuxClick}
      //@ts-ignore
      onContextMenu={onContextMenu}
      component='div'
      ref={elementRef}
      focusRipple
      focusVisibleClassName="outline-1"

      ownerState={ownerState}
      >
      <NavTabInner item={item} active={isActive} />
    </NavTabRoot>
  );
});


function NavTabInner(props: { item: NavTabItem; active?: boolean }) {
  const { item, active } = props;
  const { icon, title, render: Title } = item;
  if (Title) {
    const iconComp = icon ? <NavTabIcon item={item} /> : undefined;
    return (
      <Title item={item} active={active} className={styles.title} icon={iconComp}>
        {iconComp}
        {title && <div className={styles.text}>{title}</div>}
      </Title>
    );
  }
  return (
    <div className={styles.title}>
      {icon && <NavTabIcon item={item} />}
      {title && <div className={styles.text}>{title}</div>}
    </div>
  );
}

function NavTabIcon(props: NavTabProps) {
  const { item } = props;
  const { icon: Icon, iconColor } = item;
  const bg = useMemo(() => iconColor && getRGB(iconColor, 0.1), [iconColor]);
  const hoverBg = useMemo(
    () => iconColor && getRGB(iconColor, 0.2),
    [iconColor],
  );
  const activeBg = useMemo(
    () => iconColor && getRGB(iconColor, 0.2),
    [iconColor],
  );
  return (
    Icon && (
      <div
        className={styles.icon}
        style={
          {
            "--ax-nav-tabs-icon-bg": bg,
            "--ax-nav-tabs-icon-color": iconColor,
            "--ax-nav-tabs-icon-hover-bg": hoverBg,
            "--ax-nav-tabs-icon-hover-color": iconColor,
            "--ax-nav-tabs-icon-active-bg": activeBg,
            "--ax-nav-tabs-icon-active-color": iconColor,
          } as any
        }
      >
        <Icon color={iconColor} />
      </div>
    )
  );
}
