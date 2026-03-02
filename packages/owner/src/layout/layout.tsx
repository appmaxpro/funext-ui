import type React from "react";
import { AppLayout, type AppLayoutProps } from "~/components/app/app-layout";

interface LayoutProps {
  appLayoutProps?: Omit<AppLayoutProps, 'children'>;
  enableAppLayout?: boolean;
  children: React.ReactNode;
}

function Layout({
  appLayoutProps,
  enableAppLayout = !!appLayoutProps,
  children,
}: LayoutProps) {
  if (!enableAppLayout) {
    return children;
  }
  return <AppLayout {...appLayoutProps}>{children}</AppLayout>
}

export type{
  LayoutProps
}

export {
  Layout
}