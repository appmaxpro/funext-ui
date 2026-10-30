import { ScreenSizeProvider } from "~/ui";

//import { useAppLang } from "./hooks/use-app-lang";
import { Routes } from "./routes/routes";
import { ErrorBoundary } from "./components/app/error-boundary";
import { AppThemeProvider } from "./components/app/app-theme-provider";
import { LocalizationProvider } from "./components/app/localization-provider";
import { DialogsProvider } from "./components/app/dialogs-provider";
import { ErrorCatch } from "./components/app/error-catch";
import NavigationProvider from "./routes/navigation-provider";

import "./styles/app.css";
import UpdateController from "./UpdateController";
import { useDeviceSelector } from "./store/device-selector";
import app from "./utils/app";
import { EMPTY_DEPS } from "./utils";
import React from "react";
import { $use } from "./utils/http";

function isLogin(input: RequestInfo | URL) {
  const url = input instanceof Request ? input.url : input.toString();
  return url.includes("/auth/");
}

function App() {
  app.deviceSelector = useDeviceSelector();

  React.useEffect(() => {
    return $use(async (args, next) => {
      if(isLogin(args.input)) {
        return next(); 
      }
      
      const token = localStorage.getItem('ssToken')?.replaceAll("\"", "");
      if (!token) {
        return next(); 
      }
      //console.error("Authorization:", args.input, ", token:", token)
      const headers: Record<string, string> = {
        'Authorization': "Basic " + token
      };
      
      const { init = {} } = args;
      args.init = {
        ...init,
        credentials: "include",
        headers: {
          ...init.headers,
          ...headers,
        },
      };
      return next();
    });
  }, EMPTY_DEPS);
  return (
    <ErrorBoundary>
      <>
        <LocalizationProvider>
          <AppThemeProvider>
            <ScreenSizeProvider>
              <NavigationProvider>
                <DialogsProvider>
                  <UpdateController />
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
