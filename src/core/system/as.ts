import * as React from "react";
import {OverridableComponent, OverridableTypeMap} from '../../mui/utils';

/**
 * @deprecated
 */
export function forwardRef<P extends OverridableTypeMap>(
  render: React.ForwardRefRenderFunction<any,P>,
) {
  return React.forwardRef(render) as unknown as OverridableComponent<P>;
}
