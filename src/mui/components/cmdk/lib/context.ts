import { RenderLink } from "../types";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export const SelectContext = createContext<{ selected: number }>({
  selected: 0,
});

export const PageContext = createContext<{
  setSearchPrefix?: Dispatch<SetStateAction<string[] | undefined>>;
  searchPrefix?: string[];
  page?: string;
}>({
  searchPrefix: undefined,
  page: undefined,
});

export interface SearchContextProps{
  search: string;
  onChangeSearch: (search: string) => void;
}

export const SearchContext = createContext<SearchContextProps>({
  search: "",
  onChangeSearch: ()=> {}
});

export const RenderLinkContext = createContext<{
  renderLink?: RenderLink;
}>({
  renderLink: undefined,
});

export const OpenContext = createContext<{
  onChangeOpen: (value: boolean) => void;
  isOpen: boolean;
}>({
  onChangeOpen: () => undefined,
  isOpen: false,
});



