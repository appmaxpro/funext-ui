/* eslint-disable import/no-relative-packages */
import * as React from "react";
import dayjs from "dayjs";

import ar from "../../assets/l10n/ar.json";
import en from "../../assets/l10n/en.json";
import "dayjs/locale/ar";
import "dayjs/locale/en";
import { i18n } from "~/utils/i18n";
import { useLocalStorage } from "~/hooks/use-local-storage";
import {
  LocalizationContext,
  useLocalization,
  type Languages,
  type Localization,
} from "~/context";
import { session } from "~/utils/session";

export const languages = {
  ar: { data: ar, country: "SA", name: "العربية" },
  en: { data: en, country: "US", name: "English" },
};

export const getDefaultLanguage = () => {
  const browserLanguages = window.navigator.languages
    ? window.navigator.languages.slice()
    : [];
  const browserLanguage =
    (window.navigator as any).userLanguage || window.navigator.language;
  browserLanguages.push(browserLanguage);
  browserLanguages.push(browserLanguage.substring(0, 2));

  for (let i = 0; i < browserLanguages.length; i += 1) {
    let language = browserLanguages[i].replace("-", "");
    if (language in languages) {
      return language;
    }
    if (language.length > 2) {
      language = language.substring(0, 2);
      if (language in languages) {
        return language;
      }
    }
  }
  return "en";
};

export const LocalizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLanguage] = useLocalStorage("language");

  const language = (lang ?? getDefaultLanguage()) as keyof Languages;

  const direction = /^(ar|he|fa)$/.test(language) ? "rtl" : "ltr";

  

  const value = React.useMemo(
    () => ({ languages, language, setLanguage, direction }),
    [language, setLanguage, direction],
  );

  React.useEffect(() => {
    let selected;
    if (language.length > 2) {
      selected = `${language.slice(0, 2)}-${language.slice(-2).toLowerCase()}`;
    } else {
      selected = language;
    }
    dayjs.locale(selected);
    document.dir = direction;
    const { data } = languages[language as keyof Languages];
    i18n.loadAssets(data);
  }, [language, direction]);

  console.log("LocalizationContext: language:", language)

  return (
    <LocalizationContext.Provider value={value as Localization}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = () => {
  return i18n.t;
};

export const useTranslationKeys = (predicate: (element: any) => boolean) => {
  const { languages, language } = useLocalization();
  const { data } = languages[language];
  return Object.keys(data).filter(predicate);
};
