'use client';
import * as React from 'react';
import HiddenJs from './HiddenJs';
import HiddenCss, {HiddenCssProps} from './HiddenCss';
import { 
  Breakpoint,
} from '../../styles';

export interface HiddenProps  {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Specify which implementation to use.  'js' is the default, 'css' works better for
   * server-side rendering.
   * @default 'js'
   */
  implementation?: 'js' | 'css';
  /**
   * You can use this prop when choosing the `js` implementation with server-side rendering.
   *
   * As `window.innerWidth` is unavailable on the server,
   * we default to rendering an empty component during the first mount.
   * You might want to use a heuristic to approximate
   * the screen width of the client browser screen width.
   *
   * For instance, you could be using the user-agent or the client-hints.
   * https://caniuse.com/#search=client%20hint
   */
  initialWidth?: Breakpoint;
  /**
   * If `true`, component is hidden on screens below (but not including) this size.
   * @default false
   */
  lgDown?: boolean;
  /**
   * If `true`, component is hidden on screens this size and above.
   * @default false
   */
  lgUp?: boolean;
  /**
   * If `true`, component is hidden on screens below (but not including) this size.
   * @default false
   */
  mdDown?: boolean;
  /**
   * If `true`, component is hidden on screens this size and above.
   * @default false
   */
  mdUp?: boolean;
  /**
   * Hide the given breakpoint(s).
   */
  only?: Breakpoint | Breakpoint[];
  /**
   * If `true`, component is hidden on screens below (but not including) this size.
   * @default false
   */
  smDown?: boolean;
  /**
   * If `true`, component is hidden on screens this size and above.
   * @default false
   */
  smUp?: boolean;
  /**
   * If `true`, component is hidden on screens below (but not including) this size.
   * @default false
   */
  xlDown?: boolean;
  /**
   * If `true`, component is hidden on screens this size and above.
   * @default false
   */
  xlUp?: boolean;
  /**
   * If `true`, component is hidden on screens below (but not including) this size.
   * @default false
   */
  xsDown?: boolean;
  /**
   * If `true`, component is hidden on screens this size and above.
   * @default false
   */
  xsUp?: boolean;
}

/**
 * Responsively hides children based on the selected implementation.
 *
 * @deprecated The Hidden component was deprecated in Material UI v5. To learn more, see [the Hidden section](https://mui.com/material-ui/migration/v5-component-changes/#hidden) of the migration docs.
 */
export function Hidden(props:HiddenProps) {
  const {
    implementation = 'js',
    lgDown = false,
    lgUp = false,
    mdDown = false,
    mdUp = false,
    smDown = false,
    smUp = false,
    xlDown = false,
    xlUp = false,
    xsDown = false,
    xsUp = false,
    ...other
  } = props;

  if (implementation === 'js') {
    return (
      <HiddenJs
        lgDown={lgDown}
        lgUp={lgUp}
        mdDown={mdDown}
        mdUp={mdUp}
        smDown={smDown}
        smUp={smUp}
        xlDown={xlDown}
        xlUp={xlUp}
        xsDown={xsDown}
        xsUp={xsUp}
        {...other}
      />
    );
  }

  return (
    <HiddenCss
      lgDown={lgDown}
      lgUp={lgUp}
      mdDown={mdDown}
      mdUp={mdUp}
      smDown={smDown}
      smUp={smUp}
      xlDown={xlDown}
      xlUp={xlUp}
      xsDown={xsDown}
      xsUp={xsUp}
      {...other}
    />
  );
}

export default Hidden;