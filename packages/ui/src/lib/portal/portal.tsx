import {createPortal} from 'react-dom'
import {usePortal} from './usePortal'
import {FloatingPortal} from '@floating-ui/react';

/**
 * @public
 */
export interface PortalProps {
  children: React.ReactNode
  /**
   * @beta This API might change. DO NOT USE IN PRODUCTION.
   */
  __unstable_name?: string;

  floatingPortal?: boolean | string | HTMLElement;
}

/**
 * @public
 */
export function Portal(props: PortalProps): React.ReactPortal | React.ReactNode | null {
  const {children, floatingPortal, __unstable_name: name} = props
  const portal = usePortal()
  const portalElement =
    (name ? portal.elements && portal.elements[name] : portal.element) || portal.elements?.default

  if (!portalElement) {
    return null
  }

  if (floatingPortal) {
    const portalRoot = (floatingPortal instanceof HTMLElement ||
          typeof floatingPortal == 'string') ? floatingPortal : portalElement;

    return (<FloatingPortal root={portalRoot as any}>{children}</FloatingPortal>);
  }

  return createPortal(children, portalElement)
}

Portal.displayName = 'Portal'
