import * as React from 'react';
import { useRouter } from 'next/router';
import { AppProvider } from '../app';
import type { AppProviderProps, Router } from '../app';
import Outlet from './Outlet';

/**
 * @ignore - internal component.
 */
export function NextAppProviderPages(props: AppProviderProps) {
  const { push, replace, pathname, query, back } = useRouter();
  const stateRef = React.useRef<any>(undefined);

  const search = React.useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      const arr = (Array.isArray(value ?? []) ? value ?? [] : [value]) as [];
      arr.forEach((v) => {
        params.append(key, v);
      });
    });
    return params.toString();
  }, [query]);

  // Stable search params object
  const searchParams = React.useMemo(() => new URLSearchParams(search), [search]);

  const navigate = React.useCallback<Router['navigate']>(
    (url, { history = 'auto', state } = {}) => {
      stateRef.current = state;
      if (history === 'auto' || history === 'push') {
        return push(String(url));
      }
      if (history === 'replace') {
        return replace(String(url));
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [push, replace],
  );

  const routerImpl = React.useMemo<Router>(
    () => ({
      pathname,
      searchParams,
      navigate,
      back,
      Outlet,
      state: stateRef.current
    }),
    [navigate, pathname, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}