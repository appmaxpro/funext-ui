/**
 * @title Basic
 */
import { Box } from "../..";
import { Grid } from "../grid";
import { GridProvider } from "../grid-provider";
import { records } from "./demo-data";
import useGridState from "./useGridState";

const columns = [
  { name: "name", title: "Name", type: "String" , $headerCss: 'bg-header-min hover:bg-header-med'},
  {
    name: "category",
    title: "Category",
    type: "String",
    options: ["Storage", "Computer", "Other"],
    $headerCss: 'bg-header-min hover:bg-header-med'
  },
  { name: "color", title: "Color", type: "String", $headerCss: 'bg-header-min hover:bg-header-med' },
  {
    name: "price",
    title: "Price",
    type: "String",
    aggregate: "avg",
    $headerCss: 'bg-header-min hover:bg-header-med'
  },
];

const bulkRecords = [
  ...records,
  ...records.map((record) => ({
    ...record,
    id: record.id + records.length,
  })),
];

export default function Basic() {
  const [state, setState] = useGridState();

  return (
    <GridProvider>
      <Box style={{ display: "flex", maxHeight: 500 }}>
        <Grid
          allowColumnResize
          allowGrouping
          allowSorting
          allowSelection
          allowCheckboxSelection
          allowCellSelection
          allowColumnHide
          allowColumnOptions
          allowColumnCustomize
          onColumnCustomize={(e) => console.log("onColumnCustomize")}
          sortType="state"
          selectionType="multiple"
          records={bulkRecords}
          columns={columns}
          state={state}
          setState={setState}
          border
          headerShadow
        />
      </Box>
    </GridProvider>
  );
}
