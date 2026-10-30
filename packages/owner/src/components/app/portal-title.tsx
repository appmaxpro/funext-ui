import { Portal } from "~/ui";
import { useEffect, type ReactNode } from "react";

export function PortalTitle({
  children,
  title,
}: {
  children?: ReactNode;
  title: string;
}) {
  useEffect(() => {
    document.head.title = title;
  }, [title]);

  return children ? <Portal root="__view_title__">{children}</Portal> : null;
}
