'use client';

import type { Theme } from "~/ui";
import React from "react";
import type {
  Navigation,
  NavigationObject,
  SidebarItemContextProps,
  ThemeMode,
} from "~/utils/types";
//import type { SearchOptions } from "~/utils/data";
import type {
  AdvancedSearchState,
  Block,
  DataContext,
  DataRecord,
  DataStore,
  SearchOptions,
  SearchResult,
  ViewBlock,
  WidgetBlock
} from "~/utils";

import type { IFormContext as IIFormContext, IWidgetState, ResourceContext as ResourceContextValue, ViewProps } from "~/scope/types";
import type { RouterState } from "~/routes/types";

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


export const ResourceContext = React.createContext<ResourceContextValue>(
  null as any,
);

export const ViewContext = React.createContext<ViewProps<any>>(null as any);

export const WidgetControlContext = React.createContext<{
  register: (block: WidgetBlock) => IWidgetState
}>(null as any);

export const RecordContext = React.createContext<DataRecord>({});

export const useResourceContext = () => React.useContext(ResourceContext);

export function useViewContext<T extends ViewBlock=any>() {
  return React.useContext<ViewProps<T>>(ViewContext as any);
}

export function useViewBlock<T extends ViewBlock=any>() {
  const {view} = useViewContext<T>()
  return view
}

export const useRecord = () => React.useContext(RecordContext);

export const EvalDataContext = React.createContext<DataContext>(null as any);

export const useEvalDataContext = () => {
  const last = React.useContext(EvalDataContext);
  const viewContext = useViewContext()
  return last ?? (viewContext as any)?.evalContext;
};


export type ListViewValue = {
  setItemBlock: (block: Block) => void;
};

export const ListViewContext = React.createContext<ListViewValue>(
  undefined as any,
);

export const useListView = () => React.useContext(ListViewContext);

export type ViewSearchState = {
  search: AdvancedSearchState;
  setSearch: (state: React.SetStateAction<AdvancedSearchState>) => void;
  doSearch: (options?: SearchOptions) => Promise<SearchResult>;
};

export type ViewContextValue = ViewSearchState & {
  dataStore?: DataStore;
  type?: "details" | "list";
};

export const ViewDataContext = React.createContext<ViewContextValue>(null as any);

export const useViewDataContext = () => React.useContext(ViewDataContext);


export const WidgetBlockContext = React.createContext<WidgetBlock>(undefined as any);
export const WidgetStateContext = React.createContext<IWidgetState>(undefined as any);

export const useWidgetBlock = () => React.useContext(WidgetBlockContext);
export const useWidgetState = () => React.useContext(WidgetStateContext);
//export const BlocContext = React.createContext<ViewContextValue>(null as any);


export const IFormContext = React.createContext<IIFormContext>(undefined as any);
export const useFormContext = () => React.useContext(IFormContext);

export const RouterContext = React.createContext<RouterState>(null as any);

export const useRouterContext = () => React.useContext(RouterContext);