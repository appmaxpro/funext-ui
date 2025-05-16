import type { Theme } from "@funext/ui/styles";
import React from "react";
import type { Routes, SidebarItemContextProps, ThemeMode } from "~/utils/types";

export const RouteContext = React.createContext<Routes>([]);


export const SidebarItemContext =
  React.createContext<SidebarItemContextProps | null>(null);


export type AppTheme = Theme | { light: Theme; dark: Theme };


export const PaletteModeContext = React.createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDualTheme: boolean;
}>({
  themeMode: 'light',
  setThemeMode: () => {},
  isDualTheme: false,
});


type LangData = { 
  data: any, 
  country: string, 
  name:string
}

export type Languages = {
  ar: LangData,
  en: LangData,
};

export type Localization = {
  languages: Languages;
  language: keyof Languages;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  direction: 'rtl' | 'ltr'
};

export const LocalizationContext = React.createContext<Localization>(null as any);

export const useLocalization = () => React.useContext(LocalizationContext);