import { useRef } from "react";
import * as React from 'react';
import { EMPTY_ARRAY } from "../lib/constants";
//const UNINITIALIZED = {};

type FN<R> = (...args: any[]) => R;

export function useLazyRef<R = any>(
	fn: FN<R>
): React.MutableRefObject<R> {

	const ref = React.useRef<R>();

  if (ref.current === undefined) {
    ref.current = fn();
  }

	return ref as React.MutableRefObject<R>;
}

export default useLazyRef;