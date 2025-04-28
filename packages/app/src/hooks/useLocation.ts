"use client";
import * as React from "react";
import { useRouter } from "./useRouter";

export function useLocation() {
  const { pathname, searchParams: params, state } = useRouter() ?? {};
  return React.useMemo(
    () => ({ pathname, search: params?.toString(), params, state }),
    [pathname, params],
  );
}
