'use client'
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import  React from "react";
import { MaterialIcon } from "../../../../ui/src/icons/material-icon";
import { ClickAwayListener } from "../click-away-listener";
import { clsx } from "../clsx";
import { Collapse } from "../collapse";
import { Fade } from "../fade";
import { Scrollable } from "../../../../ui/src/mui/lib/scrollable";
import { getRGB } from "./utils";
import styles from "./nav-menu.module.scss";
import {
  Popover,
  List,
  Tooltip,
  ListProps,
  Popper as MuxPopper,
  Button,
  Card,
  Input,
  AutoSelect,
  ListItemButton,
  ListItemButtonProps,
  Portal,
  useTheme,
} from "../../../../ui/src";
import { twJoin } from "tailwind-merge";
import { useOpenCmdk } from "../../../../ui/src/mui/components/Cmdkx/hooks";
import { positions, useMediaQuery } from "@mui/system";

export interface NavMenuItem {
  /**
   * The item id should be unique among all the menu items.
   *
   */
  id: string;

  /**
   * The display title.
   *
   */
  title: string;

  /**
   * The help text to describe the menu item.
   *
   */
  help?: string;

  /**
   * The icon to show.
   */
  icon?: (props: { color?: string }) => JSX.Element | null;

  /**
   * The color for the icon.
   *
   */
  iconColor?: string;

  /**
   * The tag to show.
   *
   */
  tag?: (props: { color?: string }) => JSX.Element | null;

  /**
   * The color for the tag.
   *
   */
  tagColor?: string;

  /**
   * The sub menu items.
   *
   */
  items?: NavMenuItem[];

  /**
   * The click handler.
   *
   */
  onClick?: () => void;
}

export interface NavMenuProps {
  /**
   * The display mode.
   *
   * - `accordion` - show menus as accordion
   * - `icons` - show icons only
   *
   * The display of the menu further depends on the `show` property.
   *
   */
  mode: "accordion" | "icons";

  /**
   * The visibility mode.
   *
   * - `inline` - show the menu inline
   * - `overlay` - show the menu as overlay
   * - `icons` - show only the icons
   * - `none` - show nothing
   *
   * Depending on the `mode`, the menu will be displayed differently.
   *
   */
  show: "inline" | "overlay" | "icons" | "none";

  /**
   * List of menus.
   *
   */
  items: NavMenuItem[];

  /**
   * The click event handler.
   *
   */
  onItemClick?: (item: NavMenuItem) => void;

  listProps?: Omit<ListProps, "children">;

  /**
   * Menu search options.
   */
  searchOptions?: {
    /**
     * The search title text.
     */
    title?: string;

    /**
     * Used to filter search menu items
     */
    filter?: (item: NavMenuItem, term: string) => boolean;
    /**
     * Called when search menu shows.
     */
    onShow?: () => void;

    /**
     * Called when search menu hides.
     */
    onHide?: () => void;
  };

  /**
   * Show the search menu.
   */
  searchActive?: boolean;

  /**
   * The header element.
   *
   */
  header?: React.ReactNode;

  /**
   * The smaller header to show in icons bar.
   *
   */
  headerSmall?: React.ReactNode;

  style?: React.CSSProperties;

  className?: string;
  useCmdkSearch?: boolean;
  enableCmdKye?: boolean;
}

export function NavMenu({
  mode,
  show,
  items,
  header,
  headerSmall,
  style,
  className,
  searchOptions,
  searchActive,
  onItemClick,
  listProps,
  useCmdkSearch,
}: NavMenuProps) {
  const menus = useMemo(() => items.map((item) => walk(item)), [items]);
  const showIcons = mode === "icons";
  const Comp = showIcons ? Icons : Accordion;
  return (
    <div
      className={clsx(
        className,
        styles.nav,
        styles[`mode-${mode}`],
        styles[`show-${show}`],
      )}
      style={style}
    >
      <Comp
        mode={mode}
        show={show}
        items={menus}
        header={header}
        headerSmall={headerSmall}
        searchOptions={searchOptions}
        searchActive={searchActive}
        onItemClick={onItemClick}
        listProps={listProps}
        useCmdkSearch={useCmdkSearch}
      />
    </div>
  );
}

function walk(item: NavMenuNode, parent?: NavMenuNode): NavMenuNode {
  const parentId = parent?.id;
  const rootId = parent?.rootId ?? parent?.parentId ?? parentId;
  const result = { ...item, parentId, rootId };
  if (item.items) {
    return { ...result, items: item.items.map((item) => walk(item, result)) };
  }
  return result;
}

interface NavMenuNode extends NavMenuItem {
  rootId?: string;
  parentId?: string;
}

interface ItemProps extends ListItemButtonProps {
  item: NavMenuItem;
  state: {
    active?: string | null;
    lookup?: string | null;
    selected?: Record<string, string>;
  };
  onItemClick?: (item: NavMenuItem) => void;
  onItemHover?: (item: NavMenuItem) => void;
  isSubItems?: boolean;
}

interface VariantProps extends NavMenuProps {
  onItemHover?: (item: NavMenuItem) => void;
}

function useNavMenu({
  mode,
  show,
  items,
  searchOptions,
  searchActive,
  onItemClick,
  enableCmdKye
}: VariantProps) {
  const [showSearch, setSearchShow] = useState(searchActive ?? false);
  const [active, setActive] = useState<string | null>(null);
  const [lookup, setLookup] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const showIcons = show === "icons";

  const searchEnabled = Boolean(searchOptions);
  const searchItem = useMemo(
    () => ({
      id: "-1009",
      title: searchOptions?.title ?? "Search menu...",
      icon: () => <MaterialIcon icon="search" />,
      items,
    }),
    [items, searchOptions?.title],
  );

  const icons = useMemo(
    () => (searchEnabled ? [searchItem, ...items] : items),
    [items, searchEnabled, searchItem],
  );

  const setShowSearch = useCallback(
    (active: boolean) => {
      const { onShow, onHide } = searchOptions ?? {};
      if (active !== showSearch) {
        active ? onShow?.() : onHide?.();
        setSearchShow(active && searchEnabled);
        setLookup(active ? searchItem.id : null);
      }
    },
    [searchEnabled, searchItem.id, searchOptions, showSearch],
  );

  useOpenCmdk((open: boolean) => {
    setShowSearch(true);
  }, searchEnabled && enableCmdKye);

  useEffect(() => {
    if (searchActive !== undefined) {
      setShowSearch(searchActive && searchEnabled);
    }
  }, [searchActive, searchEnabled, setShowSearch]);

  const handleEnter = useCallback(() => {
    const id = active || (items[0] || {}).id;
    setLookup(id);
  }, [active, items]);

  const handleLeave = useCallback(() => {
    setLookup(null);
  }, []);

  const handleItemClick = useCallback(
    (item: NavMenuNode) => {
      const root = item.rootId || item.id;
      const items = item.items || [];

      if (item === searchItem) {
        return;
      }

      if (mode === "accordion") {
        setActive(root);
        setSelected(() => ({ [root]: item.id }));
      }
      if (mode === "icons") {
        setSelected((prev) => ({ ...prev, [root]: item.id }));
      }
      if (items.length === 0) {
        setActive(root);
      }

      onItemClick?.(item);
      setShowSearch(false);

      if (items.length === 0) {
        setLookup(null);
      }
    },
    [mode, onItemClick, searchItem, setShowSearch],
  );

  const handleIconClick = useCallback(
    (item: NavMenuNode) => {
      const root = item.rootId ?? item.id;
      if (item === searchItem) {
        return;
      }
      onItemClick?.(item);
      setShowSearch(false);
      setActive(root);
      setLookup(null);
    },
    [onItemClick, searchItem, setShowSearch],
  );

  const handleIconHover = useCallback(
    (item: NavMenuNode) => {
      setLookup(item.id);
      if (searchEnabled && item.id === searchItem.id) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    },
    [searchEnabled, searchItem.id, setShowSearch],
  );

  const handleSearchClick = useCallback(() => {
    setShowSearch(!showSearch);
  }, [setShowSearch]);

  const state = useMemo(
    () => ({ active, lookup, selected }),
    [active, lookup, selected],
  );

  return {
    mode,
    show,
    icons,
    items,
    state,
    showIcons,
    showSearch,
    searchItem,
    searchEnabled,
    handleEnter,
    handleLeave,
    handleItemClick,
    handleIconClick,
    handleIconHover,
    handleSearchClick,
  };
}

function Accordion(props: VariantProps) {
  const {
    state,
    icons,
    items,
    showIcons,
    showSearch,
    searchItem,
    searchEnabled,
    handleEnter,
    handleLeave,
    handleItemClick,
    handleSearchClick,
  } = useNavMenu(props);

  const { lookup } = state;
  const { header, headerSmall, searchOptions, listProps, useCmdkSearch } =
    props;

  return (
    <ClickAwayListener onClickAway={handleLeave}>
      <div
        className={clsx(styles.accordion, {
          [styles.hover]: lookup || (showIcons && showSearch),
        })}
        onMouseMove={handleEnter}
        onMouseLeave={handleLeave}
      >
        {showIcons && (
          <MenuIcons
            mode="icons"
            show="icons"
            state={state}
            items={icons}
            header={headerSmall}
          />
        )}
        {(showSearch && !useCmdkSearch) && (
          <div className={clsx(styles.menus, styles.search)}>
            {header && <div className={styles.menusHeader}>{header}</div>}
            <SearchMenu
              item={searchItem}
              state={state}
              filter={searchOptions?.filter}
              onItemClick={handleItemClick}
              show={showSearch}
              useCmdk={useCmdkSearch}
              toggleSearch={handleSearchClick}
            />
          </div>
        )}
        
        {(useCmdkSearch && searchEnabled) && <SearchMenu
            item={searchItem}
            state={state}
            filter={searchOptions?.filter}
            onItemClick={handleItemClick}
            show={showSearch}
            useCmdk={useCmdkSearch}
            toggleSearch={handleSearchClick}
          />}


        <div className={styles.menus}>
          {header && <div className={styles.menusHeader}>{header}</div>}
          <Scrollable className={clsx(styles.menusInner, '')}>
            {searchEnabled && (
              <div
                className={clsx(styles.item, styles.searchItem)}
                onClick={handleSearchClick}
              >
                <div className="flex justify-start items-center gap-2">
                  <MenuIcon item={searchItem} state={{}} />
                  <div className={styles.text}>{searchItem.title}</div>
                </div>
              </div>
            )}
            <List
              hover
              active
              focus
              select
              listStyle={{
                className: styles.rootList,
              }}
              itemStyle={{
                rippleClassName: "bg-primary/40",
                className: "rounded-lg px-2 py-1.5",
                hover: "hover:bg-primary/10 hover:text-primary-600",
                selected: "bg-primary/15 text-primary-600 fw5",
                active: "hover:bg-hd-sm",
                initial: {
                  transition: "",
                },
              }}
              {...listProps}
            >
              {items.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  state={state}
                  onItemClick={handleItemClick}
                />
              ))}
            </List>
          </Scrollable>
        </div>
      </div>
    </ClickAwayListener>
  );
}

function Icons(props: VariantProps) {
  const {
    state,
    icons,
    items,
    searchEnabled,
    showSearch,
    searchItem,
    handleLeave,
    handleItemClick,
    handleIconClick,
    handleIconHover,
    handleSearchClick,
  } = useNavMenu(props);

  const { searchOptions, useCmdkSearch } = props;
  const hover = showSearch ? searchItem.id : state.lookup;

  return (
    <div
      className={clsx(styles.buttons, {
        [styles.hover]: hover,
      })}
      onMouseLeave={handleLeave}
    >
      <MenuIcons
        mode="icons"
        show="icons"
        state={state}
        items={icons}
        onItemClick={handleIconClick}
        onItemHover={handleIconHover}
      />
      <div className={styles.menusWrapper}>
        <div className={styles.menus}>
          <SearchMenu
            item={searchItem}
            state={state}
            filter={searchOptions?.filter}
            onItemClick={handleItemClick}
            show={showSearch}
            useCmdk={useCmdkSearch}
            toggleSearch={handleSearchClick}
          />
          {items.map((item) => (
            <Menu
              key={item.id}
              item={item}
              state={state}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Menu({ item, state, onItemClick }: ItemProps) {
  const { id, title } = item;

  const active = state.lookup ? false : state.active === id;
  const hover = state.lookup === id;

  return (
    <div
      className={clsx(styles.menu, {
        [styles.active]: active,
        [styles.hover]: hover,
      })}
    >
      <div className={styles.header}>
        <MenuIcon item={item} state={{}} />
        <div className={styles.text}>{title}</div>
      </div>
      <Scrollable>
        <MenuItems item={item} state={state} onItemClick={onItemClick} />
      </Scrollable>
    </div>
  );
}

function UnknownIcon() {
  return <MaterialIcon icon="apps" />;
}

function MenuIcon({ item, state, onItemClick, onItemHover }: ItemProps) {
  const { icon, iconColor } = item;
  const Icon = icon || UnknownIcon;

  const bg = useMemo(() => iconColor && getRGB(iconColor, 0.1), [iconColor]);
  const hoverBg = useMemo(
    () => iconColor && getRGB(iconColor, 0.2),
    [iconColor],
  );
  const activeBg = useMemo(
    () => iconColor && getRGB(iconColor, 0.3),
    [iconColor],
  );

  const hover = item.id === state.lookup;

  const handleClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  const handleHover = useCallback(() => {
    onItemHover?.(item);
  }, [item, onItemHover]);

  return (
    <div
      className={clsx(styles.icon, {
        [styles.hover]: hover,
      })}
      style={
        {
          "--ax-nav-menu-icon-bg": bg,
          "--ax-nav-menu-icon-hover-bg": hoverBg,
          "--ax-nav-menu-icon-hover-color": iconColor,
          "--ax-nav-menu-icon-active-bg": activeBg,
          "--ax-nav-menu-icon-active-color": iconColor,
          "--ax-nav-menu-icon-color": iconColor,
        } as any
      }
      onClick={handleClick}
      onMouseOver={handleHover}
    >
      <Icon color={iconColor} />
    </div>
  );
}

function MenuIcons({
  items,
  state,
  header,
  onItemClick,
  onItemHover,
}: VariantProps & { state: ItemProps["state"] }) {
  return (
    <Scrollable>
      <div className={styles.icons}>
        {header && <div className={styles.iconsHeader}>{header}</div>}
        {items.map((item) => (
          <MenuIcon
            key={item.id}
            item={item}
            state={state}
            onItemClick={onItemClick}
            onItemHover={onItemHover}
          />
        ))}
      </div>
    </Scrollable>
  );
}

function MenuItem({ item, state, onItemClick, onClick:clickAction, className, ...rest }: ItemProps) {
  const node: NavMenuNode = item;
  const {
    icon,
    tag: Tag,
    tagColor,
    title,
    help,
    items = [],
    onClick,
  } = item;

  const root = node.rootId || item.id;
  const active = item.id === state.active;
  const selected = state.selected?.[root] === item.id;

  const [open, setOpen] = useState(false);

  const hasIcon = Boolean(icon);
  const hasItems = items.length > 0;

  const handleClick = useCallback((event:any) => {
    if (hasItems) {
      setOpen((prev) => !prev);
    }
    onItemClick?.(item);
    onClick?.();
    clickAction?.(event)
  }, [hasItems, item, onClick, onItemClick]);

  useEffect(() => {
    if (active) return;
    setOpen(false);
  }, [active]);

  let itemButton = (
    <List.ItemButton
      {...rest}
      className={clsx(styles.item, rest.className, {
        [styles.open]: open,
        [styles.selected]: selected,
      })}
      selected={selected}
      active={active}
      startIcon={
        hasIcon ? (
          <MenuIcon item={item} state={state} />
        ) : (
          <div className={styles.icon}></div>
        )
      }
      endIcon={
        Tag || hasItems ? (
          <>
            {Tag && (
              <div className={styles.tag}>
                <Tag color={tagColor} />
              </div>
            )}
            {hasItems && (
              <MaterialIcon
                className={styles.expand}
                fill
                icon="keyboard_arrow_down"
              />
            )}
          </>
        ) : undefined
      }
      onClick={handleClick}
      focusVisibleClassName="outline-1"
    >
      <div className={styles.text}>{title}</div>
    </List.ItemButton>
  );

  if (help) {
    itemButton = (
      <Tooltip
        offset={{
          mainAxis: 7,
        }}
        placement="left"
        content={help}
        allowOverContent
        hoverProps={{
          delay: {
            close: 100,
            open: 500,
          },
        }}
      >
        {itemButton}
      </Tooltip>
    );
  }

  if (hasItems) {
    itemButton = (
      <>
        {itemButton}
        <Collapse in={open} mountOnEnter unmountOnExit>
          <MenuItems
            item={item}
            state={state}
            onItemClick={onItemClick}
            isSubItems
          />
        </Collapse>
      </>
    );
  }

  return itemButton;
}

function MenuItems({ item, state, onItemClick, isSubItems }: ItemProps) {
  const { items = [] } = item;
  return (
    <List className={clsx(styles.items, { [styles.subItems]: isSubItems })}>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          state={state}
          onItemClick={onItemClick}
        />
      ))}
    </List>
  );
}

function flattenItem(
  item: NavMenuItem,
  parent?: NavMenuItem,
  withIcon?: boolean,
) {
  let { items = [], icon=parent?.icon, iconColor=parent?.iconColor, tag, ...rest } = item;
  const title = parent ? `${parent.title} / ${item.title}` : item.title;

  rest = { ...rest, title };
  if (withIcon && icon) {
    rest = { ...rest, icon, iconColor} as any;
  }
  items = items.flatMap((child) => flattenItem(child, rest, withIcon)).flat();

  // don't include parent
  return items.length ? items : [rest];
}

//const [ref]
const animation = {
  unmount: {
    opacity: 0,
    transform: "scale(.9)",
    transition: {
      duration: 0.7,
      ease: "easeOut",
      delay: 0,
    },
  },
  mount: {
    opacity: 1,
    transform: "scale(1)",
    transition: {
      duration: 0.5,
      ease: "easeIn",
      //delay: 0.6,
    },
  },
};

const backdropAnimation = {
  unmount: {
    opacity: 0,
    transition: {
      //delay: 0.2,
      ease: "easeOut",
    },
  },
  mount: {
    opacity: 1,
    transition: {
      delay: 0,
      ease: "easeIn",
    },
  },
};

function SearchMenu({
  item,
  state,
  filter,
  onItemClick,
  useCmdk,
  show,
  toggleSearch,
}: ItemProps & {
  toggleSearch: () => void;
  show?: boolean;
  filter?: (item: NavMenuItem, searchText: string) => boolean;
  useCmdk?: boolean;
}) {
  const items = useMemo(
    () => item.items?.flatMap((x) => flattenItem(x, undefined, useCmdk)).flat(),
    [item],
  );

  if (useCmdk) {
    return (
      <CmdkMenuSearch
        open={show ?? false}
        items={items || []}
        onItemClick={onItemClick}
        toggleSearch={toggleSearch}
        filter={filter}
        item={item}
        state={state}
      />
    );
  }

  return show ? (
    <PortalSearchMenu
      state={state}
      item={item}
      items={items}
      onItemClick={onItemClick}
      filter={filter}
      toggleSearch={toggleSearch}
    />
  ) : null;
}

function PortalSearchMenu({
  item,
  items,
  state,
  filter: filterMenuItem,
  onItemClick,
  toggleSearch,
}: ItemProps & {
  toggleSearch: () => void;
  items?: NavMenuItem[];
  filter?: (item: NavMenuItem, searchText: string) => boolean;
}) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");
  const [cursor, setCursor] = useState(0);
  const itemsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const hover = true;

  const filtered = useMemo(() => {
    if (show && items) {
      return items.filter((item) =>
        filterMenuItem
          ? filterMenuItem(item, text)
          : item.title.toLowerCase().includes(text.toLowerCase()),
      );
    }
    return [];
  }, [items, filterMenuItem, show, text]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    setShow(!!value);
  }, []);

  const canShow = hover ?? false;

  const cancelSearch = useCallback(
    () => onItemClick?.({ id: state.active || "", title: "" }),
    [onItemClick, state.active],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        cancelSearch();
        return;
      }
      if (e.key === "Enter") {
        if (cursor > -1) {
          const item = filtered[cursor];
          item && onItemClick?.(item);
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const inc = e.key === "ArrowUp" ? -1 : 1;
        const max = e.key === "ArrowUp" ? 0 : filtered.length - 1;

        const next =
          e.key === "ArrowUp"
            ? Math.max(max, cursor + inc)
            : Math.min(max, cursor + inc);

        setCursor(next);

        if (itemsRef.current) {
          const item = itemsRef.current.querySelector(`[data-index="${next}"]`);
          if (item) {
            item.scrollIntoView({ block: "nearest" });
          }
        }

        e.preventDefault();
      }
    },
    [cancelSearch, cursor, filtered, onItemClick],
  );

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => {
      cancelSearch();
    }, 200);
  }, [cancelSearch]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <Fade in={canShow} mountOnEnter unmountOnExit>
      <div
        className={clsx(styles.menu, styles.search, {
          [styles.hover]: hover,
        })}
      >
        <div className={styles.header}>
          <div className={styles.text}>
            <Input
              autoFocus
              placeholder={item.title}
              value={text}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onBlur={filtered.length ? handleBlur : cancelSearch}
              startAdornment={
                 <MaterialIcon icon="search"/>
              }
            />
          </div>
        </div>
        {show && text && (
          <Scrollable
            className={clsx(
              styles.items,
              "transition-all duration-300 ease-in-out",
            )}
            ref={itemsRef}
          >
            <List>
              {filtered.map((item, index) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  state={{}}
                  onItemClick={onItemClick}
                />
              ))}
            </List>
          </Scrollable>
        )}
      </div>
    </Fade>
  );
}


export const CmdkMenuSearch = ({
  item,
  items,
  state,
  onItemClick,
  open,
  toggleSearch,
  filter,
}: ItemProps &{
  toggleSearch: () => void;
  items: NavMenuItem[];
  open: boolean;
  filter?: (item: NavMenuItem, searchText: string) => boolean;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const [openState, setOpenState] = useState(false);
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <MuxPopper
      className="MuxSearchCmdk-popper overflow-hidden flex max-w-full max-h-full w-full md:max-w-xl"
      placement="bottom"
      
      open={open}
      dismiss={{
      }}
      keepMounted
      animate={animation}
      backdrop={{
        animate: backdropAnimation,
      }}
      focusProps={{
        modal: true,
        initialFocus: ref,
      }}
      overlay={{
        lockScroll: true,
        className: "z-modal flex justify-center items-center",
      }}
      aria-modal="true"
      roles={{ role: "dialog" }}
      handler={(open) => {
        //console.log("toggleSearch:", open);
        !open && toggleSearch();
      }}
      onCompleteState={(open)=> {
        //console.log("onCompleteState:", open);
      }}
      style={{
        top: md ? 0 : 'auto',
        position: "relative",
        height: upMd ? 'fit-content'  : '100%'
      }}
      
    >
      <Card
        variant="elevation"
        className="cmdk-palette-content antialiased md:rounded-lg divide-y transition-height w-full h-full"
        ref={cardRef as any}
        elevation={16}
        fill
      >
        <Card.Body className="p-0 flex flex-col grow h-full">
          <AutoSelect
            open
            autoComplete={false}
            itemFocusClassName="bg-hd-md"
            itemFocusVisibleClassName="bg-primary text-white"
            options={items}
            clearOnBlur
            autoSelect={false}
            autoFocus
            disablePopper
            disableCloseOnSelect
            freeSolo
            clearOnSelect
            forcePopupIcon={false}
            clearIcon={<MaterialIcon icon="cancel" />}
            onChange={(value:any) => {
              onItemClick?.(value);
              //toggleSearch();
            }}
            renderTags={() => null}
            className="border-b px-2 text-base text-body text-opacity-80"
            placeholder={item.title}
            ref={ref}
            size="lg"
            getOptionKey={(x) => x?.id}
            getOptionLabel={(x) => x?.title}
            optionMatches={filter as any}
            renderOption={(props, option, state) => (
              <MenuItem
                {...props}
                item={option as any}
                state={{}}
                ripple={false}
                key={props.key}
                //onItemClick={() => props.onClick}
              />
            )}
            slots={{
              listbox: List
            }}
            slotProps={{
              panel: {
                variant: "elevation",
                elevation: 0,
              },
              listbox: {
                className: "px-1 py-4" + (sm ? " max-h-none" : ""),
                hover: true,
                active: true,
                focus: true,
                select: true,
                divider: true,
                itemStyle:{
                  rippleClassName: "bg-primary/40",
                  className: "rounded-md px-2 py-2",
                  hover: "hover:bg-hd-sm hover:text-body",
                  selected: "bg-primary text-primary-50 font-fw5",
                  active: "active:bg-hd-sm",
                  initial: {
                    transition: "",
                  },
                }
              } as any,
            }}
            renderInput={(props) => (
              <Input
                {...props}
                autoFocus
                disableBorder
                startAdornment={<MaterialIcon icon="search" size={28} />}
                nativeClassName="font-fw5"
                adornmentsProps={{
                  start: {
                    className: "mx-1.5",
                  },
                  end: {
                    className: "mx-1.5",
                  },
                }}
              />
            )}
          />
        </Card.Body>
      </Card>
    </MuxPopper>
  );
};
