import type { OutletRoute } from "~/utils";
import { useRouter } from "./use-router";

const empty = {
  kind: 'page'
}

export function useActivePageRoute(): OutletRoute {
  const router = useRouter();
  return router?.route ?? empty
}