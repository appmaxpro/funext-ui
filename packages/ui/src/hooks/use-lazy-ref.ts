import * as React from 'react';

const UNINITIALIZED = {};

type FN<R> = (...args: any[]) => R;

export function useLazyRef<R = any>(
	fn: FN<R>
): React.MutableRefObject<R> {

	const ref = React.useRef<R>(UNINITIALIZED as R);

  if (ref.current === UNINITIALIZED) {
    ref.current = fn();
  }

	return ref as React.MutableRefObject<R>;
}

export default useLazyRef;