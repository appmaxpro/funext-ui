import {
  BottomNavigation,
  BottomNavigationAction,
  useRtl,
  type BottomNavigationProps,
} from "@funext/ui";
import { useMemo, useCallback } from "react";
import { getItemPath, isPageRoute } from "~/utils/navigation";
import type { Navigation, NavRoute, OutletRoute } from "~/utils/types";
import { isLeftClickEvent, isModifiedEvent, useLink } from "./link";
import React from "react";
import { useNavContext } from "~/context";
import { useRouter } from "~/hooks/use-router";
import { useActivePageRoute } from "~/hooks";


const _tabMoveToLeft = {
  out: 'pt-page-moveToLeft',
	in: 'pt-page-moveFromRight'
} as const;

const _tabMoveToRight = {
  out: 'pt-page-moveToRight',
	in: 'pt-page-moveFromLeft'
} as const;

export function AppBottomNavigation(props: Partial<BottomNavigationProps>) {
  const rootNavigation = useNavContext();
  const route = useActivePageRoute()!;
  let router = useRouter();
  let rtl = useRtl()

  const parentNav = useMemo(
    () =>
      route.parent?.type === "bottomNav" ||
      route.parent?.actions?.includes("bottomNav")
        ? route.parent
        : route.type === "bottomNav" || route.actions?.includes("bottomNav")
          ? route
          : null,
    [route],
  );

  const tabs = useMemo(() => {
    if (parentNav) {
      const routes = parentNav.children?.filter(
        (a) =>
          isPageRoute(a) && (a.type === "tab" || a.actions?.includes("tab")),
      ) as NavRoute[];

      return routes;
    }
    return [];
  }, [parentNav]);

  const onChange = (event: React.SyntheticEvent, value: OutletRoute): void => {
      
      if (route === value) {
        event.preventDefault();
        return;
      }

      if (event.isDefaultPrevented()) {
        return;
      }

      if (isModifiedEvent(event as any) || !isLeftClickEvent(event as any)) {
        return;
      }

      // If target prop is set (e.g. to "_blank") let browser handle link.

      event.preventDefault();

      const href = getItemPath(rootNavigation!, value);

      const isBackward = tabs.indexOf(value) > tabs.indexOf(route)
      
      router.navigate(href, { 
        replace: true, 
        state: {
          saveCache: true,
          animation:  isBackward ?  _tabMoveToLeft : _tabMoveToRight
        } /*, viewTransition: true*/ 
      });
      //navigateUrl({path: href, replace, state})
    }

  if (parentNav) {
    const items = parentNav.children as NavRoute[];
    const value = route === parentNav ? items[0] : route;
    return (
      <BottomNavigation showLabels {...props} value={value} onChange={onChange}>
        {items
          ?.filter(
            (a) =>
              isPageRoute(a) &&
              (a.type === "tab" || a.actions?.includes("tab")),
          )
          .map((item, index) => (
            <BottomNavigationAction
              key={index}
              icon={item.icon}
              label={item.title}
              //selected={navItem === item}
              value={item}
            />
          ))}
      </BottomNavigation>
    );

    return null;
  }
}


export const MemoAppBottomNavigation = React.memo(AppBottomNavigation)