import { forwardRef, useCallback, useMemo, useState } from "react";

import { clsx } from "../clsx";
import { useRefs } from "../hooks";
import { Menu, MenuItem, MenuProps, MenuList, MenuHandler } from "../../mui";
import {
  Overflow,
  OverflowItem,
  OverflowItemProps,
  OverflowProps,
  useIsOverflowItemVisible,
  useOverflowMenu,
} from "../overflow";

import styles from "./overflow-list.module.scss";

export interface OverflowListItem
  extends Pick<OverflowItemProps, "id" | "groupId" | "priority"> {}

export interface OverflowListItemProps<T extends OverflowListItem> {
  item: T;
  active?: boolean;
}

export interface OverflowMenuTriggerProps {
  count: number;
  open: boolean;
}

export interface OverflowListProps<T extends OverflowListItem> {
  items: T[];

  renderItem: (props: OverflowListItemProps<T>) => JSX.Element | null;
  renderMenuTrigger: (props: OverflowMenuTriggerProps) => JSX.Element | null;
  renderMenuItem: (props: OverflowListItemProps<T>) => JSX.Element | null;

  onItemClick?: (item: T) => void;
  isItemActive?: (item: T) => boolean;

  overflowProps?: Pick<OverflowProps, "overflowAxis" | "overflowDirection">;
  menuProps?: Omit<MenuProps, "children">;

  className?: string;
  style?: React.CSSProperties;
}

export const OverflowList = forwardRef<HTMLDivElement, OverflowListProps<any>>(
  (props, ref) => {
    const { style, className, items, overflowProps } = props;
    return (
      <Overflow key={items.length} {...overflowProps} ref={ref}>
        <div
          className={clsx(styles.list, className, {
            [styles.vertical]: overflowProps?.overflowAxis === "vertical",
          })}
          style={style}
        >
          {items.map((item) => (
            <OverflowItem
              key={item.id}
              id={item.id}
              groupId={item.groupId}
              priority={item.priority}
            >
              <ListItem key={item.id} {...props} item={item} />
            </OverflowItem>
          ))}
          <ListMenu {...props} />
        </div>
      </Overflow>
    );
  },
) as unknown as <T extends OverflowListItem>(
  props: OverflowListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;

const ListItem = forwardRef<
  HTMLDivElement,
  OverflowListItemProps<any> & OverflowListProps<any>
>((props, ref) => {
  const { item, onItemClick, isItemActive, renderItem: Comp } = props;

  const handleClick = useCallback(
    () => onItemClick?.(item),
    [item, onItemClick],
  );

  const renderProps = useMemo(
    () => ({ item, active: isItemActive?.(item) }),
    [isItemActive, item],
  );

  return (
    <div className={styles.item} ref={ref} onClick={handleClick}>
      <Comp {...renderProps} />
    </div>
  );
});

const ListMenuItem = forwardRef( 
  (props: OverflowListItemProps<any> & OverflowListProps<any>, ref) => {
  const { item, isItemActive, renderMenuItem: Comp, onItemClick } = props;
  const { id } = item;
  const visible = useIsOverflowItemVisible(id);
  const active = isItemActive?.(item);

  const renderProps = useMemo(() => ({ item, active }), [item, active]);

  const handleClick = useCallback(
    () => onItemClick?.(item),
    [item, onItemClick],
  );

  if (visible) {
    return null;
  }

  return (
    <MenuItem active={active} onClick={handleClick} ref={ref}>
      <Comp {...renderProps} />
    </MenuItem>
  );
});

const ListMenu = (props: OverflowListProps<any>) => {
  const {
    ref,
    overflowCount: count,
    isOverflowing,
  } = useOverflowMenu<HTMLDivElement>();

  const {
    items,
    renderMenuTrigger: TriggerComp,
    onItemClick,
    menuProps,
  } = props;
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  const triggerRef = useRefs(ref, setTarget);

  const showMenu = useCallback(() => setShow(true), []);
  const hideMenu = useCallback(() => setShow(false), []);

  const handleItemClick = useCallback(
    (item: OverflowListItem) => {
      hideMenu();
      onItemClick?.(item);
    },
    [hideMenu, onItemClick],
  );

  if (!isOverflowing) {
    return null;
  }

  return (
    <Menu
        {...menuProps}
        open={show}
        handler={setShow}
      >
      <MenuHandler ref={triggerRef as any} onClick={showMenu}>
        <div  className={styles.button} >
          <TriggerComp count={count} open={show} />
        </div>
      </MenuHandler>
      <MenuList>
        {items.map((item) => (
          <ListMenuItem
            key={item.id}
            {...props}
            item={item}
            onItemClick={handleItemClick}
          />
        ))}
      </MenuList>
    </Menu>
  );
};
