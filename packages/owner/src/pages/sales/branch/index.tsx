import { useParams } from "react-router";
import type { SaleTargetStatesProps } from "../types";
import { DataViewList } from "~/scope/views/data/data-view-list";
import { DataViewSingle } from "~/scope/views/data/data-view-single";
import { SaleTargetBranchBox } from "../components/sale-target";
import React from "react";


export const SaleTargetBranches = React.memo((props: any) => {
    const {branch_id} = useParams()
    

    return <DataViewSingle {...props} id={branch_id!}>
         <SaleTargetBranchBox/>
    </DataViewSingle>
})
