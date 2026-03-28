import {
  Box,
  Flex,
  type ButtonBaseProps,
} from "@funext/ui";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  generatePath,
  ScrollRestoration,
  useParams,
} from "react-router";
import { useNavContext } from "~/context";
import { useActivePageRoute } from "~/hooks";
import { RouteTabView } from "~/routes/route-tab-view";
import { TabsContext, useTabsContext } from "~/routes/types";
import { getItemPath, isPageRoute } from "~/utils/navigation";
import type { NavRoute } from "~/utils/types";
import Tabs from "../../../components/shared/tabs";

function useViewTabRoute() {
  const outletRoute = useActivePageRoute() || {};
  const outletRouteRef = useRef<NavRoute>();
  useEffect(()=>{
    if(outletRoute) {
      let rootTabs:NavRoute = outletRoute;
      while (rootTabs.type !== 'tabs' && rootTabs.parent) 
        rootTabs = rootTabs.parent
      

      if (!rootTabs) {
          return
      }

      if (outletRouteRef.current && rootTabs !== outletRouteRef.current){
          let parent = rootTabs.parent;
          while(parent) {
            if(parent === outletRouteRef.current) {
              return
            }
            parent = parent.parent;
          }
      }

      outletRouteRef.current = outletRoute;
    }
  }, [outletRoute])

  return outletRouteRef.current
}


export function RouteTabs() {
  const navRoute = useViewTabRoute();

  if (!navRoute) {
    return 'RouteTabs(<Null/>)';
  }      

  return (
    <NavRouteTabs nav={navRoute}/> 
  );
}

export function NavRouteTabs({nav}:{nav:NavRoute}) {
  const params = useParams();
  const parentNode = useTabsContext();
  
  const navigation = useMemo(() => {
    if (nav) {
      const routes = nav.children?.filter(
        (a) =>
          isPageRoute(a) && (a.type === "tab" || a.actions?.includes("tab")),
      ) as NavRoute[];

      return routes;
    }
    return [];
  }, [nav]);

  const node = useMemo(() => ({nav, parent: parentNode}), [nav, parentNode])

  return (
    <TabsContext.Provider value={node}>
      <NavigationDataViewTabs navigation={navigation} params={params} />
    </TabsContext.Provider>
   )

}

interface TabProps extends ButtonBaseProps {
  children: React.ReactNode;
}

export function NavigationDataViewTabs({
  navigation,
  params,
}: {
  navigation: NavRoute[];
  params?: any;
}) {
  const activePage = useActivePageRoute() || {};
  const [activeTab, setActiveTab] = useState<number>(0);
  const rootNavigation = useNavContext();

  const [routes, tabs] = useMemo(() => {
    const routes = navigation;

    if (routes && routes.length) {
      let parent = routes[0].parent ? routes[0].parent : routes[0];
      //while(parent.parent) parent = parent.parent;
      const parents = parent ? [parent] : routes;

      const toPath = (item: NavRoute) => {
        let path = getItemPath(rootNavigation, item);
        return generatePath(path, params);
      };

      console.log(
        "NavigationDataViewTabs::",
        routes.map((item) => `${item.path} -> ${getItemPath(parents, item)}`),
      );

      return [
        routes,
        routes
          .map((item) => ({
            children: item.title,
            id: toPath(item),
          }))
          //.map((item) => ({ ...item, href: item.id })),
      ];
    }
    return [];
  }, [navigation]) as [NavRoute[], TabProps[]];

  useEffect(() => {
    if (activePage && navigation.includes(activePage)) {
      setActiveTab(navigation.indexOf(activePage));
    }
  }, [activePage]);

  const onTabClick = useCallback((e: React.BaseSyntheticEvent<object, any, any>, index: number) => {
    e.preventDefault()
    history.replaceState({}, '', tabs[index].id);
    setActiveTab(index);
  }, [])

  return (
    <Box width="100%">
      <Flex direction="column">
        <div id="__view_title__"></div>
        <ScrollRestoration />
        <Tabs
          activeTab={activeTab}
          tabs={tabs}
          onTabClick={onTabClick}
        />
        {routes?.map((route, index) => (
          <Box
            className={activeTab === index ? "contents" : "hidden"}
            key={index}
            onClick={()=> {}}
          >
            <RouteTabView route={route} inTabs/>
          </Box>
        ))}
        
      </Flex>
    </Box>
  );
}
