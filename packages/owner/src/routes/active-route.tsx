import { useActivePageRoute } from "~/hooks";
import { EMPTY_OBJECT } from "~/utils";
import RouteView from "./route-view";

function ActiveRoute() {
  const nav = useActivePageRoute() ?? EMPTY_OBJECT;

  console.log("ActiveRoute:", nav);

  return <RouteView route={nav} />;
}

ActiveRoute.displayName = "ActiveRoute";

export default ActiveRoute;
