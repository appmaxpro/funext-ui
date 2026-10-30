// Based on https://github.com/radix-ui/primitives/blob/0bade6a704e5821b90a6da0f3d8cfa8a7711127d/packages/react/slot/src/Slot.tsx#L128-L150
// Before React 19 accessing `element.props.ref` will throw a warning and suggest using `element.ref`
// After React 19 accessing `element.ref` does the opposite.
// https://github.com/facebook/react/pull/28348
//

import { isDevelopment, noop } from "../utils"

const EMPTY_REF = noop;

// Access the ref using the method that doesn't yield a warning.
export function getElementRef(element: React.ReactElement) {
  if (!element) return EMPTY_REF
  
  // Not DEV
  return (element.props as any)?.ref || (element as any).ref
}
