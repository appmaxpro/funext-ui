import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Outlet, useNavigation, useParams } from "react-router";
import { DataViews } from "~/scope/views/data/data-views";
import { Layout } from "~/components/layout/layout";
import { Cache } from "~/utils/cache";
import * as PAGES from "../pages";
import { HttpWatch } from "~/components/http-watch";
import RouteView, {getNullView} from "./route-view";
import { Box, Presence, useRefs } from "@funext/ui";
import type { OutletRoute } from "~/utils/types";
import { getItemPath } from "~/utils/navigation";
import { useNavContext } from "~/context";
import { Toolbar } from "~/components/shared/toolbar";
import { useRouter } from "~/hooks/use-router";
import { useActivePageRoute } from "~/hooks";
//import { useIsAnimating } from "@funext/ui/lib/presence/presence";


function ViewRef({
  className,
  style,
  ref,
  children,
  present,
  outView,
  ...res
}: {
  className?: string;
  style?: any;
  ref?: any;
  children: any;
  present: boolean;
  outView?: React.ReactNode;
}) {
  if (!present) return null;

  const myNode = (
    <div
      className={`transform-3d
 backface-hidden p-4 absolute min-w-0 flex flex-col inset-0 ${!present ? "invisible" : ""} ${className}`}
      {...res}
      ref={ref}
    >
      <Toolbar />
      {children}
    </div>
  );

  if (outView) {
    return (
      <div
        className="absolute p-4 inset-0 transform-3d"
        style={{ perspective: "inherit" }}
      >
        {outView}
        {myNode}
      </div>
    );
  }
  return myNode;
}

function ViewAnimate({
  animate = true,
  show,
  Comp,
  className,
  style,
  props,
  viewIndex,
  outView,
}: {
  animate?: boolean;
  className?: string;
  style?: any;
  show: boolean;
  Comp: React.ComponentType;
  props: any;
  viewIndex: number;
  outView?: React.ReactNode;
}) {
  if (!animate) {
    return (
      <div className={className}>
        {props.model ? <DataViews Comp={Comp} {...props} /> : <Comp {...props} />}
      </div>
    );
  }

  return (
    <Presence animate={true} present={show}>
      {({ present, animating }) => {
        const children = props.model ? (
          <DataViews Comp={Comp} {...props} />
        ) : (
          <Comp {...props} />
        );

        return (
          <ViewRef
            className={className}
            present={present}
            style={style}
            data-view-index={`${viewIndex}`}
            outView={outView}
          >
            {children}
          </ViewRef>
        );
      }}
    </Presence>
  );
}

const defaultAnimation = {
  in: "pt-page-rotateRoomBottomIn",
  out: "pt-page-rotateRoomBottomOut z-1",
} as const;

function isParentOf(child: OutletRoute, parent?: OutletRoute) {
  if (!parent) return false;

  let root = child;
  while (root !== parent && root.parent) {
    root = root.parent;
  }
  return root === parent;
}

function useViewOutletRoute() {
  const outletRoute = useActivePageRoute() || {};
  const outletRouteRef = useRef<OutletRoute>();
  useEffect(()=>{
    if(outletRoute && !outletRoute.isolate)
      outletRouteRef.current = outletRoute;
  }, [outletRoute])

  return outletRouteRef.current
}

export const ProtectedRoute = React.memo(
  function () {
    const {route: outletRoute, params} = useRouter()
    const navigation = useNavContext();
    const viewPropsRef = useRef<any>();
    const currentView = useRef<any>();
    const viewIndexRef = useRef<number>(0);
    const prevOutletRouteRef = useRef<{ nav: OutletRoute; state: any }>();

    const [children, setChildren] = useState<any>(null);

    //const { state, formData } = useNavigation();
    //console.log("Navigation state:", history.state);
    const cache = useMemo(
      () =>
        new Cache<ReactNode>({
          maxCount: 20,
          evictEvery: 600 * 3,
        }),
      [],
    );
    //useEffect(startRouter, []);

    const viewProps = React.useMemo(() => {
      if (!outletRoute) {
        return viewPropsRef.current;
      }

      const props: any = ((typeof outletRoute?.props === "function"
        ? outletRoute.props(params)
        : outletRoute?.props) || {}) as any;

      const uState = history.state?.usr;

      const {
        layoutProps,
        enableLayout = true,
        animate = true,
        animation = uState?.animation ?? defaultAnimation,
        ...rems
      } = props as any;

      viewPropsRef.current = {
        layoutProps,
        enableLayout,
        animate,
        animation,
        rest: rems,
      }

      return viewPropsRef.current;
    }, [outletRoute]);

    useEffect(() => {
      if (!outletRoute) {
        return;
      }

      viewIndexRef.current++;

      const { animate, animation, rest } = viewProps;

      const { nav: prevNav, state: prevState } = prevOutletRouteRef.current ?? {};

      if (currentView.current) {
        const prevView = currentView.current;

        if (isParentOf(outletRoute!, prevNav) || prevState?.saveCache) {
          cache.put(getItemPath(navigation, prevNav!), prevView);
        }
        if (animate) {
          currentView.current = React.cloneElement(prevView, {
            show: true,
            className: animation.out,
            animate,
            outView: null,
          });
        }
      }

      const Comp =
        outletRoute?.CP && outletRoute.Component != RouteView
          ? PAGES[outletRoute.CP as keyof typeof PAGES] || getNullView(outletRoute)
          : Outlet;

      const uState = history.state?.usr;

      const saveCache =
        uState?.saveCache || (prevNav && isParentOf(prevNav, outletRoute));

      const newNavKey = saveCache ? getItemPath(navigation, outletRoute) : "$$";

      let cachedView: any;
      if (saveCache) {
        cachedView = cache.get(newNavKey);
        if (cachedView) {
          cachedView = React.cloneElement(cachedView as any, {
            show: true,
            className: animate ? animation.in : "p-4",
            animate,
            outView: currentView.current,
          });
        }
      }
      if (!cachedView) {
        cachedView = (
          <ViewAnimate
            animate={animate}
            show={true}
            Comp={Comp as any}
            props={rest}
            className={animate ? animation.in : "p-4"}
            viewIndex={viewIndexRef.current}
            outView={currentView.current}
          />
        );
      }

      currentView.current = cachedView;
      prevOutletRouteRef.current = { nav: outletRoute, state: uState };

      const cleanCurrent = setTimeout(() => {
        if (animate || currentView.current) {
          currentView.current = React.cloneElement(currentView.current, {
            animate: false,
            className: "p-4",
            outView: null,
          });

          setChildren(currentView.current);
        }
      }, 1000);

      setChildren(currentView.current);
      /*
      console.log(
        "OutletProtectedRoute props:",
        props,
        ", params:",
        params,
        "\n nav:",
        navItem,
        ", viewIndex:",
        viewIndexRef.current,
        ", otherView:" , (!!currentView.current)
      );
      */

      return () => {
        clearTimeout(cleanCurrent);
      };
    }, [outletRoute, setChildren]);

    return (
      <Layout
        enable={viewProps.enableLayout}
        props={viewProps.layoutProps}
      >
        {children}
        <HttpWatch />
      </Layout>
    );
  },
  () => true,
);

(ProtectedRoute as any).Protected = true;
