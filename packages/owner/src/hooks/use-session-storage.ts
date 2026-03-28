'use client';
import { type UseStorageState, useStorage, useStorageStateServer } from './use-persistence-state';

/**
 * Sync state to session storage so that it persists through a page refresh. Usage is
 * similar to useState except we pass in a storage key so that we can default
 * to that value on page load instead of the specified initial value.
 *
 * Since the storage API isn't available in server-rendering environments, we
 * return null during SSR and hydration.
 */
const useSessionStorageState: UseStorageState = (...args: [any, any, any]) =>
  useStorage(window.sessionStorage, ...args);

export const useSessionStorage: UseStorageState =
  typeof window === 'undefined' ? useStorageStateServer : useSessionStorageState;