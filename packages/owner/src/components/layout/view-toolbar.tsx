import React from "react";
import {
  renderBlockItems,
  unSafeRenderBlock,
  useGetViewState,
  useViewTab,
} from "~/scope";
import { Button, Toolbar, Tooltip } from "./view-tools";

import {
  Collapse,
  Dialog,
  Drawer,
  Stack,
  Text,
  useScreenSize,
  type SxPProps,
} from "@funext/ui";
import { isEmpty } from "lodash";
import { AppBar, BackButton, Icons } from "~/components";
import {
  useFormContext,
  useResourceContext,
  useViewBlock,
  useViewContext,
  ViewContext,
} from "~/context";
import {
  DataStore,
  getBoolean,
  i18n,
  pick,
  type Block,
  type Container,
  type FormViewBlock,
  type ListViewBlock,
  type Widget,
} from "~/utils";
import type { FilterTabs, FilterWidget } from "~/utils/filter";
import { FilterSidebar } from "../../scope/filter";
import { TabFilter } from "../../scope/filter/widgets/tab-filter";
import { FilterTabsBar } from "~/scope/filter/filter-tabs-bar";
import { FilterFormDrawer } from "~/scope/filter/filter-form-drawer";
import { useRouter } from "~/hooks";

const toolbarSx: SxPProps = {
  mx: { xs: -0.75, sm: -1.5 },
};

function ViewToolbar({ children }: React.ComponentProps<typeof Toolbar>) {
  const view = useViewBlock();
  const toolbarProps = React.useMemo(() => {
    return getBoolean(view.props?.toolbar?.large);
  }, [view.props?.toolbar]);

  return toolbarProps ? (
    <Toolbar sx={toolbarSx} className="justify-between nowrap w-full" large>
      {children}
    </Toolbar>
  ) : (
    <Toolbar sx={toolbarSx} className="justify-between nowrap w-full">
      {children}
    </Toolbar>
  );
}

export function ViewAppBar() {
  const {
    view,
    filterForm,
    filterSidebar,
    query,
    dataStore,
    sideOpen,
    setSideOpen,
    formOpen,
    setFormOpen,
    evalContext,
  } = useViewContext<ListViewBlock>();

  const { mdDown, smDown } = useScreenSize();

  const appBarProps = React.useMemo(() => {
    const props = view.props?.appBar;
    const appBarProps = pick(props, [
      "color",
      "position",
      "className",
      "elevation",
    ]);

    return appBarProps;
  }, [view]);

  const router = useRouter()

  if (evalContext._popup) {
    return null;
  }

  return (
    <Stack width="100%">
      <AppBar
        className="item-enter"
        color="default"
        position="fixed"
        {...appBarProps}
      >
        <ViewToolbar>
          <BackButton onClick={()=> router.navigate("/")}/>
          <ViewTitle />
          {filterForm && (
            <Tooltip content={i18n.t("Search")}>
              <Button
                aria-label="search"
                onClick={() => setFormOpen((open) => !open)}
              >
                <Icons.Search />
              </Button>
            </Tooltip>
          )}
          {filterSidebar && (
            <Tooltip content={i18n.t("Filter")}>
              <Button
                aria-label="display more actions"
                onClick={() => setSideOpen((open) => !open)}
              >
                <Icons.Tune />
              </Button>
            </Tooltip>
          )}
        </ViewToolbar>
      </AppBar>

      {filterSidebar && (!smDown) && (
        <FilterSidebar mode={"drawer"} />
      )}
      {/*filterTabs && <FilterTabsBar tabs={filterTabs} />*/}
      {filterForm && <FilterFormDrawer smDown={smDown} />}
    </Stack>
  );
}

function ViewTitle() {
  const state = useGetViewState();
  const title = React.useMemo(() => state.title, [state]);
  return (
    <Text
      variant="h5"
      noWrap
      component="div"
      sx={{ flexGrow: 1, alignSelf: "flex-end" }}
    >
      {title}
    </Text>
  );
}
