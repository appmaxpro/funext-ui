import React from "react";
import { Loader } from "~/components";
const SettingsLazy = React.lazy(() => import("./settings"));
const AccountLazy = React.lazy(() => import("./account"));

export function Settings() {
  return (
    <React.Suspense fallback={<Loader />}>
      <SettingsLazy />
    </React.Suspense>
  );
}

export function Account() {
  return (
    <React.Suspense fallback={<Loader />}>
      <AccountLazy />
    </React.Suspense>
  );
}
