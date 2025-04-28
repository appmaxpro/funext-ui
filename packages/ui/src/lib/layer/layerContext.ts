import {createGlobalScopedContext} from '../createGlobalScopedContext'
import {LayerContextValue} from './types'

export const LayerContext = createGlobalScopedContext<LayerContextValue | null>(
  '@funext/ui/context/layer',
  null,
)
