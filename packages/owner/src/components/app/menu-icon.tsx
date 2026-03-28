import { Box, IconButton, Tooltip, useRtl, useScreenSize } from "@funext/ui";
import { useMemo } from "react";
import type { Navigation, NavRoute } from "~/utils";
import { Icons } from "~/components/shared/icons";

import { i18n } from "~/utils/i18n";
import { useRouter } from "~/hooks/use-router";
import { useActivePageRoute } from "~/hooks";

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
  const route = useActivePageRoute()!;
  const {mdDown} = useScreenSize()
  const router = useRouter()
  //console.log("MenuIon::route:", route)
  const navigation = useMemo(() => flatNavigation([], navigationProps), []);

  if (mdDown && showBack && route && (route.parent && route.parent.parent)) {
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
            onClick={()=> router.navigate(-1)}
          >
            {rtl ? <Icons.ArrowForward /> : <Icons.ArrowBack />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  if (!hideNavigation && navigation.includes(route)) {
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
            {isExpanded ? <Icons.MenuOpen /> : <Icons.Menu />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  
}
