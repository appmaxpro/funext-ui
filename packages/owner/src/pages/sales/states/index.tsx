import { useParams } from "react-router";
import type { SaleTargetStatesProps } from "../uitls/types";
import { DataViewList } from "~/components/views/data-view-list";
import { DataViewSingle } from "~/components/views/data-view-single";
import { SaleTargetStateBox } from "../components/sale-target";
import React from "react";

export const SaleTargetStates = React.memo((props:any) => {
  const { state_id } = useParams();

  return (
    <DataViewSingle {...props} id={state_id || "0"}>
      <SaleTargetStateBox />
    </DataViewSingle>
  );
});