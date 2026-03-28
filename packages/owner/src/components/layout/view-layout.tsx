import React from "react";
import { useViewBlock } from "~/context";
import { ViewAppBar } from "./view-toolbar";
import { RawAppLayout, type RawAppLayoutProps } from "../app/raw-app-layout";

type Props = {
  enable?: boolean;
  appBar?: React.ComponentType<any>;
  children: React.ReactNode;
  props?: Omit<RawAppLayoutProps, "children">;
};

export function ViewLayout({
  enable,
  appBar: appBarProp,
  children,
  ...props
}: Props) {
  const view = useViewBlock();
  const layout = view.props?.layout;
  enable ??= layout !== false;

  if (!enable) {
    return children;
  }

  const appBar = (appBarProp ?? ViewAppBar) 

  return (
    <RawAppLayout appBar={appBar} {...props}>
      {children}
    </RawAppLayout>
  );
}
