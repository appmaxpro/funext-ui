import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  createSearchParams,
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

export function useRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const refs = useRef({ location, navigate });
  const params = useParams();
  
  const to = useCallback(
    ({
      path,
      params,
      query,
    }: {
      path: string;
      params?: Record<string, string | null>;
      query?: Record<string, string>;

    }) => {

      const pathname = generatePath(path, params);
      const search = createSearchParams(query).toString();
      const current = refs.current.location;
      if (current.pathname !== pathname || current.search !== search) {
        refs.current.navigate({
          pathname,
          search,
        });
      }
    },
    [],
  );

  useEffect(() => {
    
    refs.current = { location, navigate };
  }, [location, navigate]);

  return useMemo(
    () => ({
      get location() {
        return refs.current.location;
      },
      get navigate() {
        return refs.current.navigate;
      },
      to,
    }),
    [to],
  );
}
