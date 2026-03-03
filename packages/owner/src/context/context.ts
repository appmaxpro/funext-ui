'use client';

import type { Theme } from "@funext/ui/styles";
import React from "react";
import type {
  Navigation,
  NavigationObject,
  NavRoute,
  SidebarItemContextProps,
  ThemeMode,
} from "~/utils/types";
//import type { SearchOptions } from "~/utils/data";
import type {
  AdvancedSearchState,
  DataContext,
  DataRecord,
  Identifier, SearchOptions,
  SearchResult
} from "~/utils/data-types";
import type { DataStore } from "~/utils/data-store";
import type {
  ViewBlock,
  WidgetBlock
} from "~/utils/block-types";
import type { ListModifiers, ListParams } from "~/components/views/list-types";
import type { IndexRecord, Tab } from "~/components/views/types";
import type { IWidgetState } from "~/components/views/form";

//@ts-ignore
export const NavigationContext = React.createContext<NavigationObject>(null);

export const useNavigationContext = () =>
  React.useContext(NavigationContext) satisfies NavigationObject;

export const NavContext = React.createContext<Navigation>([]);

export const useNavContext = (): Navigation =>
  useNavigationContext().navigation;

export const SidebarItemContext =
  React.createContext<SidebarItemContextProps | null>(null);

export type AppTheme = Theme | { light: Theme; dark: Theme };

export const PaletteModeContext = React.createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDualTheme: boolean;
}>({
  themeMode: "light",
  setThemeMode: () => {},
  isDualTheme: false,
});

type LangData = {
  data: any;
  country: string;
  name: string;
};

export type Languages = {
  ar: LangData;
  en: LangData;
};

export type Localization = {
  languages: Languages;
  language: keyof Languages;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  direction: "rtl" | "ltr";
};

export const LocalizationContext = React.createContext<Localization>(
  null as any,
);

export const useLocalization = () => React.useContext(LocalizationContext);

export type LayoutContextValue = {
  setScrollerRef: (ref: HTMLElement | null) => void;
};
export const LayoutContext = React.createContext<LayoutContextValue>({
  setScrollerRef: () => {},
});
export const useLayoutContext = () => React.useContext(LayoutContext);

export type NavTabsNode = {
  parent?: NavTabsNode;
  nav: NavRoute;
};

export const TabsContext = React.createContext<NavTabsNode>(null as any);

export const useTabsContext = () => React.useContext(TabsContext);

export const isNavTabsMounted = (
  nav: NavRoute,
  node?: NavTabsNode,
): boolean => {
  if (!node) return false;
  if (node.nav === nav) return true;

  return isNavTabsMounted(nav, node.parent);
};

export type ResourceContext = {
  tab: Tab;
  dataStore: DataStore;
  listParams: ListParams;
  modifiers: ListModifiers;
  doSearch: (option?: SearchOptions) => Promise<SearchResult>;
};

export const ResourceContext = React.createContext<ResourceContext>(
  null as any,
);

export const ViewBlockContext = React.createContext<ViewBlock>(null as any);

export const RecordContext = React.createContext<DataRecord>({});

export const useResourceContext = () => React.useContext(ResourceContext);

export const useViewBlockContext = () => React.useContext(ViewBlockContext);

export const useRecordContext = () => React.useContext(RecordContext);

export const EvalDataContext = React.createContext<DataContext>(null as any);

export const useEvalDataContext = () => {
  const last = React.useContext(EvalDataContext);
  const { tab } = useResourceContext();
  return last ?? tab.action.evalContext;
};

export type ListViewValue = {
  getContext: (record: IndexRecord) => DataContext;
  showDetail?: (record: DataRecord | Identifier, option?: {}) => Promise<void>;
};

export const ListViewContext = React.createContext<ListViewValue>(
  undefined as any,
);

export const useListViewContext = () => React.useContext(ListViewContext);

export type ViewSearchState = {
  search: AdvancedSearchState;
  setSearch: (state: React.SetStateAction<AdvancedSearchState>) => void;
  doSearch: (options?: SearchOptions) => Promise<SearchResult>;
};

export type ViewContextValue = ViewSearchState & {
  dataStore?: DataStore;
  type?: "details" | "list";
};

export const ViewContext = React.createContext<ViewContextValue>(null as any);

export const useViewContext = () => React.useContext(ViewContext);


export const useDataContext = () => useRecordContext() as any;

export const BlockContext = React.createContext<WidgetBlock>(undefined as any);
export const WidgetStateContext = React.createContext<IWidgetState>(undefined as any);