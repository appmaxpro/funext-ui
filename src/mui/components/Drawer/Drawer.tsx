'use client';
import * as React from 'react';
import Popper from '../Popper';
import {
  type SxComponentProps,
  composeClasses,
  useMuiDefaultProps,
  memoTheme,
  clsx,
  styled,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps,
  useRtl,
  useTheme
} from "../../styles";

import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

import { capitalize } from '../../utils';
import { StandardProps } from "../../props";

import {Slide, SlideProps} from "../../../core/slide";
import Panel, { PanelProps } from '../Panel';
import { TransitionProps } from 'react-transition-group/Transition';
import { PopperProps } from '../Popper';
import { OpenChangeReason } from '@floating-ui/react';

export interface DrawerClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `variant="permanent or persistent"`. */
  docked: string;
  /** Styles applied to the Panel component. */
  panel: string;
  /** Styles applied to the Panel component if `direction="start"`. */
  panelAnchorStart: string;
  /** Styles applied to the Panel component if `direction="end"`. */
  panelAnchorEnd: string;
  /** Styles applied to the Panel component if `direction="top"`. */
  panelAnchorTop: string;
  /** Styles applied to the Panel component if `direction="bottom"`. */
  panelAnchorBottom: string;
  /** Styles applied to the Panel component if `direction="start"` and `variant` is not "temporary". */
  panelAnchorDockedStart: string;
  /** Styles applied to the Panel component if `direction="top"` and `variant` is not "temporary". */
  panelAnchorDockedTop: string;
  /** Styles applied to the Panel component if `direction="end"` and `variant` is not "temporary". */
  panelAnchorDockedEnd: string;
  /** Styles applied to the Panel component if `direction="bottom"` and `variant` is not "temporary". */
  panelAnchorDockedBottom: string;
  /** Styles applied to the Popper component. */
  modal: string;
}

export type DrawerClassKey = keyof DrawerClasses;

export function getDrawerUtilityClass(slot: string): string {
  return generateUtilityClass('MuxDrawer', slot);
}

const drawerClasses: DrawerClasses = generateUtilityClasses('MuxDrawer', [
  'root',
  'docked',
  'panel',
  'panelAnchorStart',
  'panelAnchorEnd',
  'panelAnchorTop',
  'panelAnchorBottom',
  'panelAnchorDockedStart',
  'panelAnchorDockedEnd',
  'panelAnchorDockedTop',
  'panelAnchorDockedBottom',
  'modal',
]);




const overridesResolver = (props:any, styles:any) => {
  const { ownerState } = props;

  return [
    styles.root,
    (ownerState.variant === 'permanent' || ownerState.variant === 'persistent') && styles.docked,
    styles.modal,
  ];
};

const useUtilityClasses = (ownerState:any) => {
  const { classes, direction, variant } = ownerState;

  const slots = {
    root: ['root'],
    docked: [(variant === 'permanent' || variant === 'persistent') && 'docked'],
    modal: ['modal'],
    panel: [
      'panel',
      `panelAnchor${capitalize(direction)}`,
      variant !== 'temporary' && `panelAnchorDocked${capitalize(direction)}`,
    ],
  };

  return composeClasses(slots, getDrawerUtilityClass, classes);
};

const DrawerRoot = styled(Popper, {
  name: 'MuxDrawer',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.drawer,
  })),
);

const DrawerDockedRoot = styled('div', {
  shouldForwardProp: rootShouldForwardProp,
  name: 'MuxDrawer',
  slot: 'Docked',
  skipVariantsResolver: false,
  overridesResolver,
})({
  flex: '0 0 auto',
});

const DrawerPanel = styled(Panel, {
  name: 'MuxDrawer',
  slot: 'Panel',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.panel,
      styles[`panelAnchor${capitalize(ownerState.direction)}`],
      ownerState.variant !== 'temporary' &&
        styles[`panelAnchorDocked${capitalize(ownerState.direction)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: '1 0 auto',
    zIndex: (theme.vars || theme).zIndex.drawer,
    // Add iOS momentum scrolling for iOS < 13.0
    WebkitOverflowScrolling: 'touch',
    // temporary style
    position: 'fixed',
    top: 0,
    // We disable the focus ring for mouse, touch and keyboard users.
    // At some point, it would be better to keep it for keyboard users.
    // :focus-ring CSS pseudo-class will help.
    outline: 0,
    variants: [
      {
        props: {
          direction: 'start',
        },
        style: {
          left: 0,
        },
      },
      {
        props: {
          direction: 'top',
        },
        style: {
          top: 0,
          left: 0,
          right: 0,
          height: 'auto',
          maxHeight: '100%',
        },
      },
      {
        props: {
          direction: 'end',
        },
        style: {
          right: 0,
        },
      },
      {
        props: {
          direction: 'bottom',
        },
        style: {
          top: 'auto',
          left: 0,
          bottom: 0,
          right: 0,
          height: 'auto',
          maxHeight: '100%',
        },
      },
      {
        props: ({ ownerState }:any) =>
          ownerState.direction === 'start' && ownerState.variant !== 'temporary',
        style: {
          borderEnd: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
      {
        props: ({ ownerState }:any) =>
          ownerState.direction === 'top' && ownerState.variant !== 'temporary',
        style: {
          borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
      {
        props: ({ ownerState }:any) =>
          ownerState.direction === 'end' && ownerState.variant !== 'temporary',
        style: {
          borderStart: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
      {
        props: ({ ownerState }:any) =>
          ownerState.direction === 'bottom' && ownerState.variant !== 'temporary',
        style: {
          borderTop: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
    ],
  })),
);

const oppositeDirection:any = {
  start: 'end',
  end: 'start',
  top: 'down',
  bottom: 'up',
};

export function isHorizontal(direction:string) {
  return ['start', 'end'].includes(direction);
}

export function getAnchor(direction:string, isRtl: boolean) {
  return isRtl && isHorizontal(direction) ? oppositeDirection[direction] : direction;
}

export type onClose = (event?: Event, reason?: OpenChangeReason) => void;

export interface DrawerProps extends StandardProps<PopperProps, DrawerClassKey, 'open' | 'children'> {
  /**
   * Side from which the drawer will appear.
   * @default 'start'
   */
  direction?: SlideProps['direction'];
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DrawerClasses>;
  /**
   * The elevation of the drawer.
   * @default 16
   */
  elevation?: number;
  /**
   * Props applied to the [`Popper`](https://mui.com/material-ui/api/modal/) element.
   * @default {}
   */
  popperProps?: Partial<PopperProps>;
  /**
   * Callback fired when the component requests to be closed.
   * The `reason` parameter can optionally be used to control the response to `onClose`.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose?: onClose;
  /**
   * If `true`, the component is shown.
   * @default false
   */
  open?: boolean;
  /**
   * Props applied to the [`Panel`](https://mui.com/material-ui/api/panel/) element.
   * @default {}
   */
  panelProps?: Partial<PanelProps<React.ElementType>>;
  /**
   * Props applied to the [`Slide`](https://mui.com/material-ui/api/slide/) element.
   */
  slideProps?: Partial<SlideProps>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
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
   * The variant to use.
   * @default 'temporary'
   */
  variant?: 'permanent' | 'persistent' | 'temporary';
}

/**
 * The props of the [Popper](/material-ui/api/modal/) component are available
 * when `variant="temporary"` is set.
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(inProps, ref) {
  const props = useMuiDefaultProps({ props: inProps, name: 'MuxDrawer' });
  const theme = useTheme();
  const isRtl = useRtl();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const {
    direction = 'start',
    children,
    className,
    elevation = 16,
    popperProps = {},
    onClose,
    open = false,
    panelProps = {},
    slideProps,
    // eslint-disable-next-line react/prop-types
    //TransitionComponent = Slide,
    transitionDuration = defaultTransitionDuration,
    variant = 'temporary',
    ...other
  } = props;


  const TransitionComponent = Slide;
  // Let's assume that the Drawer will always be rendered on user space.
  // We use this state is order to skip the appear transition during the
  // initial mount of the component.
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);

  React.useEffect(() => {
    
  }, [open]);

  const [openState, setOpenState] = React.useState(open);


  const ownerState = {
    ...props,
    direction: getAnchor(direction, isRtl),
    elevation,
    open,
    variant,
    ...other,
  };

  const classes = useUtilityClasses(ownerState);

  const drawer = (
    <DrawerPanel
      elevation={variant === 'temporary' ? elevation : 0}
      square
      {...(panelProps as any)}
      className={clsx(classes.panel, panelProps.className)}
      ownerState={ownerState}
    >
      {children}
    </DrawerPanel>
  );

  if (variant === 'permanent') {
    return (
      <DrawerDockedRoot
        className={clsx(classes.root, classes.docked, className)}
        ownerState={ownerState  }
        ref={ref}
        {...other}
      >
        {drawer}
      </DrawerDockedRoot>
    );
  }

  const slidingDrawer = (
    <TransitionComponent
      in={open}
      direction={direction}
      timeout={transitionDuration}
      appear={mounted.current}
      onExited={()=>{setOpenState(false)}}
      {...slideProps}
    >
      {drawer}
    </TransitionComponent>
  );

  if (variant === 'persistent') {
    return (
      <DrawerDockedRoot
        className={clsx(classes.root, classes.docked, className)}
        ownerState={ownerState}
        ref={ref}
        {...other}
      >
        {slidingDrawer}
      </DrawerDockedRoot>
    );
  }

  // variant === temporary
  return (
    <DrawerRoot
      className={clsx(classes.root, classes.modal, className)}
      open={openState || open}
      ownerState={ownerState}
      handler={(open, event, reason) => !open && onClose?.(event, reason)}
      ref={ref}
      {...other}
      {...popperProps}
    >
      {slidingDrawer}
    </DrawerRoot>
  );
});

export default Drawer;