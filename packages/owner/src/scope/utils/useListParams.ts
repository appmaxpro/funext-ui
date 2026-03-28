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
import { useIsMounted } from "@funext/ui";
import { EMPTY_ARRAY, EMPTY_RECORD } from "~/utils";
import { pick } from "lodash";
import type { ListParams, ListModifiers, PageInfo } from "../types";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [localParams, setLocalParams] = useState(defaultParams);
  const [params, setParams] = useLocalStorage(resource, defaultParams);
  const tempParams = useRef<ListParams>();
  const isMounted = useIsMounted();
  const toStringParams = !syncWithLocation ? localParams : params
  const finalParams = useMemo(
    () => {
      console.warn("finalParams: ", toStringParams)
      return JSON.stringify(toStringParams)
    },
    [toStringParams],
  );

  const signature = [
    resource,
    (!syncWithLocation || !enabled) ? null : location.search,
    finalParams,
    enabled,
  ];

  const queryFromLocation = useMemo(
    () =>
      !syncWithLocation || !enabled
        ? EMPTY_RECORD
        : parseQueryFromLocation(location),
    [!syncWithLocation || !enabled , location.search],
  );

  const query = useMemo(
    () =>
      enabled
        ? getQuery({
            queryFromLocation,
            params: !syncWithLocation ? localParams : params,
            defaults,
            sort,
            pageSize,
          })
        : {
          openedGroups: EMPTY_ARRAY,
          page: 0,
          pageSize,
          total: 0,
          offset: 0,
          pages: 0
        } as ListParams,
    signature, // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (syncWithLocation && enabled) {
      const inQuery = {
        ...pickBy(query, (v, k) => initialQueryKeys.includes(k)),
      };
      if (query.filter) {
        inQuery.filter = JSON.stringify(query.filter);
      }
      setSearchParams(`?${qs.stringify(inQuery)}`, {replace: true});
    }
  }, [enabled]); // eslint-disable-line

  // if the location includes params (for example from a link like
  // the categories products on the demo), we need to persist them in the
  // store as well so that we don't lose them after a redirection back
  // to the list
  useEffect(() => {
    if (enabled) {
      setParams( Object.keys(queryFromLocation).length > 0 ? query : null);
    }
  }, [location.search, enabled]); // eslint-disable-line

  const changeParams = useCallback((action: any) => {
    // do not change params if the component is already unmounted
    // this is necessary because changeParams can be debounced, and therefore
    // executed after the component is unmounted
    if (!isMounted.current) {
      console.log("useListParams:: changeParams:: not  mounted")
      return;
    }
    console.log("useListParams:: changeParams:: ", action)
    if (!tempParams.current) {
      // no other changeParams action dispatched this tick
      tempParams.current = queryReducer(query, action);

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
          setSearchParams(`?${qs.stringify(inQuery)}`);
        }
        tempParams.current = undefined;
      }, 0);
    } else {
      // side effects already scheduled, just change the params
      tempParams.current = queryReducer(tempParams.current, action);
    }
  }, EMPTY_ARRAY); // eslint-disable-line react-hooks/exhaustive-deps

  const modifiers = useMemo(() => {
    return {
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
              (filter) =>
                changeParams({
                  type: UPDATE_FILTER,
                  payload: filter,
                }),
              debounce,
            )
          : changeParams({
              type: UPDATE_FILTER,
              payload: filter,
            }),
    };
  }, [changeParams]);

  const resultQuery = useMemo(
    () =>
      [
        {
          ...(query as ListParams),
          signature,
        },
        modifiers,
      ] as unknown as [Parameters, ListModifiers],
    [
      ...signature,
      modifiers,
      query.selectedIds,
      query.openedGroups,
      query.search,
    ],
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
  const query = pickBy(qs.parse(search), (v, k) =>
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

const emptyObject: any = {};
const defaultParams = {};
