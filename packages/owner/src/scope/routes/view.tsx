import { useEffect, useMemo, useRef, useState } from "react";
import { useTabs } from "./use-tabs";
import { TaskQueue } from "~/utils/queue";
import { useRouter, generatePath } from "~/hooks/use-router";
import { EMPTY_OBJECT, omit } from "~/utils";
import { getRouteParams } from "../utils/view-utils";
import { useLazyRef } from "@funext/ui";

const getURL = (
  action: string | null = null,
  mode: string | null = null,
  id: string | null = null,
) => {
  if (!action || action.startsWith("$")) return null;
  const params = getRouteParams(action, mode, id);
  if (!params) return undefined;
  const url = Object.keys(params).reduce(
    (prev, key) => `${prev}/:${key}`,
    "/res",
  );
  return generatePath(url, params);
};

const queue = new TaskQueue();

export function View() {
  const router = useRouter();
  //const tabs = useTabs();
  const { active, open: openTab, items, close: closeTap } = useTabs();

  const [tabState, setTabState] = useState(active?.state);

  const tabParamsRef = useRef<{
    action?: string;
    mode?: string;
    id?: any;
    path?: string | null;
    replace?: boolean;
  }>();

  const routerParamsRef = useLazyRef<{
    action?: string;
    mode?: string;
    id?: any;
    path?: string | null;
    binding?: boolean;
  }|undefined>(() => ({binding: true}));

  const homeAction = ""; //session.info?.user?.action;
  
  useEffect(() => {
    if(!active && routerParamsRef.current && !routerParamsRef.current.binding) {
        routerParamsRef.current = undefined;
        tabParamsRef.current = undefined;
        router?.navigate('/', {replace: true});
    }
  }, [active]);

  const tabParams = useMemo(() => {
    //console.log("View: route tabParams:", tabState?.routes?.[tabState.type]);
    const prevParams = tabParamsRef.current ?? EMPTY_OBJECT;
    const route = tabState?.routes?.[tabState.type] 
    const { action, mode, id, replace } = route ?? EMPTY_OBJECT;
    if (
      prevParams.action !== action ||
      prevParams.mode !== mode ||
      prevParams.id !== id
    ) {
      const tabPath = getURL(action, mode, id);
      console.log("View: tabParams: path:", tabPath);
      if (prevParams.path !== tabPath) {
        tabParamsRef.current = { action, mode, id, path: tabPath, replace };
        if(replace) {
           delete route?.replace
        }
      }
    }
    return tabParamsRef.current;
  }, [tabState]);

  const routerParams = useMemo(() => {
    if (!router) {
      console.warn("View: Router is null");
      return routerParamsRef.current;
    }

    if (!router.location.pathname?.startsWith("/res/")) {
      routerParamsRef.current = undefined;
      return routerParamsRef.current;
    }

    const {
      action = homeAction,
      id,
      mode,
    } = (router.params ?? EMPTY_OBJECT) as any;

    const prevParams = routerParamsRef.current ?? EMPTY_OBJECT;
    if (
      prevParams.action !== action ||
      prevParams.mode !== mode ||
      prevParams.id !== id
    ) {
      const path = getURL(action, mode, id);
      console.log("View: routerParams: path:", path);

      if (prevParams.path !== path) {
        routerParamsRef.current = path ? { action, mode, id, path, binding: true } : undefined;
      }
    }
    return routerParamsRef.current;
  }, [router?.params]);

  useEffect(() => {
    return active?.subscribe(setTabState);
  }, [active, setTabState]);

  useEffect(() => {
    const tabParams = tabParamsRef.current;
    const route = router.route;
    if (
      route &&
      routerParams?.path &&
      routerParams.action &&
      tabParams?.path !== routerParams.path
    ) {
      console.log("View: open router path:", routerParams.path);
      const props = route.props;
      const custom = props?.custom ? route : undefined;
      const params = props?.params;

      const { action, id, mode } = routerParams as any;
      let rParams = getRouteParams(action, mode, id);
      const extra =
        rParams?.mode === "edit" || rParams?.mode === "new" || rParams?.id
          ? { type: "form"}
          : { type: rParams?.mode ?? "list" };
      queue.add( () =>
         routerParamsRef.current ? openTab(action, {
            route: omit(rParams!, ["action"]),
            tab: true,
            force: true,
            ...extra,
            ...(custom && { custom }),
            ...(params && { params }),
          })
          : Promise.resolve(null)
      );
      
      const tParams = routerParams!;
      async function wait() {
        await queue.wait();
        tParams.binding = false;
      }
      wait()
      
    }
  }, [routerParams]);

  useEffect(() => {
    const routerParams = routerParamsRef.current;
    if (
      tabParams?.path &&
      routerParams?.action &&
      tabParams.path !== routerParams.path
    ) {
      console.log("View: redirect the router to tapPath:", tabParams.path);
      router.navigate(tabParams.path, {replace: tabParams.replace});
      delete tabParams.replace;
    } 
  }, [tabParams]);


  



  return null;
}
