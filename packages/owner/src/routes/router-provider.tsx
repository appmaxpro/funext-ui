import React, { useCallback, useEffect } from "react";
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
  Outlet
} from "react-router";
import { useNavContext, RouterContext } from "~/context";
import { matchPath } from "~/utils/navigation";
import qs from "query-string";
import { EMPTY_OBJECT, type OutletRoute } from "~/utils";
import { useLazyRef } from "@funext/ui";
import { RouteLayout } from "./route-layout";
import type { RouterState } from "./types";

export { generatePath, Outlet };



export function RouterProvider() {
  const navigation = useNavContext();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const refs = useLazyRef(() => ({
    location: {
      pathname: '',
      search: '',
      hash: '',
      state: EMPTY_OBJECT,
      key: 'default'
    },
    navigate,
    params,
    route: (navigation[0] as OutletRoute).children![0] as OutletRoute,
  }));

  console.log("RouterProvider--current:", refs.current);
  const to = useCallback(
    ({
      path,
      params,
      query,
      state,
      replace,
    }: {
      path: string;
      params?: Record<string, any | null>;
      query?: Record<string, any>;
      state?: any;
      replace?: boolean;
      //options?: NavigateOptions
    }) => {
      const current = refs.current.location;
      const noPath = path === "";
      if (noPath) {
        const activeItem = matchPath(navigation, current.pathname);
        if (!activeItem || !activeItem.path) {
          return;
        }
        path = activeItem.path;
        state ??= current.state;
      }

      params = params
        ? Object.entries(params ?? EMPTY_OBJECT).reduce((prev, [key, val]) => {
            prev[key] = val == null ? null : `${val}`;
            return prev;
          }, {} as any)
        : params;

      const pathname = generatePath(path, params);
      const search =
        noPath && !query ? current.search : qs.stringify(query ?? EMPTY_OBJECT); // createSearchParams(query).toString();
      if (current.pathname !== pathname || current.search !== search) {
        refs.current.navigate(
          {
            pathname,
            search,
          },
          state || replace != null ? { state, replace } : undefined,
        );
      }
    },
    [],
  );

  const [router, setRouter] = React.useState(() => ({
    ...refs.current,
    to,
  }));

  useEffect(() => {
    const cp = refs.current;
    let route = cp.route;
    if (
      cp.location.key === "default" ||
      cp.location.pathname !== location.pathname ||
      !route
    ) {
      const toRoute = matchPath(navigation, location.pathname);
      if (toRoute) {
        route = toRoute;
      }
    }
    refs.current = { location, navigate, params, route };

    setRouter({
      get location() {
        return refs.current.location;
      },
      get navigate() {
        return refs.current.navigate;
      },
      get params() {
        return refs.current.params;
      },
      get route() {
        return refs.current.route;
      },
      to,
    });

    console.log("RouterProvider::current:", refs.current);
  }, [location, navigate, params]);

  if (!router || !router.route) {
    return "Empty RouterContext.Provider";
  }

  return (
    <RouterContext.Provider value={router}>
      {router.route.props?.custom ? (
        <RouteLayout route={router.route} params={router.params} />
      ) : (
        <Outlet />
      )}
    </RouterContext.Provider>
  );
}
