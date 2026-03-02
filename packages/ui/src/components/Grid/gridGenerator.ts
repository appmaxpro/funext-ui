import { GridDirection, GridOwnerState } from './GridProps';
import { traverseBreakpoints } from './traverseBreakpoints';
import { Breakpoints, Theme } from "../../styles";
import { ResponsiveStyleValue, Spacing } from '@mui/system';

interface Props {
  theme: { breakpoints: Breakpoints; spacing?: Spacing };
  ownerState: GridOwnerState;
}

function getGetThemeBreakpoints(ownerState: GridOwnerState, theme: Props['theme']):Breakpoints  {
   if(!ownerState.media) {
    return {
      ...theme.breakpoints,
      //@ts-ignore
      ...theme.containerQueries(ownerState.containerName)
    };
   }
   return theme.breakpoints;
}

function getSelfSpacingVar(axis: 'row' | 'col') {
  return `--grid-${axis}-spacing`;
}

function getParentSpacingVar(axis: 'row' | 'col') {
  return `--grid-parent-${axis}-spacing`;
}

const selfColumnsVar = '--grid-cols';
const parentColumnsVar = '--grid-parent-cols';

export const generateGridSizeStyles = ({ theme, ownerState }: Props) => {
  const styles = {};
  traverseBreakpoints<'auto' | 'grow' | number | false>(
    getGetThemeBreakpoints(ownerState, theme),
    ownerState.size,
    (appendStyle, value) => {
      let style = {};
      if (value === 'grow') {
        style = {
          flexBasis: 0,
          flexGrow: 1,
          maxWidth: '100%',
        };
      }
      if (value === 'auto') {
        style = {
          flexBasis: 'auto',
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: 'none',
          width: 'auto',
        };
      }
      if (typeof value === 'number') {
        style = {
          flexGrow: 0,
          flexBasis: 'auto',
          width: `calc(100% * ${value} / var(${parentColumnsVar}) - (var(${parentColumnsVar}) - ${value}) * (var(${getParentSpacingVar('col')}) / var(${parentColumnsVar})))`,
        };
      }
      appendStyle(styles, style);
    },
  );
  return styles;
};

export const generateGridOffsetStyles = ({ theme, ownerState }: Props) => {
  const styles = {};
  traverseBreakpoints<number | 'auto'>(
    getGetThemeBreakpoints(ownerState, theme),
    ownerState.offset,
    (appendStyle, value) => {
      let style = {};
      if (value === 'auto') {
        style = {
          marginLeft: 'auto',
        };
      }
      if (typeof value === 'number') {
        style = {
          marginLeft:
            value === 0
              ? '0px'
              : `calc(100% * ${value} / var(${parentColumnsVar}) + var(${getParentSpacingVar('col')}) * ${value} / var(${parentColumnsVar}))`,
        };
      }
      appendStyle(styles, style);
    },
  );
  return styles;
};

export const generateGridColumnsStyles = ({ theme, ownerState }: Props) => {
  if (!ownerState.container) {
    return {};
  }
  const styles = {
    [selfColumnsVar]: 12,
  };
  traverseBreakpoints<number>(getGetThemeBreakpoints(ownerState, theme), ownerState.columns, (appendStyle, value) => {
    const columns = value ?? 12;
    appendStyle(styles, {
      [selfColumnsVar]: columns,
      '> *': {
        [parentColumnsVar]: columns,
      },
    });
  });
  return styles;
};

export const generateGridRowSpacingStyles = ({ theme, ownerState }: Props) => {
  if (!ownerState.container) {
    return {};
  }
  const styles = {};
  traverseBreakpoints<number | string>(
    getGetThemeBreakpoints(ownerState, theme),
    ownerState.rowSpacing,
    (appendStyle, value) => {
      const spacing = typeof value === 'string' ? value : theme.spacing?.(value);
      appendStyle(styles, {
        [getSelfSpacingVar('row')]: spacing,
        '> *': {
          [getParentSpacingVar('row')]: spacing,
        },
      });
    },
  );
  return styles;
};

export const generateGridColumnSpacingStyles = ({ theme, ownerState }: Props) => {
  if (!ownerState.container) {
    return {};
  }
  const styles = {};
  traverseBreakpoints<number | string>(
    getGetThemeBreakpoints(ownerState, theme),
    ownerState.columnSpacing,
    (appendStyle, value) => {
      const spacing = typeof value === 'string' ? value : theme.spacing?.(value);
      appendStyle(styles, {
        [getSelfSpacingVar('col')]: spacing,
        '> *': {
          [getParentSpacingVar('col')]: spacing,
        },
      });
    },
  );
  return styles;
};

export const generateGridDirectionStyles = ({ theme, ownerState }: Props) => {
  if (!ownerState.container) {
    return {};
  }
  const styles = {};
  traverseBreakpoints<number | string>(
    getGetThemeBreakpoints(ownerState, theme),
    ownerState.direction,
    (appendStyle, value) => {
      appendStyle(styles, { 
        flexDirection: value,
        ...(ownerState.center ? {[`${value}`.includes("column") ? 'justifyContent' :  'alignItems']: 'center'} : {} )
      });
    },
  );
  return styles;
};

export const generateGridStyles = ({ ownerState }: Props): {} => {
  return {
    minWidth: 0,
    boxSizing: 'border-box',
    ...(ownerState.container && {
      display: 'flex',
      flexWrap: 'wrap',
      ...(ownerState.wrap &&
        ownerState.wrap !== 'wrap' && {
          flexWrap: ownerState.wrap,
        }),
      gap: `var(${getSelfSpacingVar('row')}) var(${getSelfSpacingVar('col')})`,
      ...(!ownerState.media && {containerType: 'inline-size'})
    }),
  };
};

export const generateSizeClassNames = (size: GridOwnerState['size']) => {
  const classNames: string[] = [];
  //@ts-ignore
  Object.entries(size).forEach(([key, value]) => {
    if (value !== false && value !== undefined) {
      classNames.push(`grid-${key}-${String(value)}`);
    }
  });

  return classNames;
};

export const generateSpacingClassNames = (
  spacing: GridOwnerState['spacing'],
  smallestBreakpoint: string = 'xs',
) => {
  function isValidSpacing(val: GridOwnerState['spacing'] | null) {
    if (val === undefined) {
      return false;
    }
    return (
      (typeof val === 'string' && !Number.isNaN(Number(val))) ||
      (typeof val === 'number' && val > 0)
    );
  }
  if (isValidSpacing(spacing)) {
    return [`spacing-${smallestBreakpoint}-${String(spacing)}`];
  }
  if (typeof spacing === 'object' && !Array.isArray(spacing)) {
    const classNames: string[] = [];
    Object.entries(spacing).forEach(([key, value]) => {
      if (isValidSpacing(value)) {
        classNames.push(`spacing-${key}-${String(value)}`);
      }
    });
    return classNames;
  }
  return [];
};

export const generateDirectionClasses = (
  direction: ResponsiveStyleValue<GridDirection> | undefined,
): string[] => {
  if (direction === undefined) {
    return [];
  }
  if (typeof direction === 'object') {
    return Object.entries(direction).map(([key, value]) => `direction-${key}-${value}`);
  }

  return [`direction-xs-${String(direction)}`];
};