/**
 * @title Custom Renderer
 */
import { Box, clsx } from "../..";
import { Grid, GridColumn, GridRowProps } from "..";
import { columns, records } from "./demo-data";
import useGridState from "./useGridState";
import { useCallback } from "react";

function getColumnValue(rawValue: any, column: GridColumn, record?: any) {
  return column.formatter
    ? column.formatter(column, rawValue, record)
    : rawValue;
}

function getColumnRawValue(column: GridColumn, record?: any) {
  return column.valueGetter
    ? column.valueGetter(column, record)
    : record[column.name];
}

function CustomRowRenderer({
  className,
  columns,
  data,
  onClick,
  onDoubleClick,
  onCellClick,
  selected,
  index,
}: GridRowProps) {

  const handleCellClick = useCallback(
    function handleCellClick(
      e: React.SyntheticEvent,
      cell: GridColumn,
      cellIndex: number,
    ) {
      setTimeout(() => {
        onCellClick && onCellClick(e, cell, cellIndex, data, index);
      }, 50);
      onClick && onClick(e, data, index, cellIndex, cell);
    },
    [data, index, onCellClick, onClick],
  );
  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        padding: 4,
        margin: 4,
        float: "left",
        width: 240,
      }}
      onClick={
        (e) => handleCellClick(e, columns![0], 0)
      }
      {...{ className: clsx(className, selected && "bg-hd-md") }}
    >
      {columns?.map((column, index) => {
        const rawValue = getColumnRawValue(column, data.record);
        const value = getColumnValue(rawValue, column, data.record);
        return <span>{value}</span>;
      })}
    </li>
  );
}

function CustomCellRenderer({ className, style, data, children }: any) {
  return (
    <li
      className={className}
      style={{
        ...style,
        minWidth: null,
        width: null,
        border: "none",
      }}
    >
      {data.title} : {children}
    </li>
  );
}

function CustomHeaderRenderer() {
  return null;
}

export default function Renderer() {
  const [state, setState] = useGridState();

  return (
    <Box>
      <Grid
        allowSelection={true}
        allowCellSelection
        selectionType="multiple"
        records={records}
        columns={columns}
        state={state}
        setState={setState}
        rowRendererAll
        headerRowRenderer={CustomHeaderRenderer}
        rowRenderer={CustomRowRenderer}
        cellRenderer={CustomCellRenderer}
        bodyAs="ul"
      />
    </Box>
  );
}
