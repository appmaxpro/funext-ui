import { useRef } from 'react'
import useEnhancedEffect  from './useEnhancedEffect'

export function useLatestValue<T>(value: T) {
  let cache = useRef(value)

  useEnhancedEffect(() => {
    cache.current = value
  }, [value])

  return cache
}