import { Box, IconButton, Tooltip, useRtl, useScreenSize } from "@funext/ui";
import { useMemo } from "react";
import { useActivePage } from "~/hooks/use-active-page";
import type { Navigation, NavRoute } from "~/utils/types";
import MenuOpenIcon from "@funext/icons/MenuOpen";
import MenuIcon from "@funext/icons/Menu";
import ArrowForward from "@funext/icons/ArrowForward";
import ArrowBack from "@funext/icons/ArrowBack";

import { i18n } from "~/utils/i18n";
import { useNavigate } from "react-router";

function flatNavigation(prev: Navigation, navigation?: Navigation): Navigation {
  if (navigation) {
    navigation.reduce((prev: any[], next) => {
      const item = next as NavRoute;
      if (
        (!item.type && item.showNav !== false) ||
        (item.type && item.type !== "sidebar")
      ) {
        prev.push(item);
        flatNavigation(prev, item.children);
      }
      return prev;
    }, prev);
  }

  return prev;
}

export function MenuIon({
  isExpanded,
  navigation: navigationProps,
  showBack,
  hideNavigation,
  toggleNavigationExpanded,
}: {
  isExpanded: boolean;
  navigation?: Navigation;
  showBack: boolean;
  hideNavigation: boolean;
  toggleNavigationExpanded: () => void;
}) {
  const rtl = useRtl();
  const { navItem, root } = useActivePage()!;
  const {mdDown} = useScreenSize()
  const navigate = useNavigate()

  const navigation = useMemo(() => flatNavigation([], navigationProps), []);

  if (mdDown && showBack && navItem !== root) {
    return (
      <Box sx={{ mr: 1 }}>
        <Tooltip
          content={i18n.get("Back...")}
          hoverProps={{
            delay: {
              open: 1000,
              close: 0,
            },
          }}
        >
          <IconButton
            aria-label={`back navigation menu`}
            onClick={()=> navigate(-1)}
          >
            {rtl ? <ArrowForward /> : <ArrowBack />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  if (!hideNavigation && navigation.includes(navItem)) {
    const expandMenuActionText = "Expand";
    const collapseMenuActionText = "Collapse";

    return (
      <Box sx={{ mr: 1 }}>
        <Tooltip
          content={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          hoverProps={{
            delay: {
              open: 1000,
              close: 0,
            },
          }}
        >
          <IconButton
            aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
            onClick={toggleNavigationExpanded}
          >
            {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  
}
