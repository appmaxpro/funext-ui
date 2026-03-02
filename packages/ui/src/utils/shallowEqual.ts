/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule shallowEqual
 * @typechecks
 * @flow
 */

import { EMPTY_ARRAY } from "../lib/constants";

const hasOwnProperty = Object.prototype.hasOwnProperty;


/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x:any, y:any) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }
  // Step 6.a: NaN == NaN
  // eslint-disable-next-line no-self-compare
  return x !== x && y !== y;
}

export const EXCLUDE_CHILDREN:string[] = ["children"] as const;
/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA:any, objB:any, exclude: string[] = EMPTY_ARRAY) {
  if(objA == null && objB == null) {
    return true
  }

  if(objA == null || objB == null) {
     return false
  }

  if (is(objA, objB)) {
    return true;
  }



  if (
    typeof objA !== 'object' ||
    objA == null ||
    typeof objB !== 'object' ||
    objB == null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (exclude.includes(keysA[i])) {
      continue;
    }

    if (
      !exclude.includes(keysA[i]) &&
      (!hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]]))
    ) {
      return false;
    }
  }

  return true;
}