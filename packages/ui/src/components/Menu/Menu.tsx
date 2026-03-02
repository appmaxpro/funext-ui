"use client";
import React, { KeyboardEvent, ReactElement } from "react";

// @floating-ui
import {
  useFloatingTree,
  useFloatingNodeId,
  useFloatingParentNodeId,
  FloatingNode,
  useInteractions,
  useHover,
  useClick,
  useRole,
  safePolygon,
  useListNavigation,
  useTypeahead,
  useMergeRefs,
  FloatingTree,
  FloatingTreeType,
} from "@floating-ui/react";

import { isMenuItemValid, setValidItemTypes } from "./utils";

// types
import {
  clsx,
  styled,
  StyledComponent,
  SxComponentProps,
  useRtl,
  useTailwindTheme,
  useTheme,
} from "../../styles";
import Panel from "../Panel";
import List, { ItemDivider, ListItemSuffix, ListProps } from "../List";

import { noop } from "../../utils";

import { ChevronLeft, ChevronRight } from "../internal/svg-icons/chevron";
import { composeEventHandlers } from "../../hooks/compose-event-handlers";
import Popper, { ComponentRootProps, PopperProps } from "../Popper";
import MenuItem from "./MenuItem";
import MenuHeader from "./MenuHeader";
import { usePopper } from "../Popper/PopperContext";
import { getAnimationOrName, shouldForwardProp } from "../internal/animation";
import { isElementDisabled, isElementHidden } from "../List/utils";

const dismissBubbles = {
  bubbles: true,
};

const PanelRoot = styled(Panel, {
  name: "MuxMenu",
  slot: "panel",
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp,
})(
  ({ theme }) => ({
    ...theme.typography.body1,
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
    willChange: "transform, opacity",
    borderRadius: 12,
    maxWidth: "var(--popper-available-width)",
    maxHeight: "var(--popper-available-height)",
    borderWidth: 1,
  }),
  getAnimationOrName("fadeScale"),
) as StyledComponent<any>;

const ListRoot = styled(List, {
  name: "MuxMenu",
  slot: "list",
  overridesResolver: (props, styles) => styles.root,
})({
  overflow: "auto",
  outline: 0,
  borderRadius: "inherit",
  "&:focus-visible": {
    outline: 0,
  },
});

type TriggerProps = Omit<SxComponentProps<"button">, "children"> & {
  children: React.ReactElement | null;
};

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children: trigger, ...props }, forwardRef) => {
    const { context, getReferenceProps } = usePopper();
    const rtl = useRtl();
    const nested = useFloatingParentNodeId() != null;

    const nodeRef = React.useRef(null);

    const mergedRef = useMergeRefs([
      context.refs.setReference,
      forwardRef,
      nodeRef,
    ]);

    //console.log("Trigger Ref:", nodeRef)

    const onKeyDown = (event: KeyboardEvent) => {
      //children.props.onKeyDown?.(event);
      //rest.onKeyDown?.(event as any);

      if (nodeRef.current) {
        if (
          isElementHidden(nodeRef.current) ||
          isElementDisabled(nodeRef.current)
        ) {
          return;
        }

        // Wait until IME is settled.
        if (event.which !== 229) {
          const key = event.key;
          const isArrowKey = event.key.startsWith("Arrow");
          if (!isArrowKey) return;

          //const leftKey = rtl ? "ArrowRight" : "ArrowLeft";
          //const rightKey = rtl ? "ArrowLeft" : "ArrowRight";

          switch (key) {
            case "ArrowRight":
              if (!rtl && nested && !context.open) {
                context.onOpenChange(true, event as any, "list-navigation");
              }
              break;

            case "ArrowLeft":
              if (rtl && nested && !context.open) {
                context.onOpenChange(true, event as any, "list-navigation");
              }
              break;

            case "ArrowDown":
              if (!nested && !context.open) {
                context.onOpenChange(true, event as any, "list-navigation");
              }
              break;
          }
        }
      }
    };

    if (!trigger || !trigger.props) {
      return trigger;
    }

    const mergedProps = { ...trigger!.props, ...props };

    const ChevronIcon = rtl ? ChevronLeft : ChevronRight;

    const endIcon =
      mergedProps.endIcon ??
      (nested && (
        <ListItemSuffix aria-hidden>
          <ChevronIcon
            size={18}
            className={`transition-transform ${context.open ? (rtl ? "-rotate-90" : "rotate-90") : ""}`}
          />
        </ListItemSuffix>
      ));
    return React.cloneElement(
      trigger as ReactElement,
      getReferenceProps({
        ...mergedProps,
        endIcon,
        "data-open": context.open ? "open" : undefined,
        role: nested ? "menuitem" : mergedProps.role,
        onClick(event: any) {
          event.stopPropagation();
          //children.props.onClick?.(event);
        },
        onKeyDown: nested
          ? composeEventHandlers(onKeyDown, fn(mergedProps.onKeyDown))
          : mergedProps.onKeyDown,
        /*
      onFocus: composeEventHandlers(
        fn(mergedProps.onFocus),
        fn(children.props.onFocus),
      ),
      onBlur: composeEventHandlers(
        fn(mergedProps.onBlur),
        fn(children.props.onBlur),
      ),*/
        ref: mergedRef,
      }),
    );
  },
);

type UseTriggerProps = TriggerProps & {
  forwardRef?: React.ForwardedRef<HTMLButtonElement>;
};

function fn<EventType extends React.SyntheticEvent | Event>(
  fn?: ((event: EventType) => any) | undefined,
) {
  return typeof fn === "function" ? fn : noop;
}

type SubMenuProps = Omit<SxComponentProps<"button">, "children"> & {
  children: React.ReactNode;
};

export const SubMenu = React.forwardRef<HTMLButtonElement, SubMenuProps>(
  ({ children, ...props }, forwardRef) => {
    let menuChildren = React.Children.toArray(children);
    let item = menuChildren.shift();
    //const ref = React.useRef<HTMLButtonElement | null>(null);
    //useImperativeHandle(forwardRef, () => ref.current!);

    return React.isValidElement(menuChildren[0])
      ? React.cloneElement(menuChildren[0] as React.ReactElement, {
          trigger: (
            <Trigger {...props} ref={forwardRef}>
              {React.cloneElement(item as React.ReactElement)}
            </Trigger>
          ),
        })
      : item;
  },
);

interface MenuProps<T = HTMLElement | null>
  extends Omit<
    PopperProps,
    | "children"
    | "Content"
    | "RootComponent"
    | "hoverProps"
    | "clickProps"
    | "elementProps"
  > {
  children: React.ReactNode;
  trigger?: React.ReactNode | false;
  listProps?: Omit<ListProps, "children">;
  closeOnItemClick?: boolean;
}

const Menu = React.forwardRef<
  HTMLDivElement,
  MenuProps & { $internal?: boolean }
>((inProps, ref) => {
  const { $internal, ...props } = inProps;
  // 1. init
  const parentId = useFloatingParentNodeId();
  const nested = parentId != null;

  // 2. return
  if (parentId == null && !$internal) {
    return (
      <FloatingTree>
        <Menu {...props} $internal={true} ref={ref} />
      </FloatingTree>
    );
  }

  let { children, trigger: menuTrigger, ...rest } = props;

  if (!rest.reference && menuTrigger !== false) {
    let menuChildren = React.Children.toArray(children);
    let childTrigger = menuTrigger ?? menuChildren.shift();
    let nestedTrigger = false;
    let trigger = childTrigger;

    //console.log("Menu typeof trigger:", trigger);
    //console.log("Menu typeof trigger class:", (trigger as any)?.type);

    if (!Popper.hasTrigger((trigger as any)?.type)) {
      nestedTrigger = true;
      trigger = (
        <Trigger ref={ref as any}>{childTrigger as React.ReactElement}</Trigger>
      );
    }
    return (
      <MenuInner {...rest} trigger={trigger}>
        {menuChildren}
      </MenuInner>
    );
  }

  return <MenuInner {...props}>{children}</MenuInner>;
});

const defaultPopperProps = {
  dismiss: dismissBubbles,
  preventOverflow: true,
  animate: true,
  navigate: true,
} as Partial<MenuProps["popperProps"]>;

const MenuInner: React.FC<Partial<MenuProps>> = ({
  closeOnItemClick = true,
  navigate = true,
  trigger,
  children,
  listProps,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  placement: placementProp,
  dismiss: dismissProp,
  ...rest
}) => {
  // 1. init

  const { menu } = useTailwindTheme();
  const [internalOpen, setInternalOpen] = React.useState(false);

  // 2. set default props
  const open = openProp ?? internalOpen;
  const onOpenChange = onOpenChangeProp ?? setInternalOpen;

  // 4. set @floating-ui
  const [allowHover, setAllowHover] = React.useState(true);
  //const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const rtl = useRtl();
  const nested = parentId != null;

  //console.log("MenuInner: allowHover:", allowHover);

  const placement =
    placementProp ?? (nested ? (rtl ? "left-start" : "right-start") : "bottom");

  const dismiss =
    !dismissProp && closeOnItemClick ? dismissBubbles : dismissProp;
  const elementProps = (context: any) => [
    useHover(context, {
      enabled: nested && allowHover,
      delay: { open: 75 },
      handleClose: safePolygon({
        blockPointerEvents: true,
      }),
    }),
    useClick(context, {
      toggle: !nested || allowHover,
      event: !nested ? "click" : "mousedown",
      ignoreMouse: nested,
    }),
    useRole(context, { role: "menu" }),
  ];

  const contextProps = React.useMemo(
    () => ({
      allowHover,
      setAllowHover,
      closeOnItemClick,
    }),
    [allowHover, setAllowHover, closeOnItemClick],
  );
  /*
  console.log(
    "Menu floating:",
    refs.floating,
    ", isPositioned:",
    context.isPositioned,
  );
  */
  // 5. return

  return (
    <Popper
      {...rest}
      navigate={navigate}
      placement={placement}
      contextProps={contextProps}
      dismiss={dismiss}
      elementProps={elementProps}
      nodeId={nodeId}
      onOpenChange={onOpenChange}
      open={open}
      RootComponent={MenuFloatingNode as any}
      menuNodeId={nodeId}
      allowHover={allowHover}
      setAllowHover={setAllowHover}
      closeOnItemClick={closeOnItemClick}
      listProps={listProps}
      trigger={trigger}
      type="menu"
    >
      {children}
    </Popper>
  );
};

interface MenuListProps extends ListProps<"div">, ComponentRootProps {
  children: React.ReactNode;
  closeOnItemClick?: boolean;
  allowHover: boolean;
  setAllowHover: (a: boolean) => void;
}

const MenuList = React.forwardRef<HTMLDivElement, MenuListProps>(
  (props, forwardRef) => {
    const {
      children,
      className,
      navigate,
      closeOnItemClick,
      allowHover,
      setAllowHover,
      animate,
      contentProps,
      listProps,
      context,
      getFloatingProps: floatingPropsFn,
      ...rest
    } = props;

    const tree = useFloatingTree();
    const parentId = useFloatingParentNodeId();
    const rtl = useRtl();
    const { getItemProps: temPropsFn } = usePopper();

    const nested = parentId != null;

    const { open, nodeId } = context;

    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const listItemsRef = React.useRef<
      Array<HTMLButtonElement | HTMLElement | null>
    >([]);

    const listContentRef = React.useRef(
      React.Children.map(children, (child) =>
        React.isValidElement(child) ? child.props.label : null,
      ) as Array<string | null>,
    );

    const { getFloatingProps, getItemProps } = useInteractions([
      //useRole(context, { role: "menu" }),
      navigate
        ? useListNavigation(context, {
            listRef: listItemsRef,
            activeIndex,
            nested,
            onNavigate: setActiveIndex,
            rtl,
            loop: true,
          })
        : undefined,
      navigate
        ? useTypeahead(context, {
            listRef: listContentRef,
            onMatch: setActiveIndex,
            activeIndex,
          })
        : undefined,
      {
        floating: floatingPropsFn?.({} as React.HTMLProps<HTMLElement>),
        item: temPropsFn?.({} as React.HTMLProps<HTMLElement>),
      },
    ]);

    React.useEffect(() => {
      function handleTreeClick(event: Event) {
        if (closeOnItemClick) context.onOpenChange(false, event);
      }

      function onSubMenuOpen(
        event: { nodeId: string; parentId: string } & Event,
      ) {
        if (event.nodeId !== nodeId && event.parentId === parentId) {
          context.onOpenChange(false, event);
        }
      }

      tree?.events.on("click", handleTreeClick);
      tree?.events.on("menuopen", onSubMenuOpen);

      return () => {
        tree?.events.off("click", handleTreeClick);
        tree?.events.off("menuopen", onSubMenuOpen);
      };
    }, [tree, nodeId, parentId]);

    React.useEffect(() => {
      tree?.events.emit("menuopen", {
        parentId,
        nodeId,
      });
    }, [tree, open, nodeId, parentId]);

    // Determine if "hover" logic can run based on the modality of input. This
    // prevents unwanted focus synchronization as menus open and close with
    // keyboard navigation and the cursor is resting on the menu.
    React.useEffect(() => {
      function onPointerMove({ pointerType }: PointerEvent) {
        if (pointerType !== "touch") {
          setAllowHover(true);
        }
      }

      function onKeyDown() {
        setAllowHover(false);
      }

      window.addEventListener("pointermove", onPointerMove, {
        once: true,
        capture: true,
      });

      window.addEventListener("keydown", onKeyDown, true);
      setAllowHover(false);
      return () => {
        window.removeEventListener("pointermove", onPointerMove, {
          capture: true,
        });

        window.removeEventListener("keydown", onKeyDown, true);

        setAllowHover(true);
      };
    }, [setAllowHover]);

    const items = !navigate
      ? children
      : React.Children.map(
          children,
          (child: any, index) =>
            React.isValidElement(child) &&
            (!isMenuItemValid(child)
              ? React.cloneElement(child, {
                  "aria-disabled": "true",
                  className: clsx(
                    (child.props as any).className,
                    "item-disabled",
                  ),
                  ref(node: HTMLElement) {
                    listItemsRef.current[index] = null;
                  },
                } as any)
              : React.cloneElement(child, {
                  //@ts-ignore
                  "data-item": "",
                  //@ts-ignore
                  "area-active": activeIndex === index ? "true" : undefined,
                  ...getItemProps({
                    tabIndex: activeIndex === index ? 0 : -1,
                    role: "menuitem",
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                      //console.log("MenuItemRef: ", node, ", index:", index)
                    },
                    onClick(event) {
                      (child.props as any).onClick?.(event);
                      tree?.events.emit("click");
                    },
                    onMouseEnter() {
                      if (allowHover) {
                        setActiveIndex(index);
                      }
                    },
                    onFocus(event) {
                      (child.props as any).onFocus?.(event);
                      //setHasFocusInside(true);
                    },
                  }),
                })),
        );

    return (
      <Popper.ComponentRoot
        navigate={navigate}
        animate={animate}
        context={context}
        getFloatingProps={getFloatingProps}
        Content={PanelRoot}
        contentProps={{ fill: true, ...contentProps }}
        ref={forwardRef}
        {...rest}
      >
        <ListRoot
          className={className}
          role="menu"
          data-ui="NewMenuList"
          tabIndex={-1}
          {...listProps}
        >
          {items}
        </ListRoot>
      </Popper.ComponentRoot>
    );
  },
);

function MenuFloatingNode({
  menuNodeId,
  ...props
}: MenuListProps & { menuNodeId: string }) {
  return (
    <FloatingNode id={menuNodeId}>
      <MenuList {...props} />
    </FloatingNode>
  );
}

//const isArrowKey = event.key.startsWith('Arrow');
setValidItemTypes(Menu);
setValidItemTypes(SubMenu);
setValidItemTypes(Trigger);

Popper.setRawTrigger(Menu);
Popper.setRawTrigger(SubMenu);
Popper.setRawTrigger(Trigger);
Popper.setRawTrigger(MenuItem);

type MenuType = React.FC<MenuProps> & {
  DropDown: typeof SubMenu;
  Trigger: typeof SubMenu;
  Item: typeof MenuItem;
  Divider: typeof ItemDivider;
  Header: typeof MenuHeader;
};

const Root: MenuType = Object.assign(Menu, {
  DropDown: SubMenu,
  Trigger: Trigger,
  Item: MenuItem,
  Divider: ItemDivider,
  Header: MenuHeader,
}) as MenuType;

Menu.displayName = "Mux.Menu";
SubMenu.displayName = "Mux.MenuDropDown";
Trigger.displayName = "Mux.MenuTrigger";
MenuList.displayName = "Mux.MenuList";

export type { MenuProps, TriggerProps, SubMenuProps };
export { Root as Menu };
export default Root;
