import type React from "react";
import { AppLayout, type AppLayoutProps } from "~/components/app/app-layout";
import { RawAppLayout, type RawAppLayoutProps } from "../app";

type LayoutType =
  | {
      type: "raw";
      props: Omit<RawAppLayoutProps, "children">;
    }
  | {
      type?: undefined;
      props: Omit<AppLayoutProps, "children">;
    };

type LayoutProps = LayoutType & {
  enable?: boolean;
  children: React.ReactNode;
}

function Layout({
  props,
  children,
  enable = true,
  type
}: LayoutProps) {
  if (!enable) {
    return children;
  }
  if (type === "raw")
    return <RawAppLayout {...props}>{children}</RawAppLayout>;

  return <AppLayout {...props}>{children}</AppLayout>;
}

export type { LayoutProps };

export { Layout };
