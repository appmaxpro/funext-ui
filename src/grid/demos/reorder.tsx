/**
 * @title Row Reorder
 */
import React from "react";
import { Button, Box } from "../..";
import { Grid } from "../grid";
import { GridProvider } from "../grid-provider";
import { columns, records } from "../demos/demo-data";
import useGridState from "./useGridState";

export default function Reorder() {
  const [state, setState] = useGridState();
  const [reorder, setReorder] = React.useState(false);
  const [striped, setStriped] = React.useState(false);

  return (
    <GridProvider>
      <Box d="flex" g={2}>
        <Button onClick={() => setReorder((flag) => !flag)}>
          Toggle reorder
        </Button>
        <Button onClick={() => setStriped((flag) => !flag)}>
          Striped
        </Button>
      </Box>
      <Grid
        allowSelection
        allowCheckboxSelection
        allowRowReorder={reorder}
        selectionType="multiple"
        records={records}
        columns={columns}
        state={state}
        setState={setState}
        striped={striped}
      />
    </GridProvider>
  );
}
