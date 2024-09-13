//@ts-nocheck

import * as React from 'react';
import { useTheme, styled, alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import MDButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import MDToggleButton from '@mui/material/ToggleButton';
import MDToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import SvgIcon from '@mui/material/SvgIcon';
import Snackbar from '@mui/material/Snackbar';
import Menu from '@mui/material/Menu';
import MDMenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

const Root = styled('div')(({ theme }) => [
  {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    '& .MuiIconButton-root': {
      '&:hover': {
        backgroundColor: (theme.vars || theme).palette.grey[100],
      },
    },
    '& .MuiSvgIcon-root': {
      fontSize: 16,
      color: (theme.vars || theme).palette.grey[900],
    },
  },
  theme.applyDarkStyles({
    '& .MuiIconButton-root': {
      '&:hover': {
        backgroundColor: (theme.vars || theme).palette.primaryDark[700],
      },
    },
    '& .MuiSvgIcon-root': {
      color: (theme.vars || theme).palette.grey[400],
    },
  }),
]);

function DemoTooltip(props) {
  return (
    <Tooltip
      componentsProps={{
        popper: {
          sx: {
            zIndex: (theme) => theme.zIndex.appBar - 1,
          },
        },
      }}
      {...props}
    />
  );
}

const alwaysTrue = () => true;

const ToggleButtonGroup = styled(MDToggleButtonGroup)(({ theme }) => [
  theme.unstable_sx({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
      '&:not(:first-of-type)': {
        pr: '2px', // a nudge for optical alignment
      },
      '&:not(:last-of-type)': {
        pl: '2px', // a nudge for optical alignment
      },
    },
  }),
]);

const Button = styled(MDButton)(({ theme }) => ({
  height: 26,
  padding: '7px 8px 8px 8px', // 7px for optical alignment
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid',
  borderColor: alpha(theme.palette.grey[200], 0.8),
  fontSize: theme.typography.pxToRem(13),
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.primary[600],
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary[50],
    borderColor: theme.palette.primary[200],
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
  ...theme.applyDarkStyles({
    color: theme.palette.primary[300],
    borderColor: alpha(theme.palette.primary[300], 0.2),
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary[300],
    },
    '&:hover': {
      borderColor: alpha(theme.palette.primary[300], 0.5),
      backgroundColor: alpha(theme.palette.primary[500], 0.2),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  }),
}));

const MenuItem = styled(MDMenuItem)(({ theme }) => ({
  padding: theme.spacing(1),
  [`& .${menuItemClasses.selected}`]: {
    backgroundColor: theme.palette.primary[50],
  },
}));

const ToggleButton = styled(MDToggleButton)(({ theme }) => [
  theme.unstable_sx({
    height: 26,
    width: 38,
    p: 0,
    fontSize: theme.typography.pxToRem(13),
    borderRadius: '999px',
    '&.Mui-disabled': {
      opacity: 0.8,
      cursor: 'not-allowed',
    },
  }),
]);

/**
 * @param {React.Ref<HTMLElement>[]} controlRefs
 * @param {object} [options]
 * @param {(index: number) => boolean} [options.isFocusableControl] In case certain controls become unfocusable
 * @param {number} [options.defaultActiveIndex]
 */
function useToolbar(controlRefs, options = {}) {
  const { defaultActiveIndex = 0, isFocusableControl = alwaysTrue } = options;
  const [activeControlIndex, setActiveControlIndex] = React.useState(defaultActiveIndex);

  // TODO: do we need to do this during layout practically? It's technically
  // a bit too late since we allow user interaction between layout and passive effects
  React.useEffect(() => {
    setActiveControlIndex((currentActiveControlIndex) => {
      if (!isFocusableControl(currentActiveControlIndex)) {
        return defaultActiveIndex;
      }
      return currentActiveControlIndex;
    });
  }, [defaultActiveIndex, isFocusableControl]);

  // controlRefs.findIndex(controlRef => controlRef.current = element)
  function findControlIndex(element) {
    let controlIndex = -1;
    controlRefs.forEach((controlRef, index) => {
      if (controlRef.current === element) {
        controlIndex = index;
      }
    });
    return controlIndex;
  }

  function handleControlFocus(event) {
    const nextActiveControlIndex = findControlIndex(event.target);
    if (nextActiveControlIndex !== -1) {
      setActiveControlIndex(nextActiveControlIndex);
    } else {
      // make sure DCE works
      // eslint-disable-next-line no-lonely-if
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'MUI: The toolbar contains a focusable element that is not controlled by the toolbar. ' +
            'Make sure you have attached `getControlProps(index)` to every focusable element within this toolbar.',
        );
      }
    }
  }

  let handleToolbarFocus;
  if (process.env.NODE_ENV !== 'production') {
    handleToolbarFocus = (event) => {
      if (findControlIndex(event.target) === -1) {
        console.error(
          'MUI: The toolbar contains a focusable element that is not controlled by the toolbar. ' +
            'Make sure you have attached `getControlProps(index)` to every focusable element within this toolbar.',
        );
      }
    };
  }

  const { direction } = useTheme();

  function handleToolbarKeyDown(event) {
    // We handle toolbars where controls can be hidden temporarily.
    // When a control is hidden we can't move focus to it and have to exclude
    // it from the order.
    let currentFocusableControlIndex = -1;
    const focusableControls = [];
    controlRefs.forEach((controlRef, index) => {
      const { current: control } = controlRef;
      if (index === activeControlIndex) {
        currentFocusableControlIndex = focusableControls.length;
      }
      if (control !== null && isFocusableControl(index)) {
        focusableControls.push(control);
      }
    });

    const prevControlKey = direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight';
    const nextControlKey = direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft';

    let nextFocusableIndex = -1;
    switch (event.key) {
      case prevControlKey:
        nextFocusableIndex =
          (currentFocusableControlIndex - 1 + focusableControls.length) % focusableControls.length;
        break;
      case nextControlKey:
        nextFocusableIndex = (currentFocusableControlIndex + 1) % focusableControls.length;
        break;
      case 'Home':
        nextFocusableIndex = 0;
        break;
      case 'End':
        nextFocusableIndex = focusableControls.length - 1;
        break;
      default:
        break;
    }

    if (nextFocusableIndex !== -1) {
      event.preventDefault();
      focusableControls[nextFocusableIndex].focus();
    }
  }

  function getControlProps(index) {
    return {
      onFocus: handleControlFocus,
      ref: controlRefs[index],
      tabIndex: index === activeControlIndex ? 0 : -1,
    };
  }

  return {
    getControlProps,
    toolbarProps: {
      // TODO: good opportunity to warn on missing `aria-label`
      onFocus: handleToolbarFocus,
      onKeyDown: handleToolbarKeyDown,
      role: 'toolbar',
    },
  };
}

export default function DemoToolbar(props) {
  const {
    codeOpen,
    codeVariant,
    copyButtonOnClick,
    copyIcon,
    hasNonSystemDemos,
    demo,
    demoData,
    demoId,
    demoName,
    demoOptions,
    demoSourceId,
    initialFocusRef,
    onCodeOpenChange,
    onResetDemoClick,
    openDemoSource,
    showPreview,
  } = props;

  const styleSolution = null;
  const t = (str) => str;

  const hasTSVariant = demo.rawTS;
 
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMoreClose = () => {
    setAnchorEl(null);
  };

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(undefined);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleResetFocusClick = () => {
    initialFocusRef.current.focusVisible();
  };

  let showCodeLabel;
  if (codeOpen) {
    showCodeLabel = showPreview ? t('hideFullSource') : t('hideSource');
  } else {
    showCodeLabel = showPreview ? t('showFullSource') : t('showSource');
  }

  const controlRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
  ];
  // if the code is not open we hide the language controls
  const isFocusableControl = React.useCallback(
    (index) => (codeOpen ? true : index !== 1 && index !== 2),
    [codeOpen],
  );
  const { getControlProps, toolbarProps } = useToolbar(controlRefs, {
    defaultActiveIndex: 0,
    isFocusableControl,
  });

  const devMenuItems = [];
  if (process.env.DEPLOY_ENV === 'staging' || process.env.DEPLOY_ENV === 'pull-request') {
    /* eslint-disable material-ui/no-hardcoded-labels -- staging only */
    // eslint-disable-next-line react-hooks/rules-of-hooks -- process.env never changes

    if (process.env.PULL_REQUEST_ID) {
      devMenuItems.push(
        <MenuItem
          key="link-deploy-preview"
          data-ga-event-category="demo"
          data-ga-event-label={demo.gaLabel}
          data-ga-event-action="link-deploy-preview"
          component="a"
          href={`https://deploy-preview-${process.env.PULL_REQUEST_ID}--${process.env.NETLIFY_SITE_NAME}.netlify.app${router.route}/#${demoName}`}
          target="_blank"
          rel="noopener nofollow"
          onClick={handleMoreClose}
        >
          demo on PR 
        </MenuItem>,
      );
    }

    /* eslint-enable material-ui/no-hardcoded-labels */
  }

  const [stylingAnchorEl, setStylingAnchorEl] = React.useState(null);
  const stylingMenuOpen = Boolean(stylingAnchorEl);

  const handleStylingButtonClose = () => {
    setStylingAnchorEl(null);
  };

  const handleStylingSolutionChange = (eventStylingSolution) => {
    
    handleStylingButtonClose();
  };


  const handleStylingButtonClick = (event) => {
    setStylingAnchorEl(event.currentTarget);
  };

  return (
    <React.Fragment>
      <Root aria-label={t('demoToolbarLabel')} {...toolbarProps}>
        {hasNonSystemDemos && (
          <Button
            id="styling-solution"
            aria-controls={stylingMenuOpen ? 'demo-styling-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={stylingMenuOpen ? 'true' : undefined}
            onClick={handleStylingButtonClick}
            {...getControlProps(0)}
            sx={{ pr: 0.5 }}
          >
            {/*<ExpandMoreIcon />*/}
            
          </Button>
        )}
        <Fade in={codeOpen}>
          <Box sx={{ display: 'flex' }}>
            {hasNonSystemDemos && (
              <Divider orientation="vertical" variant="middle" sx={{ mx: 1, height: '24px' }} />
            )}
            <ToggleButtonGroup
              sx={{ margin: '8px 0' }}
              exclusive
              value={}
              onChange={handleCodeLanguageClick}
            >
              <ToggleButton
                value={true}
                aria-label={t('showJSSource')}
                data-ga-event-category="demo"
                data-ga-event-action="source-js"
                data-ga-event-label={demo.gaLabel}
                {...getControlProps(1)}
                // eslint-disable-next-line material-ui/no-hardcoded-labels
              >
                JS
              </ToggleButton>
              <ToggleButton
                value={}
                disabled={!hasTSVariant}
                aria-label={t('showTSSource')}
                data-ga-event-category="demo"
                data-ga-event-action="source-ts"
                data-ga-event-label={demo.gaLabel}
                {...getControlProps(2)}
                // eslint-disable-next-line material-ui/no-hardcoded-labels
              >
                TS
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Fade>
        <Box sx={{ ml: 'auto' }}>
          <Button
            aria-controls={openDemoSource ? demoSourceId : null}
            data-ga-event-category="demo"
            data-ga-event-label={demo.gaLabel}
            data-ga-event-action="expand"
            onClick={onCodeOpenChange}
            {...getControlProps(3)}
            sx={{ mr: 0.5 }}
          >
            {showCodeLabel}
          </Button>
          {demoOptions.hideEditButton ? null : (
            <React.Fragment>
              <DemoTooltip title={t('stackblitz')} placement="bottom">
                <IconButton
                  data-ga-event-category="demo"
                  data-ga-event-label={demo.gaLabel}
                  data-ga-event-action="stackblitz"
                  onClick={}
                  {...getControlProps(5)}
                  sx={{ borderRadius: 1 }}
                >
                  <SvgIcon viewBox="0 0 19 28">
                    <path d="M8.13378 16.1087H0L14.8696 0L10.8662 11.1522L19 11.1522L4.13043 27.2609L8.13378 16.1087Z" />
                  </SvgIcon>
                </IconButton>
              </DemoTooltip>
              <DemoTooltip title={t('codesandbox')} placement="bottom">
                <IconButton
                  data-ga-event-category="demo"
                  data-ga-event-label={demo.gaLabel}
                  data-ga-event-action="codesandbox"
                  onClick={}
                  {...getControlProps(4)}
                  sx={{ borderRadius: 1 }}
                >
                  <SvgIcon viewBox="0 0 1024 1024">
                    <path d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z" />
                  </SvgIcon>
                </IconButton>
              </DemoTooltip>
            </React.Fragment>
          )}
          <DemoTooltip title={t('copySource')} placement="bottom">
            <IconButton
              data-ga-event-category="demo"
              data-ga-event-label={demo.gaLabel}
              data-ga-event-action="copy"
              onClick={copyButtonOnClick}
              {...getControlProps(6)}
              sx={{ borderRadius: 1 }}
            >
              {copyIcon}
            </IconButton>
          </DemoTooltip>
          <DemoTooltip title={t('resetFocus')} placement="bottom">
            <IconButton
              data-ga-event-category="demo"
              data-ga-event-label={demo.gaLabel}
              data-ga-event-action="reset-focus"
              onClick={handleResetFocusClick}
              {...getControlProps(7)}
              sx={{ borderRadius: 1 }}
            >
              <ResetFocusIcon />
            </IconButton>
          </DemoTooltip>
          <DemoTooltip title={t('resetDemo')} placement="bottom">
            <IconButton
              aria-controls={demoId}
              data-ga-event-category="demo"
              data-ga-event-label={demo.gaLabel}
              data-ga-event-action="reset"
              onClick={onResetDemoClick}
              {...getControlProps(8)}
              sx={{ borderRadius: 1 }}
            >
              {/*<RefreshRoundedIcon />*/}
            </IconButton>
          </DemoTooltip>
          <IconButton
            onClick={handleMoreClick}
            aria-label={t('seeMore')}
            aria-owns={anchorEl ? 'demo-menu-more' : undefined}
            aria-haspopup="true"
            {...getControlProps(9)}
            sx={{ borderRadius: 1 }}
          >
            {/*<MoreVertIcon />*/}
          </IconButton>
        </Box>
      </Root>
      <Menu
        id="demo-styling-menu"
        anchorEl={stylingAnchorEl}
        open={stylingMenuOpen}
        onClose={handleStylingButtonClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          value={'fffff'}
          data-ga-event-category="demo"
          data-ga-event-action="styling-system"
          data-ga-event-label={demo.gaLabel}
          selected={styleSolution === 'ffff'}
          onClick={() => handleStylingSolutionChange('ffff')}
        >
          {styleSolution === 'ffff' && (
            ""/*<CheckIcon sx={{ fontSize: '0.85rem', ml: 'auto' }} />*/
          )}
        </MenuItem>
      </Menu>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </React.Fragment>
  );
}


interface EditToolbarRootProps {
  demoOptions: any;
  openDemoSource: any;
  side?: 'down' | 'up' | 'all';
  borderRadius?: string | number;

}

export const EditToolbarRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'demoOptions' && prop !== 'openDemoSource',
})<EditToolbarRootProps>(({ theme }) => [
  {
    display: 'none',
    maxHeight: 50,
    display: 'block',
    padding: theme.spacing(0.5, 1),
    [theme.breakpoints.up('sm')]: {
      top: 0,      
      borderRadius: '12px',
      border: `1px solid ${(theme.vars || theme).palette.divider}`,
      backgroundColor: alpha(theme.palette.grey[50], 0.2),
      transition: theme.transitions.create('border-radius'),
      ...(theme.direction === 'rtl' && {
        left: theme.spacing(1),
      }),
      ...(theme.direction !== 'rtl' && {
        right: theme.spacing(1),
      }),
    },
    variants: [
      {
        props: {side: 'down'},
        style: {
          [theme.breakpoints.up('sm')]: {
            borderTopWidth: 0,
            borderRadius: '0 0 12px 12px'
          },
        },
      },
      {
        props: {side: 'up'},
        style: {
          [theme.breakpoints.up('sm')]: {
            borderBottomWidth: 0,
            borderRadius: '12px 12px 0 0'
          },
        },
      },
    ],
  },
  theme.applyDarkStyles({
    [theme.breakpoints.up('sm')]: {
      backgroundColor: alpha(theme.palette.primaryDark[800], 0.2),
    },
  }),
]);
