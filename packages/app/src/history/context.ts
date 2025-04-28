import {createContext} from 'react'
import type {RouterHistory} from './types'

export const RouterHistoryContext = createContext<RouterHistory | null>(
  null,
)
