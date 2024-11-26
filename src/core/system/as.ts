import * as React from "react";
import {OverridableComponent, OverridableTypeMap} from '../../mui/props';

/**
 * @deprecated
 */
export function forwardRef<P extends OverridableTypeMap>(
  render: React.ForwardRefRenderFunction<any,P>,
) {
  //@ts-ignore
  return React.forwardRef(render) as unknown as OverridableComponent<P>;
}
