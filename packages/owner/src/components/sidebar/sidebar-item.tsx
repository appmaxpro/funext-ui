'use client';
import * as React from 'react';
import { styled, type Theme, type SxProps } from '@funext/ui';
import Avatar from '@funext/ui/Avatar';
import Box from '@funext/ui/Box';
import Collapse from '@funext/ui/Collapse';
import Grow from '@funext/ui/Grow';
import List from '@funext/ui/List';
import Link from '@funext/ui/Link';

import Panel from '@funext/ui/Panel';
import Text from '@funext/ui/Text';
import ExpandMoreIcon from '@funext/icons/ExpandMore';
import invariant from 'invariant';
import { SidebarItemContext, RouteContext } from '../../context';
import { getItemPath, getNavTitle } from '../../utils/navigation';
import type { Routes, OutletRoute, SidebarItemProps } from '../../utils/types';
import { Dimensions } from '~/utils/constant';

const ListItemButton = styled(List.ItemButton)(({ theme }) => ({
  borderRadius: 8,
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiText-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiSvgIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiAvatar-root': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTouchRipple-child': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
  },
  '& .MuiSvgIcon-root': {
    color: (theme.vars ?? theme).palette.action.active,
  },
  '& .MuiAvatar-root': {
    backgroundColor: (theme.vars ?? theme).palette.action.active,
  },
}));

const LIST_ITEM_ICON_SIZE = 34;
/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [DashboardSidebarPageItem API](https://mui.com/toolpad/core/api/dashboard-sidebar-page-item)
 */
function SidebarItem(props: SidebarItemProps) {
  const navigationContext = React.useContext(RouteContext);
  const pageItemContextProps = React.useContext(SidebarItemContext);

  invariant(pageItemContextProps, 'No navigation page item context provided.');

  const contextAwareProps = {
    ...pageItemContextProps,
    ...props,
  };

  const {
    item,
    href = getItemPath(navigationContext, item),
    LinkComponent: LinkComponentProp,
    expanded = false,
    selected = false,
    disabled = false,
    id,
    onClick,
    isMini = false,
    isSidebarFullyExpanded = true,
    isSidebarFullyCollapsed = false,
    renderNestedNavigation,
  } = contextAwareProps;

  const [hoveredMiniSidebarItemId, setHoveredMiniSidebarItemId] = React.useState<string | null>(
    null,
  );

  const handleClick = React.useCallback(() => {
    onClick(id, item);
  }, [id, item, onClick]);

  let nestedNavigationCollapseSx: SxProps<Theme> = { display: 'none' };
  if (isMini && isSidebarFullyCollapsed) {
    nestedNavigationCollapseSx = {
      fontSize: 18,
      position: 'absolute',
      top: '41.5%',
      right: '2px',
      transform: 'translateY(-50%) rotate(-90deg)',
    };
  } else if (!isMini && isSidebarFullyExpanded) {
    nestedNavigationCollapseSx = {
      ml: 0.5,
      transform: `rotate(${expanded ? 0 : -90}deg)`,
      transition: (theme: Theme) =>
        theme.transitions.create('transform', {
          easing: theme.transitions.easing.sharp,
          duration: 100,
        }),
    };
  }

  const hasExternalHref = href.startsWith('http://') || href.startsWith('https://');

  const LinkComponent = LinkComponentProp ?? (hasExternalHref ? 'a' : Link);

  const title = getNavTitle(item);

  const listItem = (
    <List.Item
      {...(item.children && isMini
        ? {
            onMouseEnter: () => {
              setHoveredMiniSidebarItemId(id);
            },
            onMouseLeave: () => {
              setHoveredMiniSidebarItemId(null);
            },
          }
        : {})}
      sx={{
        py: 0,
        px: 1,
        overflowX: 'hidden',
      }}
    >
      <ListItemButton
        selected={selected}
        disabled={disabled}
        li={false}
        sx={{
          px: 1.4,
          height: isMini ? 60 : 48,
        }}
        {...(item.children && !isMini
          ? {
              onClick: handleClick,
            }
          : {})}
        {...(!item.children
          ? {
              LinkComponent,
              ...(hasExternalHref
                ? {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : {}),
              href,
              onClick: handleClick,
            }
          : {})}
      >
        {item.icon || isMini ? (
          <Box
            sx={
              isMini
                ? {
                    position: 'absolute',
                    left: '50%',
                    top: 'calc(50% - 6px)',
                    transform: 'translate(-50%, -50%)',
                  }
                : {}
            }
          >
            <List.ItemIcon
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: LIST_ITEM_ICON_SIZE,
              }}
            >
              {item.icon ?? null}
              {!item.icon && isMini ? (
                <Avatar
                  sx={{
                    width: LIST_ITEM_ICON_SIZE - 7,
                    height: LIST_ITEM_ICON_SIZE - 7,
                    fontSize: 12,
                  }}
                >
                  {title
                    .split(' ')
                    .slice(0, 2)
                    .map((titleWord) => titleWord.charAt(0).toUpperCase())}
                </Avatar>
              ) : null}
            </List.ItemIcon>
            {isMini ? (
              <Text
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: Dimensions.sidebarMiniWidth - 28,
                }}
              >
                {title}
              </Text>
            ) : null}
          </Box>
        ) : null}
        {!isMini ? (
          <List.ItemText
            primary={title}
            sx={{
              ml: 1.2,
              whiteSpace: 'nowrap',
              zIndex: 1,
            }}
          />
        ) : null}
        {item.action && !isMini && isSidebarFullyExpanded ? item.action : null}
        {item.children ? <ExpandMoreIcon sx={nestedNavigationCollapseSx} /> : null}
      </ListItemButton>
      {item.children && isMini ? (
        <Grow in={id === hoveredMiniSidebarItemId}>
          <Box
            sx={{
              position: 'fixed',
              left: Dimensions.sidebarMiniWidth - 2,
              pl: '6px',
            }}
          >
            <Panel
              sx={{
                pt: 0.5,
                pb: 0.5,
                transform: 'translateY(calc(50% - 30px))',
              }}
            >
              {renderNestedNavigation(item.children)}
            </Panel>
          </Box>
        </Grow>
      ) : null}
    </List.Item>
  );

  return (
    <React.Fragment key={id}>
      {listItem}
      {item.children && !isMini ? (
        <Collapse open={expanded} unmountOnExit>
          {renderNestedNavigation(item.children)}
        </Collapse>
      ) : null}
    </React.Fragment>
  );
}

export { SidebarItem };