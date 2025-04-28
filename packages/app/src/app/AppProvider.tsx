'use client';
import * as React from 'react';
import {
  NavContext,
  RouterContext,
  AppContext
} from '../shared/context';
import {
  Button,
} from '@funext/ui';

import type { AppProviderProps } from './types';

/**
 *
 * Demos:
 *
 * - [App Provider](https://mui.com/toolpad/core/react-app-provider/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [AppProvider API](https://mui.com/toolpad/core/api/app-provider)
 */
function AppProvider(props: AppProviderProps) {
  const {
    children,
    nav = [],
    router = null,
    Navigate,
  } = props;
  Button.fff = 0;
  return (
    <AppContext.Provider value={{Navigate}}>
      <RouterContext.Provider value={router}>
        <NavContext.Provider value={nav}>
        {children}

        </NavContext.Provider>
      </RouterContext.Provider>
    </AppContext.Provider>
  );
}

export { AppProvider };