import React from "react";
import { useGetViewState } from "~/scope";
import { Button, Toolbar, Tooltip } from "./view-tools";

import {
  Badge,
  Text,
  useLazyRef,
  useScreenSize,
  type SxPProps,
} from "~/ui";
import { AppBar, BackButton, Icons } from "~/components";
import { useViewBlock, useViewContext } from "~/context";
import { useRouter } from "~/hooks";
import { FilterFormDrawer } from "~/scope/filter/filter-form-drawer";
import { getBoolean, i18n, pick, type ListViewBlock } from "~/utils";
import { FilterSidebar } from "../../scope/filter";

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


export function ViewAppBar(props?:any) {
  const { view, filters, evalContext } = useViewContext<ListViewBlock>();

  const { filterForm, filterSidebar, formActive, sideActive, setSideOpen, setFormOpen } =
    filters;
  const { mdDown, smDown } = useScreenSize();
  const popup = useLazyRef(() => evalContext._popup);
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

  const router = useRouter();

  if (evalContext._popup) {
    console.log("ViewAppBar: evalContext:", evalContext);
    //return <span>popup</span>;
  }

  return (
    <AppBar
      className="item-enter"
      color="default"
      position="fixed"
      {...appBarProps}
      {...props}
    >
      <ViewToolbar>
        <BackButton onClick={() => router.navigate("/")} />
        <ViewTitle />
        {filterForm && (
          <Tooltip content={i18n.t("Search")}>
            <Button
              aria-label="search"
              onClick={() => setFormOpen((open) => !open)}
            >
              <Badge color="success" variant="dot" invisible={!formActive}>
                <Icons.Search />
              </Badge>
              
            </Button>
          </Tooltip>
        )}
        {filterSidebar && (
          <Tooltip content={i18n.t("Filter")}>
            <Button
              aria-label="display more actions"
              onClick={() => setSideOpen((open) => !open)}
            >
              <Badge color="success" variant="dot" invisible={!sideActive}>
                <Icons.Tune />
              </Badge>
              
            </Button>
          </Tooltip>
        )}
      </ViewToolbar>
      {filterSidebar && !smDown && <FilterSidebar mode={"drawer"} />}
      {/*filterTabs && <FilterTabsBar tabs={filterTabs} />*/}
      {filterForm && <FilterFormDrawer smDown={smDown} />}
    </AppBar>
  );
}

function ViewTitle() {
  const state = useGetViewState();
  const title = React.useMemo(() => state.title, [state]);
  return (
    <Text variant="h5" noWrap component="div" className="grow">
      {title}
    </Text>
  );
}
