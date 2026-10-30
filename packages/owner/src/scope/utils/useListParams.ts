import {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
  useContext,
} from "react";
import qs from "query-string";
import lodashDebounce from "lodash/debounce";
import pickBy from "lodash/pickBy";

import {
  useNavigate,
  useLocation,
  useSearchParams,
  useRoutes,
  useParams,
} from "react-router";

import queryReducer, {
  SET_FILTER,
  UPDATE_FILTER,
  SET_SELECTION,
  TOGGLE_GROUP,
  SET_PAGE,
  SET_PER_PAGE,
  SET_SORT,
  SET_SEARCH,
  SET_PAGE_INFO,
} from "./queryReducer";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { useIsMounted, useLazyRef } from "~/ui";
import { EMPTY_ARRAY, EMPTY_DEPS, EMPTY_OBJECT, EMPTY_RECORD } from "~/utils";
import { isEqual, noop, omit, pick } from "lodash";
import type { ListParams, ListModifiers, PageInfo } from "../types";
import { useRouter } from "~/hooks";
import { getRouteUrl, isListMode } from "./view-utils";

/**
 * Get the list parameters (page, sort, filters) and modifiers.
 *
 * These parameters are merged from 3 sources:
 *   - the query string from the URL
 *   - the params stored in the state (from previous navigation)
 *   - the options passed to the hook (including the filter defaultValues)
 *
 * @returns {Array} A tuple [parameters, modifiers].
 * Destructure as [
 *    { page, pageSize, sort, order, filter, filterValues, activeFilters, requestSignature },
 *    { setFilters, hideFilter, showFilter, setPage, setPageSize, setSort }
 * ]
 *
 * @example
 *
 * const [listParams, listParamsActions] = useListParams({
 *      resource: 'posts',
 *      location: location // From react-router. Injected to your component by react-admin inside a List
 *      defaults: {
 *          published: true
 *      },
 *      sort: {
 *          field: 'published_at',
 *          order: 'DESC'
 *      },
 *      pageSize: 25
 * });
 *
 * const {
 *      page,
 *      pageSize,
 *      sort,
 *      order,
 *      filter,
 *      filterValues,
 *      activeFilters,
 *      requestSignature
 * } = listParams;
 *
 * const {
 *      setFilters,
 *      hideFilter,
 *      showFilter,
 *      setPage,
 *      setPageSize,
 *      setSort,
 * } = listParamsActions;
 */
type Commit = {
  promise: Promise<any>;
  commit(val?: any): void;
  onCommit(): void;
};
function getSearchParams(params: any) {
  const inQuery = {
    ...pickBy(params ?? EMPTY_OBJECT, (v, k) => initialQueryKeys.includes(k)),
  };
  if ((params as any)?.filter) {
    inQuery.filter = JSON.stringify((params as any).filter);
  }
  const q = qs.stringify(inQuery);
  const qfl = q ? `?${qs.stringify(inQuery)}` : "";
  return qfl;
}

export const useListParams = (
  {
    resource,
    sort,
    pageSize = 10,
    debounce = 500,
    defaults,
    syncWithLocation = true,
  }: ListParamsOptions,
  enabled: boolean = true,
): [Parameters, ListModifiers] => {
  const location = useLocation();

  const locationRef = useRef(location);
  locationRef.current = location;

  const pathParams = useParams();

  const [searchParams, setSearchParams] = useSearchParams();
  const [localParams, setLocalParams] = useState(EMPTY_OBJECT);
  const [params, setParams] = useLocalStorage(resource, EMPTY_OBJECT);
  const tempParams = useRef<ListParams>(null);
  const isMounted = useIsMounted();
  const commitRef = useRef<Commit>(null);
  const initPathRef = useRef<string>(null);

  const [listMode, setListMode] = useState(() => {
    if (!syncWithLocation) return true;
    const { action, mode, id } = pathParams ?? EMPTY_OBJECT;
    return action && isListMode(mode, id);
  });

  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const activeParams = !syncWithLocation ? localParams : params;
  const finalParams = useMemo(() => {
    console.warn("finalParams: ", activeParams);
    return JSON.stringify(activeParams);
  }, [activeParams]);

  const signature = [
    resource,
    !syncWithLocation || !enabled ? null : location.search,
    !syncWithLocation ? finalParams : null,
    enabled,
  ];

  const [query, setQuery] = useState(() => {
    const queryFromLocation =
      syncWithLocation && listMode
        ? parseQueryFromLocation(location)
        : EMPTY_OBJECT;
    const query = getQuery({
      queryFromLocation,
      params: !syncWithLocation ? localParams : params,
      defaults,
      sort,
      pageSize,
    });
    query.ready = false;
    return query;
  });

  const synced = useLazyRef<{
    qfl: string 
    qfp: string | null,
    query: typeof query
  }>(() => {
    let qfl = location.search;
    //const qfp = '';
    return {
      qfl,
      qfp: null,
      query,
    };
  });
  synced.current.query = query;

  useEffect(() => {
    let listMode = enabled && syncWithLocation;
    if (listMode) {
      const { action, mode, id } = pathParams ?? EMPTY_OBJECT;
      listMode = !!action && isListMode(mode, id);
    }
    setListMode(listMode);
  }, [enabled && syncWithLocation, pathParams]);

  useEffect(() => {
    if (!listMode) {
      return;
    }
    
    if (!initPathRef.current) {
      initPathRef.current = location.pathname;
      synced.current.qfl = location.search;
    }
    
    if (initPathRef.current !== location.pathname) {
      return;
    }

    const force = !synced.current.qfl && !synced.current.qfp;
    synced.current.qfp = finalParams;
    const qfl = getSearchParams(params);
    if (force || qfl !== synced.current.qfl) {
      // the useEffect above will apply the changes to the params in the store
      setSearchParams(qfl, { replace: true });
    } else {
      setQuery((query) => {
        if (query.ready) return query;
        return { ...query, ready: true } as any;
      });
    }
  }, [finalParams, listMode]);
  // if the location includes params (for example from a link like
  // the categories products on the demo), we need to persist them in the
  // store as well so that we don't lose them after a redirection back
  // to the list
  useEffect(() => {
    if (!listMode) {
      console.warn("FilterTabsBar: is not List mode");
      return;
    }
    if (isMounted.current) {

      if(!synced.current.qfp){
        return
      }

      if (initPathRef.current !== location.pathname) {
        console.warn(
          "FilterTabsBar: location change from:",
          initPathRef.current,
          ", to:",
          location.pathname,
        );
        return;
      }
      
      const search = searchParams?.size ? `?${searchParams.toString()}` : "";
      if (synced.current.qfl !== search) {
        const prevSearch = synced.current.qfl;
        synced.current.qfl = search;
        const queryFromLocation = parseQueryFromLocation({ search });
        const newParams =
          Object.keys(queryFromLocation).length > 0 ? queryFromLocation : null;
        setQuery((query) => {
          const filter = isEqual(query.filter, newParams?.filter) ? query.filter : newParams?.filter;
          const newQuery = omit(query, ...validQueryParams);
          return { ...newQuery, ...newParams, filter, ready: true } as any;
        });
        console.log(
          "FilterTabsBar: newParams:",
          newParams,
          ", prevSearch:", prevSearch,
          ", search:",
          search,
        );

        const qfp = JSON.stringify(newParams);

        if (qfp !== synced.current.qfp) {
          synced.current.qfp = qfp;
          setParams(newParams);
        }
      } else {
        console.log(
          "FilterTabsBar: no search change:",
          search,
          ", searchParams:",
          searchParams?.toString(),
        );
        setQuery((query) => {
          if (query.ready) return query;
          return { ...query, ready: true } as any;
        });
      }
    }
  }, [searchParams, listMode]);

  // eslint-disable-line

  const changeParams = useCallback((action: any) => {
    // do not change params if the component is already unmounted
    // this is necessary because changeParams can be debounced, and therefore
    // executed after the component is unmounted

    if (!isMounted.current) {
      console.log("useListParams FilterTabsBar:: changeParams:: not  mounted");
      return commitRef.current?.promise;
    }
    //console.log("useListParams:: changeParams:: ", action);
    if (!tempParams.current) {
      // no other changeParams action dispatched this tick
      tempParams.current = queryReducer(synced.current.query, action);

      //console.error("FilterTabsBar:: set filter", tempParams.current?.filter)

      // schedule side effects for next tick
      setTimeout(() => {
        if (!syncWithLocation) {
          setLocalParams(tempParams.current!);
        } else {
          const inQuery = {
            ...pickBy(tempParams.current, (v, k) =>
              initialQueryKeys.includes(k),
            ),
          };
          if (tempParams.current?.filter) {
            inQuery.filter = JSON.stringify(tempParams.current.filter);
          }
          // the useEffect above will apply the changes to the params in the store
          setSearchParams(`?${qs.stringify(inQuery)}`, { replace: true });
        }
        (tempParams.current as any) = undefined;
      }, 0);
    } else {
      // side effects already scheduled, just change the params
      tempParams.current = queryReducer(tempParams.current, action);
    }
    return commitRef.current?.promise;
  }, EMPTY_DEPS); // eslint-disable-line react-hooks/exhaustive-deps

  const modifiers = useMemo(() => {
    //console.log("FilterTabsBar: change modifiers")
    let promoId = 0;
    (commitRef.current as any) = {};

    function doCommit() {
      promoId++;
      let resolveFn: any;
      const promise = new Promise((resolve) => {
        resolveFn = resolve;
        (resolveFn as any).promoId = promoId;
        (commitRef.current as any).resolveFn = resolveFn;
      });
      (promise as any).resolveFn = resolveFn;
      (promise as any).promoId = promoId;
      commitRef.current = {
        promise,
        resolveFn,
        commit: (val?: any) => {
          const resolve = (commitRef.current as any).resolveFn;
          resolveFn = null;
          console.log(
            "FilterTabsBar: commit:",
            val,
            ", promoId:",
            (resolve as any)?.promoId,
          );
          if (typeof resolve === "function") {
            resolve(val);
          }

          doCommit();
        },
      } as any;
    }

    doCommit();

    return {
      commit: commitRef.current?.commit,
      setSort: (sort?: string | null) =>
        changeParams({
          type: SET_SORT,
          payload: sort,
        }),
      setPage: (newPage: number) =>
        changeParams({ type: SET_PAGE, payload: newPage }),
      setPageSize: (newPageSize: number) =>
        changeParams({ type: SET_PER_PAGE, payload: newPageSize }),
      setPageInfo: (info: PageInfo) =>
        changeParams({ type: SET_PAGE_INFO, payload: info }),

      setSelectedIds: (selectedId: any) =>
        changeParams({
          type: SET_SELECTION,
          payload: selectedId,
        }),
      toggleGroup: (name: string) =>
        changeParams({
          type: TOGGLE_GROUP,
          payload: name,
        }),
      setSearch: (search?: string | null) =>
        changeParams({
          type: SET_SEARCH,
          payload: search,
        }),
      setFilters: (filter: any) =>
        changeParams({
          type: SET_FILTER,
          payload: filter,
        }),
      updateFilters: (filter: any, delay?: boolean) =>
        delay
          ? lodashDebounce(
              async (filter) =>
                await changeParams({
                  type: UPDATE_FILTER,
                  payload: filter,
                }),
              debounce,
            )(filter)
          : changeParams({
              type: UPDATE_FILTER,
              payload: filter,
            }),
    };
  }, [changeParams]);

  useEffect(() => {
    return () => {
      console.log("FilterTabsBar: clear commit");
      if (commitRef.current) {
        commitRef.current.onCommit = noop;
        commitRef.current.commit?.(false);
      }
    };
  }, EMPTY_DEPS);

  const resultQuery = useMemo(
    () => [query, modifiers] as unknown as [Parameters, ListModifiers],
    [query, modifiers, query.selectedIds, query.openedGroups, query.search],
  );

  return resultQuery;
};

export const initialQueryKeys = [
  "page",
  "pageSize", //pageSize
  "sort",
];

export const validQueryParams = [
  "page",
  "pageSize", //pageSize
  "sort",
  "filter",
];

// @ts-expect-error TS(7006): Parameter 'query' implicitly has an 'any' type.
const parseObject = (query, field) => {
  if (query[field] && typeof query[field] === "string") {
    try {
      query[field] = JSON.parse(query[field]);
    } catch (err) {
      delete query[field];
    }
  }
};

// @ts-expect-error TS(7031): Binding element 'search' implicitly has an 'any' t... Remove this comment to see the full error message
export const parseQueryFromLocation = ({ search }): Partial<ListParams> => {
  const query = pickBy(qs.parse(search), (_v, k) =>
    validQueryParams.includes(k),
  );
  parseObject(query, "filter");
  //parseObject(query, 'activeFilters');
  return query;
};

/**
 * Check if user has already set custom sort, page, or filters for this list
 *
 * User params come from the store as the params props. By default,
 * this object is:
 *
 * { filter: {}, order: null, page: 1, pageSize: null, sort: null }
 *
 * To check if the user has custom params, we must compare the params
 * to these initial values.
 *
 * @param {Object} params
 */
export const hasCustomParams = (params: ListParams) => {
  return (
    params &&
    params.filter &&
    (Object.keys(params.filter).length > 0 ||
      params.page !== 1 ||
      params.pageSize != null ||
      params.sort != null)
  );
};

/**
 * Merge list params from 3 different sources:
 *   - the query string
 *   - the params stored in the state (from previous navigation)
 *   - the props passed to the List component (including the filter defaultValues)
 */
export const getQuery = ({
  // @ts-expect-error TS(7031): Binding element 'queryFromLocation' implicitly has... Remove this comment to see the full error message
  queryFromLocation,
  // @ts-expect-error TS(7031): Binding element 'params' implicitly has an 'any' t... Remove this comment to see the full error message
  params,
  // @ts-expect-error TS(7031): Binding element 'defaults' implicitly h... Remove this comment to see the full error message
  defaults,
  // @ts-expect-error TS(7031): Binding element 'sort' implicitly has an 'any' typ... Remove this comment to see the full error message
  sort,
  // @ts-expect-error TS(7031): Binding element 'pageSize' implicitly has an 'any' ... Remove this comment to see the full error message
  pageSize,
}) => {
  const query: Partial<ListParams> =
    Object.keys(queryFromLocation).length > 0
      ? mergeSearchQuery(queryFromLocation, params)
      : hasCustomParams(params)
        ? { ...params }
        : { filter: defaults };

  if (!query.sort && sort) {
    query.sort = sort;
  }

  return {
    ...query,
    page: getNumberOrDefault(query.page, 1),
    pageSize: getNumberOrDefault(query.pageSize, pageSize || 10),
  } as ListParams;
};

// @ts-expect-error TS(7006): Parameter 'query' implicitly has an 'any' type.
const mergeSearchQuery = (query, params) => {
  if (!query.pageSize && !!params?.pageSize) {
    query.pageSize = params.pageSize;
  }
  if (!query.sort && !!params?.sort) {
    query.sort = params.sort;
  }
  return query;
};

export const getNumberOrDefault = (
  possibleNumber: string | number | undefined,
  defaultValue: number,
) => {
  const parsedNumber =
    typeof possibleNumber === "string"
      ? parseInt(possibleNumber, 10)
      : possibleNumber;

  // @ts-expect-error TS(2345): Argument of type 'number | undefined' is not assig... Remove this comment to see the full error message
  return isNaN(parsedNumber) ? defaultValue : parsedNumber;
};

export interface ListParamsOptions {
  resource: string;
  pageSize?: number;
  sort?: string;
  debounce?: number;
  defaults?: object;
  /*
  selectedIds?: Identifier[];
  openedGroups?: string[];
  defaults?: object;
  search?: string;*/
  // Whether to disable the synchronization of the list parameters with
  // the current location (URL search parameters)
  syncWithLocation?: boolean;
}

interface Parameters extends ListParams {
  signature: any[];
}

