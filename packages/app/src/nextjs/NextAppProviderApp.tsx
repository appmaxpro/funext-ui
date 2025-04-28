import * as React from 'react';
import { usePathname, useSearchParams, useRouter,  } from 'next/navigation';
import { AppProvider} from '../app';
import type { AppProviderProps , Router } from '../app';
import Outlet from './Outlet';
/**
 * @ignore - internal component.
 */
export function NextAppProviderApp(props: AppProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push, replace, back } = useRouter();
  const stateRef = React.useRef<any>(undefined);
  const navigate = React.useCallback<Router['navigate']>(
    (url, { history = 'auto', state} = {}) => {
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
    [pathname, navigate, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}