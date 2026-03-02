import { useEffect, useMemo, useRef, useState } from "react";
import { useTabs } from "./use-tabs";
import { generatePath, useNavigate, useParams } from "react-router";
import { TaskQueue } from "~/utils/queue";

const getURL = (
  action: string | null = null,
  mode: string | null = null,
  id: string | null = null,
) => {
  if (!action || action.startsWith("$")) return null;

  if (mode === "list") id = id || "1";
  
  if (!mode && !id) return generatePath("/res/:action", { action });
  if (!mode) return generatePath("/res/:action/:id", { action, id });
  if (!id) return generatePath("/res/:action/:mode", { action, mode });

  return generatePath("/res/:action/:mode/:id", { action, mode, id });
};


const queue = new TaskQueue();

export function View() {
  const params = useParams();
  //const tabs = useTabs();
  const {active, open: openTab, items} = useTabs();

  const [tabState, setTabState] = useState(active?.state);

  const tabParams = useMemo(() => {
    const { action, mode, id } = tabState?.routes?.[tabState.type] ?? {};
    const tabPath = getURL(action, mode, id);
    return { action, mode, id, tabPath };
  }, [tabState]);

  useEffect(()=> {
     return active?.subscribe(setTabState)
  }, [active, setTabState])

  const navigate = useNavigate();

  const pathRef = useRef<string | null>(null);
  const tabPathRef = useRef<string | null>(null);
  const actionRef = useRef<string | null>();

  const homeAction = "";//session.info?.user?.action;

  useEffect(() => {
    const { action: tabAction, tabPath } = tabParams;
    const { action = homeAction, mode, id } = params;
    
    const path = getURL(action, mode, id);
    /*
    console.log("View:", {tabAction, tabMode, tabId})
    console.log("View:", {action, mode, id})
    console.log("View:", {tabPath, path})
    */

    if (action && path && pathRef.current !== path) {
      pathRef.current = path;
      queue.add(() =>
        openTab(action, {
          route: { mode, id },
          tab: true,
        }),
      );
      console.log("Route: Add Tab:", path);
    } else if (
      tabPath &&
      tabAction &&
      //actionRef.current !== tabAction &&
      tabPathRef.current !== tabPath
    ) {
      actionRef.current = tabAction;
      tabPathRef.current = tabPath;
      console.log("Route: redirect:", tabPath);
      navigate(tabPath);
    } else if (items.length === 0) {
      pathRef.current = null;
      tabPathRef.current = null;
      actionRef.current = null;
      console.log("Route: Reset");
    }
  }, [params, navigate, tabParams.tabPath, items]);

  return null;
}