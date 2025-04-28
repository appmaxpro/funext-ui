"use client"
import { useRef } from 'react'
import useEnhancedEffect  from './useEnhancedEffect'

export function useIsMounted() {
  let mounted = useRef(false)

  useEnhancedEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}