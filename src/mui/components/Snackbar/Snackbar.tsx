import * as React from 'react';
import SnackbarContent, { SnackbarContentProps } from './SnackbarContent';
import { TransitionProps } from '../../../core/transitions';

import {
  clsx,
  composeClasses,
  emphasize,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuxDefaultProps,
  useRtl,
  useSlot,
  useTheme
} from "../../styles";
import { StandardProps } from "../../props";

import { 
  Grow, 
  ClickAwayListener,
  ClickAwayListenerProps,
  Slide
} from '../../..';
import { capitalize } from '../../utils';
import useSnackbar from './useSnackbar';

export interface SnackbarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'top', 'center' }}`. */
  anchorOriginTopCenter: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'bottom', 'center' }}`. */
  anchorOriginBottomCenter: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'top', 'right' }}`. */
  anchorOriginTopEnd: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'bottom', 'right' }}`. */
  anchorOriginBottomEnd: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'top', 'left' }}`. */
  anchorOriginTopStart: string;
  /** Styles applied to the root element if `anchorOrigin={{ 'bottom', 'left' }}`. */
  anchorOriginBottomStart: string;
}

export type SnackbarClassKey = keyof SnackbarClasses;

export function getSnackbarUtilityClass(slot: string): string {
  return generateUtilityClass('MuxSnackbar', slot);
}

export const snackbarClasses: SnackbarClasses = generateUtilityClasses('MuxSnackbar', [
  'root',
  'anchorOriginTopCenter',
  'anchorOriginBottomCenter',
  'anchorOriginTopEnd',
  'anchorOriginBottomEnd',
  'anchorOriginTopStart',
  'anchorOriginBottomStart',
]);

export interface SnackbarOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'start' | 'center' | 'end';
}

export type SnackbarCloseReason = 'timeout' | 'clickaway' | 'escapeKeyDown';

export interface SnackbarProps extends StandardProps<React.HTMLAttributes<HTMLDivElement>, SnackbarClassKey> {
  /**
   * The action to display. It renders after the message, at the end of the snackbar.
   */
  action?: SnackbarContentProps['action'];
  /**
   * The anchor of the `Snackbar`.
   * On smaller screens, the component grows to occupy all the available width,
   * the horizontal alignment is ignored.
   * @default { vertical: 'bottom', horizontal: 'left' }
   */
  anchorOrigin?: SnackbarOrigin;
  /**
   * The number of milliseconds to wait before automatically calling the
   * `onClose` function. `onClose` should then set the state of the `open`
   * prop to hide the Snackbar. This behavior is disabled by default with
   * the `null` value.
   * @default null
   */
  autoHideDuration?: number | null;
  /**
   * Replace the `SnackbarContent` component.
   */
  children?: React.ReactElement<unknown, any>;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SnackbarClasses>;
  /**
   * Props applied to the `ClickAwayListener` element.
   */
  ClickAwayListenerProps?: Partial<ClickAwayListenerProps>;
  /**
   * Props applied to the [`SnackbarContent`](https://mui.com/material-ui/api/snackbar-content/) element.
   */
  ContentProps?: Partial<SnackbarContentProps>;
  /**
   * If `true`, the `autoHideDuration` timer will expire even if the window is not focused.
   * @default false
   */
  disableWindowBlurListener?: boolean;
  /**
   * When displaying multiple consecutive snackbars using a single parent-rendered
   * `<Snackbar/>`, add the `key` prop to ensure independent treatment of each message.
   * For instance, use `<Snackbar key={message} />`. Otherwise, messages might update
   * in place, and features like `autoHideDuration` could be affected.
   */
  key?: any;
  /**
   * The message to display.
   */
  message?: SnackbarContentProps['message'];
  /**
   * Callback fired when the component requests to be closed.
   * Typically `onClose` is used to set state in the parent component,
   * which is used to control the `Snackbar` `open` prop.
   * The `reason` parameter can optionally be used to control the response to `onClose`,
   * for example ignoring `clickaway`.
   *
   * @param {React.SyntheticEvent<any> | Event} event The event source of the callback.
   * @param {string} reason Can be: `"timeout"` (`autoHideDuration` expired), `"clickaway"`, or `"escapeKeyDown"`.
   */
  onClose?: (event: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) => void;
  /**
   * If `true`, the component is shown.
   */
  open?: boolean;
  /**
   * The number of milliseconds to wait before dismissing after user interaction.
   * If `autoHideDuration` prop isn't specified, it does nothing.
   * If `autoHideDuration` prop is specified but `resumeHideDuration` isn't,
   * we default to `autoHideDuration / 2` ms.
   */
  resumeHideDuration?: number;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Grow
   */
  TransitionComponent?: React.JSXElementConstructor<
    TransitionProps & { children: React.ReactElement<unknown, any> }
  >;
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  transitionDuration?: TransitionProps['timeout'];
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   * @default {}
   */
  TransitionProps?: TransitionProps;

  side?: 'v' | 'h';

  slide?: boolean;
}


const useUtilityClasses = (ownerState:any) => {
  const { classes, anchorOrigin } = ownerState;

  const slots = {
    root: [
      'root',
      `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`,
    ],
  };

  return composeClasses(slots, getSnackbarUtilityClass, classes);
};

const SnackbarRoot = styled('div', {
  name: 'MuxSnackbar',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[
        `anchorOrigin${capitalize(ownerState.anchorOrigin.vertical)}${capitalize(
          ownerState.anchorOrigin.horizontal,
        )}`
      ],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.snackbar,
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    variants: [
      {
        props: ({ ownerState }:any) => ownerState.anchorOrigin.vertical === 'top',
        style: { top: 8, [theme.breakpoints.up('sm')]: { top: 24 } },
      },
      {
        props: ({ ownerState }:any) => ownerState.anchorOrigin.vertical !== 'top',
        style: { bottom: 8, [theme.breakpoints.up('sm')]: { bottom: 24 } },
      },
      {
        props: ({ ownerState }:any) => ownerState.anchorOrigin.horizontal === 'start',
        style: {
          justifyContent: 'flex-start',
          left: 8,
          [theme.breakpoints.up('sm')]: {
            left: 24,
          },
        },
      },
      {
        props: ({ ownerState }:any) => ownerState.anchorOrigin.horizontal === 'end',
        style: {
          justifyContent: 'flex-end',
          right: 8,
          [theme.breakpoints.up('sm')]: {
            right: 24,
          },
        },
      },
      {
        props: ({ ownerState }:any) => ownerState.anchorOrigin.horizontal === 'center',
        style: {
          [theme.breakpoints.up('sm')]: {
            left: '50%',
            transform: 'translateX(-50%)',
          },
        },
      },
    ],
  })),
);

export const Snackbar = React.forwardRef<HTMLElement, SnackbarProps>(function Snackbar(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuiSnackbar' });
  const theme = useTheme();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const {
    action,
    anchorOrigin: { vertical, horizontal } = { vertical: 'bottom', horizontal: 'end' },
    autoHideDuration = null,
    children,
    className,
    ClickAwayListenerProps,
    ContentProps,
    disableWindowBlurListener = false,
    message,
    onBlur,
    onClose,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    open,
    slide,
    resumeHideDuration,
    TransitionComponent = slide ? Slide : Grow,
    transitionDuration = defaultTransitionDuration,
    TransitionProps: { onEnter, onExited, ...TransitionProps } = {},
    side='v',
    ...other
  } = props;

  const ownerState = {
    ...props,
    anchorOrigin: { vertical, horizontal },
    
    autoHideDuration,
    disableWindowBlurListener,
    TransitionComponent,
    transitionDuration,
  };

  const classes = useUtilityClasses(ownerState);

  const { getRootProps, onClickAway } = useSnackbar({ ...ownerState as any });

  const [exited, setExited] = React.useState(true);

  const [__, rootProps] = useSlot("root", {
    elementType: SnackbarRoot,
    getSlotProps: getRootProps,
    externalForwardedProps: (other as any),
    ownerState,
    additionalProps: {
      ref,
    },
    className: [classes.root, className],
  } as any);

  const handleExited = (node:any) => {
    setExited(true);

    if (onExited) {
      onExited(node);
    }
  };

  const handleEnter = (node:any, isAppearing:any) => {
    setExited(false);

    if (onEnter) {
      onEnter(node, isAppearing);
    }
  };

  // So we only render active snackbars.
  if (!open && exited) {
    return null;
  }
  
  return (
    <ClickAwayListener onClickAway={onClickAway} {...ClickAwayListenerProps}>
      <SnackbarRoot {...rootProps}>
        <TransitionComponent
          appear
          in={open}
          timeout={transitionDuration}

          direction={(side == 'v' || horizontal === 'center')
            ? (vertical === 'top' ? 'down' : 'up') 
            : horizontal === 'start' ? 'end' : 'start'
          }
          onEnter={handleEnter}
          onExited={handleExited}
          {...TransitionProps}
        >
          {children || <SnackbarContent message={message} action={action} {...ContentProps} />}
        </TransitionComponent>
      </SnackbarRoot>
    </ClickAwayListener>
  );
});

