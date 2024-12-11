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
} from "../../mui/styles";

import { MaterialIcon } from "../../icons/material-icon";
import { clsx } from "../clsx";
import { useCoreTheme } from "../styles";
import { getRGB } from "./utils";

import styles from "./nav-tabs.module.scss";
import { ButtonBase, IconButton, TouchRipple as Ripple, useRtl } from "../../mui";
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


    const scrollIn = useCallback(
      (element: HTMLElement) => {
        if (stripElement) {
          
          const scrollLeft = stripElement.scrollLeft;
          const scrollRight = scrollLeft + stripElement.clientWidth;
          const left = element.offsetLeft - margin;
          const right = element.offsetLeft + element.offsetWidth + margin;

          console.log("NavTabs:", {
            left,
            right,
            scrollLeft,
            scrollRight
          })
          const diff =
            right > scrollRight
              ? right - scrollRight
              : left < scrollLeft
                ? -(scrollLeft - left)
                : 0;
          
          console.log("NavTabs scroll:", diff)      
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
        console.log("setActive: id:", id, ", element:", element)
        if (element) {
          scrollIn(element);
        }
        if ((activeElement || element) && stripElement){
          setIndicatorBounds(element ?? undefined);
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
        //setActive(props.active ?? null, null);
      }
    }, [active, props.active, setActive]);

    return (
      <NavTabsContext.Provider value={{ active, activeElement, setActive }}>
        <NavTabsContainerRoot className={clsx(styles.container, className)} ref={ref}>
            <div
              className={clsx(styles.arrow, isRtl ? styles.right : styles.left, {
                [styles.active]: startArrow,
              })}
            >
              <Ripple overflow={false} centered={true} radius={20}>
                <MaterialIcon
                  className={clsx("flex items-center justify-center grow h-full", styles['arrow-icon'])}
                  icon={isRtl ? "keyboard_arrow_right" : "keyboard_arrow_left"}
                  size={24}
                  onClick={onScrollToEnd}
                />
              </Ripple>
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
              <Ripple overflow={false} centered={true} radius={20}>
                <MaterialIcon
                  className={clsx("flex items-center justify-center grow h-full", styles['arrow-icon'])}
                  icon={isRtl ? "keyboard_arrow_left" : "keyboard_arrow_right"}
                  size={24}
                  onClick={onScrollToStart}
                />
              </Ripple>
            </div>
        </NavTabsContainerRoot>
      </NavTabsContext.Provider>
    );
  },
);


const NavTabRoot = styled(ButtonBase, {
  name: 'MuxNavTab',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})({
  position: 'relative',
  overflow: 'hidden'
});

interface NavTabProps extends SxComponentProps<'div'>{
  item: NavTabItem;
  onItemClick?: (item: NavTabItem) => void;
}

function NavTab(props: NavTabProps) {
  const { item, onItemClick } = props;
  const { icon, title, render, onClick, onAuxClick, onContextMenu } = item;

  const { active, setActive } = useTabs();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isActive = active === item.id;
  
  const handleClick = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      setActive(item.id, elementRef.current);
      onItemClick?.(item);
      onClick?.(e);
    },
    [elementRef, item, onClick, onItemClick, setActive],
  );

  useEffect(() => {
    if (isActive) {
      setActive(item.id, elementRef.current, false);
    }
  }, [elementRef, isActive, item.id, setActive]);


  return (
    
    <NavTabRoot 
      className={clsx(styles.tab, isActive && styles.active)}
      area-active={isActive ? 'true' : undefined}
      data-tab-id={item.id}
      // @ts-ignore
      onClick={handleClick as any}
      //@ts-ignore
      onAuxClick={onAuxClick}
      //@ts-ignore
      onContextMenu={onContextMenu}
      component='div'
      rippleProps={{
        overflow: false,
        className: styles.ripple,
        centered: true
      }}
      ref={elementRef}
      >
      <NavTabInner item={item} active={isActive} />
    </NavTabRoot>
  );
}

function NavTabInner(props: { item: NavTabItem; active?: boolean }) {
  const { item, active } = props;
  const { icon, title, render: Title } = item;
  if (Title) {
    return (
      <Title item={item} active={active} className={styles.title}>
        {icon && <NavTabIcon item={item} />}
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
