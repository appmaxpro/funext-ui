import { jsx } from '@emotion/react'
import i18next from "i18next";
import React, { useEffect } from "react";
import { Decorator } from "@storybook/react";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { CoreThemeProvider } from "../../../src/core";
import { Panel } from "../../../src/mui";

import ar_MA from "./locales/ar_MA/translations.json";
import en_US from "./locales/en_US/translations.json";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto';
import "../../../src/global.css";

import {createPortal} from 'react-dom';

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: "en_US",
  fallbackLng: "en_US",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en_US: {
      translation: en_US,
    },
    ar_MA: {
      translation: ar_MA,
    },
  },
});

export const WithTheme: Decorator = (Story, context) => {
  const { locale, theme } = context.globals;
  const dir = locale && locale.startsWith("ar") ? "rtl" : "ltr";
  //console.log("WithTheme:", context.globals)
  useEffect(() => {
    if (locale) i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>

      {
      <CoreThemeProvider dir={dir} theme={theme}>
        <Panel className='w-full min-h-screen' fill>
          {Story(context)}
        </Panel> 
      </CoreThemeProvider>
      }
    </I18nextProvider>
  );
};
