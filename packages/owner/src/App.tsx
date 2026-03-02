import React from "react";
import {
  ScreenSizeProvider,
} from "@funext/ui";

//import { useAppLang } from "./hooks/use-app-lang";
import { Routes } from "./routes/routes";
import { ErrorBoundary } from "./components/app/error-boundary";
import { AppThemeProvider } from "./components/app/app-theme-provider";
import { LocalizationProvider } from "./components/app/localization-provider";
import { DialogsProvider } from "./components/app/dialogs-provider";
import { HttpWatch } from "./components/http-watch";
import { ErrorCatch } from "./components/app/error-catch";
import NavigationProvider from "./routes/navigation-provider";

import "./styles/app.css";

function App() {
  return (
    <ErrorBoundary>
      <>
        {/*<UpdateController />*/}
        <LocalizationProvider>
          <AppThemeProvider>
              <ScreenSizeProvider>
                <NavigationProvider>
                  <DialogsProvider>
                    <Routes />
                    <ErrorCatch />
                  </DialogsProvider>
                </NavigationProvider>
              </ScreenSizeProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </>
    </ErrorBoundary>
  );
}

export default App;
