import FreeSearchAction from "../cmdk/components/FreeSearchAction";
import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Search from "../cmdk/components/Search";
import Popper from "../Popper";
import { twMerge } from "tailwind-merge";
import { transform } from "framer-motion";
import { CmdkContext, CmdkContextProps, useCmdk, useCmdkContext } from "./CmdContext";
import Panel from "../Panel";
import { MaterialIcon } from "../../../icons/material-icon";

export const Icon = MaterialIcon;

const animation = {
  unmount: {
    opacity: 0,
    transform: "scale(.9)",
    transition: {
      duration: 2,
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
      delay: 0.6,
    },
  },
};

const backdropAnimation = {
  unmount: {
    opacity: 0,
    transition: {
      delay: 0.2,
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

export type CmdkContextProviderProps = Omit<
  CmdkContextProps,
  "search" | "onSearch" | "open" | "setOpen"
> & {
  search: string;
  onSearch?: (search: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children: React.ReactNode;
};

export function CmdkContextProvider(props: CmdkContextProviderProps) {
  const {
    search = "",
    onSearch = (search: string) => {},
    open = false,
    setOpen = (open: boolean) => {},
    targetType = "all",
    isSelected = (value) => false,
    children,
    ...rest
  } = props;

  return (
    <CmdkContext.Provider
      value={{
        ...rest,
        search,
        onSearch,
        open,
        setOpen,
        targetType,
        isSelected,
      }}
    >
      {children}
    </CmdkContext.Provider>
  );
}

interface CmdkProps {
  placeholder?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  trigger?: ReactNode;
}

function Cmdk2({
  placeholder = "Search",
  children,
  trigger,
  footer,
  className,
}: CmdkProps) {
  const {
    inputRef,
    contentRef,
    context: { search, page, open, setOpen, onSearch },
  } = useCmdk();

  const [activeIndex, setActiveIndex] = useState(0);

  const [searchPrefix, setSearchPrefix] = useState<string[] | undefined>();

  function handleChangeSelected(direction?: "up" | "down") {
    const items = contentRef.current?.querySelectorAll("[data-list-item]");
    if (!items) {
      return;
    }

    let index = 0;
    let newIndex = 0;
    let newItem: Element;

    if (direction === "down") {
      items.forEach((_, i) => {
        if (i === activeIndex) {
          index = i;
        }
      });

      newIndex = index === items.length - 1 ? 0 : index + 1;
    } else if (direction === "up") {
      items.forEach((_, i) => {
        if (i === activeIndex) {
          index = i;
        }
      });

      newIndex = !index ? items.length - 1 : index - 1;
    } else {
      setActiveIndex(0);
    }

    newItem = items[newIndex];

    if (newItem && typeof newIndex === "number") {
      setActiveIndex(newIndex);
      newItem.scrollIntoView({
        behavior: "smooth",
        block: newIndex ? "center" : "end",
      });
    }
  }

  function handleSelect() {
    const items = contentRef.current?.querySelectorAll(
      ".command-palette-list-item",
    ) as NodeListOf<HTMLButtonElement | HTMLAnchorElement>;

    let index = 0;
    let item: HTMLAnchorElement | HTMLButtonElement;

    items.forEach((_, i) => {
      if (i === activeIndex) {
        index = i;
      }
    });

    item = items[index];

    if (item) {
      item.click();

      if (
        item.attributes.getNamedItem("data-close-on-select")?.value === "true"
      ) {
        setOpen?.(false);
      }
    }
  }

  useEffect(() => {
    handleChangeSelected();
  }, [search]);

  useEffect(() => {
    setActiveIndex(0);
  }, [page]);

  const classes = twMerge("cmdk-palette overflow-hidden", className);

  return (
    <div
      className="'MuxCmdk-root',"
      onKeyDown={(e) => {
        if (
          e.key === "ArrowDown" ||
          (e.ctrlKey && e.key === "n") ||
          (e.ctrlKey && e.key === "j")
        ) {
          e.preventDefault();
          e.stopPropagation();
          handleChangeSelected("down");
        } else if (
          e.key === "ArrowUp" ||
          (e.ctrlKey && e.key === "p") ||
          (e.ctrlKey && e.key === "k")
        ) {
          e.preventDefault();
          e.stopPropagation();
          handleChangeSelected("up");
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          handleSelect();
        }
      }}
    >
      {trigger}
      <Popper
        className={classes}
        placement="bottom"
        strategy="fixed"
        open={open}
        handler={(open) => setOpen?.(open)}
        dismiss={{}}
        backdrop={{
          className:
            "backdrop fixed inset-0 grid place-items-center w-screen h-screen bg-slate bg-opacity-80 z-100",
          animate: backdropAnimation,
          style: {
            zIndex: 100,
          },
        }}
        focusProps={{
          modal: true,
          initialFocus: inputRef,
        }}
        animate={animation}
        overlay={{
          lockScroll: true,
        }}
        aria-modal="true"
        roles={{ role: "dialog" }}
      >
        <Panel className="cmdk-palette-content antialiased w-full h-full max-h-full bg-body shadow-lg rounded-lg max-w-xl flex flex-col divide-y">
          <Search
            onChange={onSearch}
            placeholder={placeholder}
            prefix={searchPrefix}
            value={search}
            ref={inputRef}
          />
          <div ref={contentRef as any}>{children}</div>
          {footer}
        </Panel>
      </Popper>
    </div>
  );
}


interface PageProps {
  searchPrefix?: string[];
  onEscape?: () => void;
  children: ReactNode;
  id: string;
  as?: React.ComponentType | React.ElementType
}

export function Page({
  searchPrefix,
  children,
  onEscape,
  id,
  as: Comp = 'li'
}: PageProps) {
  const { page, setSearchPath, search } = useCmdkContext();

  const isActive = page === id;

  useEffect(() => {
    if (onEscape && isActive) {
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onEscape!();
        } else if (e.key === "Backspace" && !search) {
          e.preventDefault();
          e.stopPropagation();
          onEscape!();
        }
      }

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isActive, search]);

  useEffect(() => {
    if (isActive && setSearchPath) {
      setSearchPath(searchPrefix);
    }
  }, [searchPrefix, isActive, setSearchPath]);

  return isActive ? <Comp role="none">{children}</Comp> : null;
}

Cmdk2.Page = Page;
Cmdk2.Icon = Icon;
Cmdk2.FreeSearchAction = FreeSearchAction;

export default Cmdk2;
