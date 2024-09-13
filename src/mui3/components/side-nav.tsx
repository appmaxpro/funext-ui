import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import {Collapse, useTheme} from '@mui/material';
import { MaterialIcon, MaterialIconProps } from '../../icons/material-icon';
import { useControlled } from '../../core';

export interface NavItemProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode | string;
  prefix?: React.ReactNode;
  items?: NavItemProps[];
  selected?: boolean;
  open?: boolean;
  secondary?:  React.ReactNode;
  onClick?: (event?:any) => void;

}

export interface SideNavPallet {
  mode?: 'dark' | 'light' | undefined;
  primary?: string;
  background?: string;
}

export interface SideNavProps{
  header?: React.ReactNode;
  footer?: React.ReactNode;
  pallet: SideNavPallet;
  items?: NavItemProps[];
  className?: string;
  components?: any;
  maxWidth?:number | string;
  Scroller?: React.ComponentType;
}

const Icon = styled(MaterialIcon)<{ component?: React.ElementType }>(()=>({}));

const FireNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
});

export default function SideNav(props: SideNavProps) {
  const {
    pallet, 
    className, 
    components, 
    header, 
    footer, 
    items,
    maxWidth=256,
    Scroller=Box
  } = props;

  const theme = useTheme();
  const navTheme = React.useMemo(()=> createTheme({
    components: {
      MuiListItemButton: {
        defaultProps: {
          disableTouchRipple: true,
        },
      },
      ...components
    },
    palette: {
      mode: pallet.mode,
      primary: { main: pallet.primary ?? theme.palette.grey[50]},
      background: { 
        paper: pallet.background ?? theme.palette.grey[50]
      },
    },
  }), [pallet, components]);

  return (
    <Box sx={{ display: 'flex' }} className={className}>
      <ThemeProvider theme={navTheme}>
        <Paper elevation={0} sx={{ maxWidth: maxWidth }}>
          <FireNav component="nav" disablePadding>
            {header}
            <Scroller>
              {items?.map((item, index) => (
                item.items && item.items.length > 0 
                  ? <NavItems key={index} {...item}/>
                  : !item.title 
                      ? <Divider key={index}/>
                      : <NavItem key={index} {...item}/>
                  ))
              }
            </Scroller>
            {footer}
          </FireNav>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}

SideNav.displayName = 'SideNav';


const ExpandIcon = styled((props: MaterialIconProps & {expand: boolean;}) => {
  const { expand, ...other } = props;
  return <Icon {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export function NavItems(props: NavItemProps) {
  const {open: wasOpen, items, title, secondary} = props;

  const [open, setOpen] = useControlled({
    name: 'open', 
    prop: 'open', 
    state: wasOpen, 
    defaultState: true 
  });

  return (
    <Box>
      <ListItemButton
        alignItems="flex-start"
        onClick={() => setOpen(!open)}
        sx={{
          px: 3,
          pt: 2.5,
          pb: open ? 0 : 2.5,
          '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
        }}
      >
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: 'medium',
            lineHeight: '20px',
            mb: '2px',
          }}
          secondary={secondary}
          secondaryTypographyProps={{
            noWrap: true,
            fontSize: 12,
            lineHeight: '16px'
          }}
          sx={{ my: 0 }}
        />
        <ExpandIcon 
            expand={open}
            icon='expand_more'/>
      </ListItemButton>
      <Collapse in={open} timeout="auto">
        {items?.map((item, index) => (
            item.items && item.items.length > 0 
              ? <NavItems key={index} {...item}/>
              : !item.title 
                ? <Divider key={index}/>
                : <NavItem key={index} {...item}/>
          ))} 
      </Collapse>
    </Box>
  ); 

}

NavItems.displayName = 'NavItems';

export function NavItem(props: NavItemProps) {
    const {selected, title, prefix, secondary, icon, onClick} = props;
    const iconsChild = icon 
        ? ( <ListItemIcon sx={{ color: 'inherit' }}>
            {icon}
          </ListItemIcon>)
        : null;

    const child =  (
      <>
        {iconsChild}
        <ListItemText
          primary={title}
          secondary={secondary}
          primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
        />
      </>
    );

    if (prefix) {
      return (
        <ListItem secondaryAction={prefix} onClick={onClick}>
          {child}
        </ListItem> 
      )
    }

    return (
      <ListItemButton
          sx={{ py: 0, minHeight: 32}}
          selected={selected}
          onClick={onClick}
        >
        {child}
      </ListItemButton>
    );

}

NavItem.displayName = 'NavItem';