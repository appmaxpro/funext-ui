import {type ForwardedRef, forwardRef, type HTMLProps} from 'react'

import {useLink} from '../hooks/useLink'
import type {LinkProps} from './types';


/**
 * A component that creates an HTML anchor element.
 *
 * @public
 *
 * @param props - Props to pass to the `Link` component.
 *  See {@link LinkProps}
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   return (
 *    <Link href="https://www.sanity.io" target="_blank" replace>
 *      Go to Sanity
 *    </Link>
 *   )
 * }
 * ```
 */
export const Link = forwardRef(function Link(
  props: LinkProps & HTMLProps<HTMLAnchorElement>,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const {onClick: onClickProp, href, target, replace, state, ...restProps} = props
  const {onClick} = useLink({onClick: onClickProp, href, target, replace, state})

  return <a {...restProps} onClick={onClick} href={href} target={target} ref={ref} />
})
