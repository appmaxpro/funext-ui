import {
  ScreenSizeProvider,
} from "@funext/ui";

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

function App() {
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
