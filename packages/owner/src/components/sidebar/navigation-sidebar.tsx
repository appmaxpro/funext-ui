'use client';
import * as React from 'react';
import Divider from '@funext/ui/Divider';
import List from '@funext/ui/List';
import type { Routes, OutletRoute, SidebarItemContextProps } from '../../utils/types';
import {
  getItemPath,
  getNavTitle,
  hasSelectedNavChildren,
  isOutletRoute,
} from '../../utils/navigation';
import { SidebarItemContext, RouteContext } from '../../context';
import { getDrawerSxTransitionMixin } from '../../utils/ui';
import {
  SidebarItem,
} from './sidebar-item';
import { useActivePage } from '~/hooks/use-active-page';
import { Dimensions } from '~/utils/constant';

interface NavigationSidebarItemProps {
  id: string;
  item: OutletRoute;
  isExpanded: boolean;
  onClick: (itemId: string, item: OutletRoute) => void;
  depth: number;
  onLinkClick: () => void;
  isMini: boolean;
  isFullyExpanded: boolean;
  isFullyCollapsed: boolean;
  sidebarExpandedWidth: number | string;
  renderPageItem?: (item: OutletRoute, params: { mini: boolean }) => React.ReactNode;
}

/**
 * @ignore - internal component.
 */
function NavigationSidebarItem({
  id,
  item,
  isExpanded,
  onClick,
  depth,
  onLinkClick,
  isMini,
  isFullyExpanded,
  isFullyCollapsed,
  sidebarExpandedWidth,
  renderPageItem,
}: NavigationSidebarItemProps) {
  const navigationContext = React.useContext(RouteContext);

  const activePage = useActivePage();

  const isActive = !!activePage && activePage.path === getItemPath(navigationContext, item);

  // Show as selected in mini sidebar if any of the children matches path, otherwise show as selected if item matches path
  const isSelected =
    activePage && item.children && isMini
      ? hasSelectedNavChildren(navigationContext, item, activePage.path)
      : isActive && !item.children;

  const pageItemContextProps: SidebarItemContextProps = React.useMemo(
    () => ({
      expanded: isExpanded,
      selected: isSelected,
      id,
      onClick,
      isMini,
      isSidebarFullyExpanded: isFullyExpanded,
      isSidebarFullyCollapsed: isFullyCollapsed,
      renderNestedNavigation: () => (
        <NavigationSidebar
          subNavigation={item.children ?? []}
          depth={depth + 1}
          onLinkClick={onLinkClick}
          isPopover={isMini}
          sidebarExpandedWidth={sidebarExpandedWidth}
        />
      ),
    }),
    [
      depth,
      id,
      isExpanded,
      isFullyCollapsed,
      isFullyExpanded,
      isMini,
      isSelected,
      item.children,
      onClick,
      onLinkClick,
      sidebarExpandedWidth,
    ],
  );

  return (
    <SidebarItemContext.Provider value={pageItemContextProps}>
      {renderPageItem ? (
        renderPageItem(item, { mini: isMini })
      ) : (
        <SidebarItem item={item} />
      )}
    </SidebarItemContext.Provider>
  );
}

interface NavigationSidebarProps {
  subNavigation: Routes;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isPopover?: boolean;
  isFullyExpanded?: boolean;
  isFullyCollapsed?: boolean;
  hasDrawerTransitions?: boolean;
  sidebarExpandedWidth: number | string;
  renderPageItem?: (item: OutletRoute, params: { mini: boolean }) => React.ReactNode;
}

/**
 * @ignore - internal component.
 */
function NavigationSidebar({
  subNavigation,
  depth = 0,
  onLinkClick,
  isMini = false,
  isPopover = false,
  isFullyExpanded = true,
  isFullyCollapsed = false,
  hasDrawerTransitions = false,
  sidebarExpandedWidth,
  renderPageItem,
}: NavigationSidebarProps) {
  const navigationContext = React.useContext(RouteContext);

  const activePage = useActivePage();

  const initialExpandedItemIds = React.useMemo(
    () =>
      subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            isOutletRoute(navigationItem) &&
            !!activePage &&
            hasSelectedNavChildren(navigationContext, navigationItem, activePage.path),
        )
        .map(({ originalIndex }) => `page-${depth}-${originalIndex}`),
    [activePage, depth, navigationContext, subNavigation],
  );

  const [expandedItemIds, setExpandedItemIds] = React.useState(initialExpandedItemIds);

  const handlePageItemClick = React.useCallback(
    (itemId: string, item: OutletRoute) => {
      if (item.children && !isMini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter((previousValueItemId) => previousValueItemId !== itemId)
            : [...previousValue, itemId],
        );
      } else if (!item.children) {
        onLinkClick();
      }
    },
    [isMini, onLinkClick],
  );

  return (
    <List
      sx={{
        padding: 0,
        mt: isPopover && depth === 1 ? 0.5 : 0,
        mb: depth === 0 && !isPopover ? 4 : 0.5,
        pl: (isPopover ? 1 : 2) * (isPopover ? depth - 1 : depth),
        minWidth: isPopover && depth === 1 ? 240 : 'auto',
        width: isMini ? Dimensions.sidebarMiniWidth : 'auto',
      }}
    >
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          return (
            <List.Subheader
              key={`subheader-${depth}-${navigationItemIndex}`}
              sx={{
                fontSize: 12,
                fontWeight: '700',
                height: isMini ? 0 : 40,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'height')
                  : {}),
                px: 2,
                minWidth: sidebarExpandedWidth,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              {getNavTitle(navigationItem)}
            </List.Subheader>
          );
        }

        if (navigationItem.kind === 'divider') {
          const nextItem = subNavigation[navigationItemIndex + 1];

          return (
            <li key={`divider-${depth}-${navigationItemIndex}`}>
              <Divider
                sx={{
                  borderBottomWidth: 2,
                  mx: 1,
                  mt: 1,
                  mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
                  ...(hasDrawerTransitions
                    ? getDrawerSxTransitionMixin(isFullyExpanded, 'margin')
                    : {}),
                }}
              />
            </li>
          );
        }

        const pageItemId = `page-${depth}-${navigationItemIndex}`;

        return (
          <NavigationSidebarItem
            key={pageItemId}
            id={pageItemId}
            item={navigationItem}
            isExpanded={expandedItemIds.includes(pageItemId)}
            onClick={handlePageItemClick}
            depth={depth}
            onLinkClick={onLinkClick}
            isMini={isMini}
            isFullyExpanded={isFullyExpanded}
            isFullyCollapsed={isFullyCollapsed}
            sidebarExpandedWidth={sidebarExpandedWidth}
            renderPageItem={renderPageItem}
          />
        );
      })}
    </List>
  );
}

export { NavigationSidebar };