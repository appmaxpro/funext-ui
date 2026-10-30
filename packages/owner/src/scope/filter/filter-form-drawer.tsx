import { Dialog, Drawer, Text } from "~/ui";
import React from "react";
import { useResourceContext, useViewContext, ViewContext } from "~/context";
import { i18n, type ListViewBlock, type SearchOptions } from "~/utils";
import { FilterForm } from "./filter-form";
import { ErrorBoundary } from "~/components/app/error-boundary";
import { ErrorBox } from "~/components";

const panelProps = {
  sx: {
    minWidth: 320,
    minHight: "50dvh",
  },
};

export function FilterFormDrawer({ smDown }: { smDown?: boolean }) {
  const viewContext = useViewContext<ListViewBlock>();
  const { filters, dataStore, fields, search, getContext } = viewContext;

  const { modifiers, query, filterForm, formOpen, setFormOpen } = filters!;

  //console.warn("FilterFormDrawer:: filterForm", filterForm)

  const value = React.useMemo(() => {
    return {
      dataStore: dataStore,
      view: filterForm,
      fields: fields,
      get evalContext() {
        return viewContext.evalContext;
      },
      getContext,
      search,
    };
  }, [filterForm, viewContext]);
  
  const updateFilters = React.useCallback((filter: any) => {
    setFormOpen(false);
    return modifiers!.updateFilters(filter);
  }, [modifiers])

  if (!modifiers) return null;
  
  return (
    <Drawer
      open={formOpen}
      //onOpenChange={(open:boolean) => !open && setFormOpen(false)}
      onClose={() => setFormOpen(false)}
      direction={smDown ? "bottom" : "end"}
      fullWidth={smDown}
      fullScreen={smDown}
      strategy="fixed"
      panelProps={panelProps}
    >
      <Dialog.Header onClose={() => setFormOpen(false)} className="p-2">
        <Text variant="h6">{i18n.t("Search Form")}</Text>
      </Dialog.Header>
      <ErrorBoundary fallback={ErrorBox}>
        <ViewContext.Provider value={value}>
          <FilterForm.Form
            filter={query?.filter!}
            updateFilters={updateFilters}
            search={search!}
            onSubmit={() => setFormOpen(false)}
            onReset={() => setFormOpen(false)}
          />
        </ViewContext.Provider>
      </ErrorBoundary>
    </Drawer>
  );
}
