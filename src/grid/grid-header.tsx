import React from "react";
import {
  GridHeaderColumn,
  GridHeaderColumnProps,
  ResizeHandler,
  
} from "./grid-header-column";
import { GridSearchRow } from "./grid-search-row";
import { GridColumn } from "./grid-column";
import { GridHeaderMenu, GridHeaderMenuProps } from "./grid-header-menu";
import * as TYPES from "./types";
import styles from "./grid.module.scss";
import { isRowCheck } from "./utils";
import { styled } from "..";

export interface GridHeaderProps
  extends Pick<
      TYPES.GridState,
      "selectedCols" | "columns" | "orderBy" | "groupBy"
    >,
    Pick<
      TYPES.GridProps,
      "selectionType" | "searchRowRenderer" | "searchColumnRenderer"
    > {
  className?: string;
  allColumns?: TYPES.GridColumn[];
  cellRenderer?: TYPES.Renderer;
  rowRenderer?: TYPES.Renderer;
  checkType?: GridHeaderColumnProps["checkType"];
  onCheckAll?: (checked: boolean) => void;
  onColumnResizeStart?: ResizeHandler;
  onColumnResize?: ResizeHandler;
  onColumnResizeEnd?: ResizeHandler;
  onColumnSort?: (
    e: React.SyntheticEvent,
    column: TYPES.GridColumn,
    columnIndex: number,
    sortOrder?: "asc" | "desc",
  ) => void;
  onColumnShow?: GridHeaderMenuProps["onColumnShow"];
  onColumnHide?: GridHeaderMenuProps["onColumnHide"];
  onColumnCustomize?: GridHeaderMenuProps["onColumnCustomize"];
  onColumnDrop?: GridHeaderMenuProps["onColumnDrop"];
  onColumnGroupAdd?: GridHeaderMenuProps["onColumnGroupRemove"];
  onColumnGroupRemove?: GridHeaderMenuProps["onColumnGroupRemove"];
  shadow?: boolean;
}

export const GridHeader = React.memo(function GridHeader(
  props: GridHeaderProps,
) {
  const {
    className,
    columns = [],
    allColumns = [],
    orderBy,
    checkType,
    selectionType,
    groupBy,
    searchRowRenderer,
    searchColumnRenderer,
    cellRenderer,
    rowRenderer,
    onCheckAll,
    onColumnDrop,
    onColumnSort,
    onColumnCustomize,
    onColumnShow,
    onColumnHide,
    onColumnGroupAdd,
    onColumnGroupRemove,
    onColumnResizeStart,
    onColumnResize,
    onColumnResizeEnd,
    shadow
  } = props;
  const RowRenderer = rowRenderer || GridHeaderRowRoot;
  const headerMenu = (
    allColumns && onColumnShow && onColumnHide &&
    <GridHeaderMenu
        groupBy={groupBy}
        columns={allColumns}
        onColumnShow={onColumnShow}
        onColumnHide={onColumnHide}
        onColumnCustomize={onColumnCustomize}
        onColumnDrop={onColumnDrop}
        onColumnGroupRemove={onColumnGroupRemove}
      />
  );
  return (
    <GridHeaderRoot className={className}>
      <RowRenderer className={styles.row}>
        {columns.map((column, index) => {
          const sortColumn = (orderBy || []).find(
            (col) => col.name === column.name,
          );
          const isLast = index === columns.length - 1;
          return (
            <GridHeaderColumn
              key={column.id ?? column.name}
              index={index}
              data={column}
              sort={sortColumn ? sortColumn.order : null}
              groupBy={groupBy}
              columns={allColumns}
              renderer={cellRenderer}
              onCheckAll={onCheckAll}
              onSort={onColumnSort}
              onGroup={onColumnGroupAdd}
              onUngroup={onColumnGroupRemove}
              onShow={onColumnShow}
              onHide={onColumnHide}
              onResize={onColumnResize}
              onResizeStart={onColumnResizeStart}
              onResizeEnd={onColumnResizeEnd}
              onCustomize={onColumnCustomize}
              lastHeader={isLast && headerMenu}
              {...(isRowCheck(column) ? { checkType, selectionType } : {})}

            />
          );          
        })}
        
      </RowRenderer>

      {searchRowRenderer && searchColumnRenderer && (
        <GridSearchRow
          {...{
            columns,
            searchRowRenderer,
            searchColumnRenderer,
          }}
        />
      )}      
    </GridHeaderRoot>
  );
});

const GridHeaderRoot = styled('div', {
  name: 'MuxGridHeader',
})('');

const GridHeaderRowRoot = styled('div', {
  name: 'MuxGridHeaderRow',
})('');