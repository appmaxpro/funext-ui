import React from 'react'
import { useNavigate, useNavigation } from 'react-router'

//import {useRouter} from './useRouter'

export function isLeftClickEvent(event: React.MouseEvent) {
  return event.button === 0
}

export function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

/**
 * @public
 */
export interface UseLinkOptions {
  /**
   * The URL that the link should navigate to.
   */
  href?: string

  /**
   * The event handler function that should be called when the link is clicked.
   */
  onClick?: React.MouseEventHandler<HTMLElement>

  /**
   * Whether the link should replace the current URL in the browser history.
   */
  replace?: boolean

  /**
   * The target window or frame that the linked document will open in.
   */
  target?: string;

  state?: any;
}

/**
 * Returns an object with an `onClick` function that can be used as a click handler for a link.
 *
 * @public
 *
 * @param options - An object containing the properties for the link.
 *  See {@link UseLinkOptions}
 *
 * @returns An object with an `onClick` function.
 *
 * @example
 * ```tsx
 * const linkProps = useLink({
 *  href: 'https://www.sanity.io',
 *  target: '_blank'
 * })
 *
 * <a {...linkProps}>Link</a>
 * ```
 */
export function useLink(options: UseLinkOptions): {onClick: React.MouseEventHandler<HTMLElement>} {
  const {onClick: onClickProp, href, target, replace = false, state} = options
  //const navigation = useNavigation();
  let navigate = useNavigate();

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>): void => {
      if (event.isDefaultPrevented()) {
        return
      }

      if (!href) return

      if (onClickProp) {
        onClickProp(event)
      }

      if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return
      }

      // If target prop is set (e.g. to "_blank") let browser handle link.
      if (target) {
        return
      }

      event.preventDefault()
      //const fn = (replace ? history.replaceState : history.pushState).bind(history)
      //fn(state, '', href)
      navigate(href, {replace, state/*, viewTransition: true*/})
      //navigateUrl({path: href, replace, state})
    },
    [href, navigate, onClickProp, replace, target, state],
  )

  return {onClick: onClick}
}


/**
 * Props for the {@link Link} component.
 *
 * @public
 */
export interface LinkProps {
  /**
   * Whether to replace the current URL in the browser history instead of adding a new entry.
   */
  replace?: boolean
}

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
export const Link = React.forwardRef(function Link(
  props: LinkProps & React.HTMLProps<HTMLAnchorElement>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const {onClick: onClickProp, href, target, replace, ...restProps} = props
  const {onClick} = useLink({onClick: onClickProp, href, target, replace})

  return <a {...restProps} onClick={onClick} href={href} target={target} ref={ref} />
})
