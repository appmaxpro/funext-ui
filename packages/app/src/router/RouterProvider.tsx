import {fromPairs, partition, toPairs} from 'lodash'
import {type ReactNode, useCallback, useMemo} from 'react'
import {RouterContext} from './context'

import {STICKY_PARAMS} from './stickyParams'
import {
  type IntentParameters,
  type NavigateOptions,
  type Router,
  type RouterContextValue,
  type RouterState,
  type SearchParam,
} from './types'

/**
 * The props for the {@link RouterProvider} component.
 *
 * @public
 */
export interface RouterProviderProps {
  /**
   * A function that is called when the user navigates to a new path.
   * Takes an object containing the path to navigate to and an optional `replace` flag.
   */
  onNavigate: (opts: {path: string; replace?: boolean, state?: object}) => void
  /**
   * The router object that is used to handle navigation. See {@link Router}
   */
  router: Router
  /**
   * The current state of the router. See {@link RouterState}
   */
  routerState: RouterState;

  state?: any;
  /**
   * The child elements to render.
   */
  children: ReactNode
}

/**
 * @example
 * ```tsx
 * import {
 *   NavigateOptions,
 *   route,
 *   RouterProvider,
 *   RouterState
 * } from 'sanity'
 * import {useCallback, useMemo} from 'react'
 *
 * function Root() {
 *   const [router] = useState(() => route.create('/'))
 *
 *   const [state, setState] = useState<RouterState>({})
 *
 *   const handleNavigate = useCallback((
 *     path: string,
 *     options?: NavigateOptions
 *   ) => {
 *     console.log('navigate', path, options)
 *
 *     setState(router.decode(path))
 *   }, [router])
 *
 *   return (
 *     <RouterProvider
 *       onNavigate={handleNavigate}
 *       router={router}
 *       state={state}
 *     >
 *       <div>This is a routed application</div>
 *     </RouterProvider>
 *   )
 * }
 * ```
 *
 * @param props - The component props.
 *  {@link RouterProviderProps}
 *
 * @public
 */
export function RouterProvider(props: RouterProviderProps): React.JSX.Element {
  const {onNavigate, router: routerProp, routerState, state: locationState} = props

  const resolveIntentLink = useCallback(
    (intentName: string, parameters?: IntentParameters, _searchParams?: SearchParam[]): string => {
      const [params, payload] = Array.isArray(parameters) ? parameters : [parameters]
      return routerProp.encode({
        intent: intentName,
        params,
        payload,
        _searchParams: toPairs({
          ...fromPairs((routerState._searchParams ?? []).filter(([key]) => STICKY_PARAMS.includes(key))),
          ...fromPairs(_searchParams ?? []),
        }),
      })
    },
    [routerProp, routerState._searchParams],
  )

  const resolvePathFromState = useCallback(
    (nextState: RouterState): string => {
      const currentStateParams = routerState._searchParams || []
      const nextStateParams = nextState._searchParams || []
      const nextParams = STICKY_PARAMS.reduce((acc, param) => {
        return replaceStickyParam(
          acc,
          param,
          findParam(nextStateParams, param) ?? findParam(currentStateParams, param),
        )
      }, nextStateParams || [])

      return routerProp.encode({
        ...nextState,
        _searchParams: nextParams,
      })
    },
    [routerProp, routerState],
  )

  const handleNavigateStickyParams = useCallback(
    (params: Record<string, string | undefined>, options: NavigateOptions = {}) => {
      const hasInvalidParam = Object.keys(params).some((param) => !STICKY_PARAMS.includes(param))
      if (hasInvalidParam) {
        throw new Error('One or more parameters are not sticky')
      }

      const allNextSearchParams = [...(routerState._searchParams || []), ...Object.entries(params)]

      const searchParams = Object.entries(
        allNextSearchParams.reduce<SearchParam>(
          (deduppedSearchParams, [key, value]) => ({
            ...deduppedSearchParams,
            [key]: value,
          }),
          [] as unknown as SearchParam,
        ),
      )

      // Trigger the navigation with updated _searchParams
      onNavigate({
        path: resolvePathFromState({
          ...routerState,
          _searchParams: searchParams,
        }),
        ...options,
      })
    },
    [onNavigate, resolvePathFromState, routerState],
  )

  const navigate = useCallback(
    (nextState: Record<string, unknown>, options: NavigateOptions = {}) => {

      onNavigate({path: resolvePathFromState(nextState), ...options})
    },
    [onNavigate, resolvePathFromState],
  )

  const navigateIntent = useCallback(
    (intentName: string, params?: IntentParameters, options: NavigateOptions = {}) => {
      onNavigate({path: resolveIntentLink(intentName, params), ...options})
    },
    [onNavigate, resolveIntentLink],
  )

  const [newRouterState, stickyParams] = useMemo(() => {
    if (!routerState._searchParams) {
      return [routerState, null]
    }
    const {_searchParams, ...rest} = routerState
    const [sticky, restParams] = partition(_searchParams, ([key]) => STICKY_PARAMS.includes(key))
    if (sticky.length === 0) {
      return [routerState, null]
    }
    return [{...rest, _searchParams: restParams}, sticky]
  }, [routerState])

  const stickyParamsByName = useMemo(() => Object.fromEntries(stickyParams || []), [stickyParams])

  const router: RouterContextValue = useMemo(
    () => ({
      navigate,
      navigateIntent,
      navigateStickyParams: handleNavigateStickyParams,
      navigateUrl: onNavigate,
      resolveIntentLink,
      resolvePathFromState,
      routerState: newRouterState,
      stickyParams: stickyParamsByName,
      locationState
    }),
    [
      handleNavigateStickyParams,
      navigate,
      navigateIntent,
      onNavigate,
      resolveIntentLink,
      resolvePathFromState,
      newRouterState,
      stickyParamsByName,
    ],
  )

  return <RouterContext.Provider value={router}>{props.children}</RouterContext.Provider>
}

function replaceStickyParam(
  current: SearchParam[],
  param: string,
  value: string | undefined,
): SearchParam[] {
  const filtered = current.filter(([key]) => key !== param)
  return value === undefined || value == '' ? filtered : [...filtered, [param, value]]
}

function findParam(searchParams: SearchParam[], key: string): string | undefined {
  const entry = searchParams.find(([k]) => k === key)
  return entry ? entry[1] : undefined
}
