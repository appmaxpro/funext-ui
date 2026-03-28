import { Dialog, Drawer, Text } from "@funext/ui";
import React from "react";
import { useResourceContext, useViewContext, ViewContext } from "~/context";
import { i18n, type ListViewBlock, type SearchOptions } from "~/utils";
import { FilterForm } from "./filter-form";

const panelProps = {
  sx: {
    minWidth: 320,
    minHight: "50dvh",
  },
};

export function FilterFormDrawer({ smDown }: { smDown?: boolean }) {
  const viewContext = useViewContext<ListViewBlock>();
  const {modifiers, query} = useResourceContext() 
  const {
    filterForm,
    //query,
    //modifiers,
    dataStore,
    formOpen,
    setFormOpen,
    fields,
    evalContext,
    search,
  } = viewContext;

  console.warn("FilterFormDrawer:: query", query)

  const value = React.useMemo(() => {
    return {
      dataStore: dataStore,
      view: filterForm,
      fields: fields,
      evalContext: evalContext,

      search(option?: SearchOptions) {
        return viewContext.search!(option);
      },
    };
  }, [filterForm, viewContext]);

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
      <ViewContext.Provider value={value}>
        <FilterForm.Form
          filter={query?.filter!}
          updateFilters={modifiers!.updateFilters}
          search={search!}
          onSubmit={()=> setFormOpen(false)}
          onReset={()=> setFormOpen(false)}
        />
      </ViewContext.Provider>
    </Drawer>
  );
}
