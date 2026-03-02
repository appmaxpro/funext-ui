'use client';
import * as React from 'react';
import { useSearchParams, useLocation, useNavigate, Navigate, Outlet} from 'react-router';
import { AppProvider, type AppProviderProps, Router } from '../app';


function ReactAppProvider(props: AppProviderProps) {
  const { pathname, state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


  const navigateImpl = React.useCallback<Router['navigate']>(
    (url, { history = 'auto', state } = {}) => {
      if (history === 'auto' || history === 'push') {
        return navigate(url, {state});
      }
      if (history === 'replace') {
        return navigate(url, { replace: true, state });
      }
      if (history === 'pop') {
        return navigate(url, { replace: true, state });
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [navigate],
  );

  const routerImpl = React.useMemo<Router>(
    () => ({
      pathname,
      searchParams,
      navigate: navigateImpl,
      back: ()=> false,
      Outlet,
      state
    }),
    [pathname, searchParams, navigateImpl, state],
  );

  return <AppProvider Navigate={Navigate} router={routerImpl} {...props} />;
}

export {
  ReactAppProvider,
};