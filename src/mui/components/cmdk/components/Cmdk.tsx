import FreeSearchAction from "./FreeSearchAction";
import Icon from "./Icon";
import List from "./List";
import ListItem from "./ListItem";
import Page from "./Page";
import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Search from "./Search";
import {
  OpenContext,
  PageContext,
  RenderLinkContext,
  SearchContext,
  SelectContext,
} from "../lib/context";
import { RenderLink } from "../types";
import Popper from "../../Popper";
import { twMerge } from "tailwind-merge";
import { transform } from "framer-motion";


const animation = {
  unmount: {
    opacity: 0,
    transform: 'scale(.9)',
    transition: {
      duration: 2,
      ease: 'easeOut',
      delay: 0
    },
  },
  mount: {
    opacity: 1,
    transform: 'scale(1)',
    transition: {
      duration: 0.5,
      ease: 'easeIn',
      delay: .6
    },
  },
};

const backdropAnimation = {
  unmount: {
    opacity: 0,
    transition: {
      delay: 0.2,
      ease: 'easeOut'
    },
  },
  mount: {
    opacity: 1,
    transition: {
      delay: 0,
      ease: 'easeIn'
    },
  },
};

interface CmdkProps {
  onChangeSelected?: (value: number) => void;
  onChangeSearch: (search: string) => void;
  onChangeOpen: (isOpen: boolean) => void;
  renderLink?: RenderLink;
  placeholder?: string;
  children: ReactNode;
  footer?: ReactNode;
  selected?: number;
  isOpen: boolean;
  search: string;
  page?: string;
  className?: string;
}

function Cmdk({
  selected: selectedParent,
  placeholder = "Search",
  onChangeSelected,
  onChangeSearch,
  onChangeOpen,
  renderLink,
  children,
  isOpen,
  footer,
  search,
  page,
  className
}: CmdkProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] =
    typeof selectedParent === "number" && onChangeSelected
      ? [selectedParent, onChangeSelected]
      : useState<number>(0);

  const [searchPrefix, setSearchPrefix] = useState<string[] | undefined>();

  function handleChangeSelected(direction?: "up" | "down") {
    const items = document.querySelectorAll(".command-palette-list-item");

    let index = 0;
    let newIndex = 0;
    let newItem: Element;

    if (direction === "down") {
      items.forEach((_, i) => {
        if (i === selected) {
          index = i;
        }
      });

      newIndex = index === items.length - 1 ? 0 : index + 1;
    } else if (direction === "up") {
      items.forEach((_, i) => {
        if (i === selected) {
          index = i;
        }
      });

      newIndex = !index ? items.length - 1 : index - 1;
    } else {
      setSelected(0);
    }

    newItem = items[newIndex];

    if (newItem && typeof newIndex === "number") {
      setSelected(newIndex);
      newItem.scrollIntoView({
        behavior: "smooth",
        block: newIndex ? "center" : "end",
      });
    }
  }

  function handleSelect() {
    const items = document.querySelectorAll(
      ".command-palette-list-item"
    ) as NodeListOf<HTMLButtonElement | HTMLAnchorElement>;

    let index = 0;
    let item: HTMLAnchorElement | HTMLButtonElement;

    items.forEach((_, i) => {
      if (i === selected) {
        index = i;
      }
    });

    item = items[index];

    if (item) {
      item.click();

      if (
        item.attributes.getNamedItem("data-close-on-select")?.value === "true"
      ) {
        onChangeOpen(false);
      }
    }
  }

  useEffect(() => {
    handleChangeSelected();
  }, [search]);

  useEffect(() => {
    setSelected(0);
  }, [page]);


  const classes = twMerge('cmdk-palette fixed inset-0 top-[20px]', className);

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
        <Popper
          
          className={classes}
          placement="bottom"
          strategy="fixed"
          open={isOpen}
          handler={(open) => onChangeOpen(open)}
          dismiss={{}}
          backdrop={{
              className: 'backdrop fixed inset-0 grid place-items-center w-screen h-screen bg-slate bg-opacity-80 z-100',
              animate: backdropAnimation,
              style: {
                zIndex: 100
              }
          }}
          focusProps={{
             modal: true,
             initialFocus: inputRef
          }}
          animate={animation}
          overlay={{
            lockScroll: true,
            style:{
              zIndex: 10000
            }
          }}
          aria-modal="true"
          roles={{role:"dialog"}}
        >
          <div className="cmdk-palette-content antialiased">

            <div className="overflow-y-auto flex items-center justify-center">
              <div className="flex w-full h-[450px] items-start justify-center p-4">
                <div className="w-full max-h-full bg-body shadow-lg rounded-lg max-w-xl flex flex-col overflow-hidden divide-y">
                    <PageContext.Provider
                      value={{
                        setSearchPrefix,
                        searchPrefix,
                        page,
                      }}
                    >
                      <Search
                        onChange={onChangeSearch}
                        placeholder={placeholder}
                        prefix={searchPrefix}
                        value={search}
                        ref={inputRef}
                      />
                    </PageContext.Provider>

                    <OpenContext.Provider value={{ isOpen, onChangeOpen }}>
                      <PageContext.Provider
                        value={{ page, searchPrefix, setSearchPrefix }}
                      >
                        <SearchContext.Provider value={{ search, onChangeSearch }}>
                          <SelectContext.Provider value={{ selected }}>
                            <RenderLinkContext.Provider
                              value={{ renderLink }}
                            >
                              {children}
                            </RenderLinkContext.Provider>
                          </SelectContext.Provider>
                        </SearchContext.Provider>
                      </PageContext.Provider>
                    </OpenContext.Provider>

                    {footer}
                  </div>
              </div>
            </div>
          </div>
        </Popper>
    </div>
  );
}

Cmdk.Page = Page;
Cmdk.List = List;
Cmdk.ListItem = ListItem;
Cmdk.Icon = Icon;
Cmdk.FreeSearchAction = FreeSearchAction;

export default Cmdk;
