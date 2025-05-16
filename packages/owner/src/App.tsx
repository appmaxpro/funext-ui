import React from "react";

import {
  ScreenSizeProvider,
  type LinkProps,
  useScreenSize,
  GlobalStyles,
} from "@funext/ui";

import { CoreThemeProvider } from "@funext/ui/mui";
import { Link as LinkComponent } from "./components/app/link";
import PersonIcon from '@funext/icons/Person';
import DashboardIcon from '@funext/icons/Dashboard';
import ShoppingCartIcon from '@funext/icons/ShoppingCart';

//import { useAppLang } from "./hooks/use-app-lang";
import { Routes } from "./routes";

import "./app.css";
import { ErrorBoundary } from "./components/app/error-boundary";
import UpdateController from "./UpdateController";
import { AppThemeProvider } from "./components/app/app-theme-provider";
import { LocalizationProvider } from "./components/app/localization-provider";
import type { Routes as NavRoutes} from "./utils/types";
import { RouteContext } from "./context";
//import { LocalizationProvider } from "./components/localization-provider";

const NAVIGATION: NavRoutes = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'employees',
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

function App() {

  return (
    <ErrorBoundary>
      <UpdateController />
      <LocalizationProvider>
        <AppThemeProvider>
          <ScreenSizeProvider>
            <RouteContext.Provider value={NAVIGATION }>
              <Routes />
            </RouteContext.Provider>
          </ScreenSizeProvider>
        </AppThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}

export default App;
