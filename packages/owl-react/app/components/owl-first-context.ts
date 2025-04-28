import * as React from "react";
import type { TreeNode } from "./types";

/**
 * Context from a sveltified parent component.
 */
const OwlFirstContext = React.createContext(
  undefined as TreeNode | undefined,
);
OwlFirstContext.displayName = "OwlFirstContext";
export default OwlFirstContext;