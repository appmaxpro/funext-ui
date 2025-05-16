'use client';
import * as React from 'react';
import {
  type SxComponentProps,
  composeClasses,
  useMuxDefaultProps,
  memoTheme,
  clsx,
  styled,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps,
} from "../../styles";

import { useStepContext, useStepperContext } from './Context';
import { capitalize } from '../../utils';
import { StandardProps } from "../../theme/tw/props";

export interface StepConnectorClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `orientation="horizontal"`. */
  horizontal: string;
  /** Styles applied to the root element if `orientation="vertical"`. */
  vertical: string;
  /** Styles applied to the root element if `alternativeLabel={true}`. */
  alternativeLabel: string;
  /** State class applied to the root element if `active={true}`. */
  active: string;
  /** State class applied to the root element if `completed={true}`. */
  completed: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** Styles applied to the line element. */
  line: string;
  /** Styles applied to the line element if `orientation="horizontal"`.
   * @deprecated Combine the [.MuxStepConnector-horizontal](/material-ui/api/step-connector/#step-connector-classes-horizontal) and [.MuxStepConnector-line](/material-ui/api/step-connector/#step-connector-classes-line) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  lineHorizontal: string;
  /** Styles applied to the line element if `orientation="vertical"`.
   * @deprecated Combine the [.MuxStepConnector-vertical](/material-ui/api/step-connector/#step-connector-classes-vertical) and [.MuxStepConnector-line](/material-ui/api/step-connector/#step-connector-classes-line) classes instead. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  lineVertical: string;
}

export type StepConnectorClassKey = keyof StepConnectorClasses;

export function getStepConnectorUtilityClass(slot: string): string {
  return generateUtilityClass('MuxStepConnector', slot);
}

const stepConnectorClasses: StepConnectorClasses = generateUtilityClasses('MuxStepConnector', [
  'root',
  'horizontal',
  'vertical',
  'alternativeLabel',
  'active',
  'completed',
  'disabled',
  'line',
  'lineHorizontal',
  'lineVertical',
]);

const useUtilityClasses = (ownerState:any) => {
  const { classes, orientation, alternativeLabel, active, completed, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      orientation,
      alternativeLabel && 'alternativeLabel',
      active && 'active',
      completed && 'completed',
      disabled && 'disabled',
    ],
    line: ['line', `line${capitalize(orientation)}`],
  };

  return composeClasses(slots, getStepConnectorUtilityClass, classes);
};

const StepConnectorRoot = styled('div', {
  name: 'MuxStepConnector',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.orientation],
      ownerState.alternativeLabel && styles.alternativeLabel,
      ownerState.completed && styles.completed,
    ];
  },
})({
  flex: '1 1 auto',
  variants: [
    {
      props: { orientation: 'vertical' },
      style: {
        marginLeft: 12, // half icon
      },
    },
    {
      props: { alternativeLabel: true },
      style: {
        position: 'absolute',
        top: 8 + 4,
        left: 'calc(-50% + 20px)',
        right: 'calc(50% + 20px)',
      },
    },
  ],
});

const StepConnectorLine = styled('span', {
  name: 'MuxStepConnector',
  slot: 'Line',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.line, styles[`line${capitalize(ownerState.orientation)}`]];
  },
})(
  memoTheme(({ theme }) => {
    const borderColor =
      theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600];
    return {
      display: 'block',
      borderColor: theme.vars ? theme.vars.palette.StepConnector.border : borderColor,
      variants: [
        {
          props: { orientation: 'horizontal' },
          style: {
            borderTopStyle: 'solid',
            borderTopWidth: 1,
          },
        },
        {
          props: { orientation: 'vertical' },
          style: {
            borderLeftStyle: 'solid',
            borderLeftWidth: 1,
            minHeight: 24,
          },
        },
      ],
    };
  }),
);

export type StepConnectorIcon = React.ReactElement<unknown> | string | number;

export interface StepConnectorProps
  extends StandardProps<React.HTMLAttributes<HTMLDivElement>, StepConnectorClassKey, 'children'> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<StepConnectorClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export type StepConnectorClasskey = keyof NonNullable<StepConnectorProps['classes']>;


const StepConnector = React.forwardRef<HTMLDivElement, StepConnectorProps>(function StepConnector(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxStepConnector' });
  const { className, ...other } = props;

  const { alternativeLabel, orientation = 'horizontal', activeStep } = useStepperContext();
  const { active, disabled, index, last } = useStepContext();
  const completed = activeStep > index || (index === activeStep && last) ;

  const ownerState = { ...props, alternativeLabel, orientation, active, completed, disabled };
  const classes = useUtilityClasses(ownerState);

  return (
    <StepConnectorRoot
      className={clsx(classes.root, className)}
      ref={ref as any}
      ownerState={ownerState}
      {...other}
    >
      <StepConnectorLine className={classes.line} ownerState={ownerState} />
    </StepConnectorRoot>
  );
});

export default StepConnector;