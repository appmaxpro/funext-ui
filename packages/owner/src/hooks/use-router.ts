import {
  generatePath, Outlet
} from "react-router";
import { useRouterContext } from "~/context";


export  {
  generatePath,
  Outlet
}

export function useRouter() {
  return useRouterContext()
}
