import { useRef } from "react";
import * as React from 'react';
const UNINITIALIZED = {};

export function useLazyRef<F extends (...args: any[]) => any>(
	fn: F
): React.MutableRefObject<ReturnType<F>> {

	const ref = React.useRef(UNINITIALIZED as unknown as ReturnType<F>);

  if (ref.current === UNINITIALIZED) {
    ref.current = fn();
  }

	return ref;
}

export default useLazyRef;