import React from "react";
import { sanitize } from "~/utils";

function isHtml(input: string) {
  return /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(input);
}

export const SafeText = ({text, children = text }: {children?:React.ReactNode,  text?: string }) => {
  return React.useMemo(() => {
    const html = typeof children === "string" && isHtml(children);
    if (html)
      return <span dangerouslySetInnerHTML={{ __html: sanitize(children) }} />
    return children;
  }, [children]);
};
