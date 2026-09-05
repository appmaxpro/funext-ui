import React, { useMemo } from "react";
import { useClassNames } from "../core";
import { Checkbox, Radio, Box, clsx, styled, IconButton } from "../mui";

import { GridColumn } from "./grid-column";
import { isRowCheck, isRowExpand } from "./utils";
import { MaterialIcon } from "../icons/material-icon";
import { GridDNDRow } from "./grid-dnd-row";
import * as TYPES from "./types";
import styles from "./grid.module.scss";

export const GridBodyRow = React.memo(function GridBodyRow(
  props: TYPES.GridRowProps,
) {
  const {
    draggable,
    className,
    columns = [],
    editCell,
    selected,
    selectedCell,
    data,
    index: rowIndex,
    selectionType,
    style,
    width,
    rendererAll,
    renderer,
    cellRenderer,
    hasExpanded,
    detailsRenderer: RowDetails,
    detailsExpandIcon: ExpandIcon,
    onCellClick,
    onDoubleClick,
    onClick,
    onExpand,
    onUpdate,
  } = props;

  const expandState = useMemo(
    () => (hasExpanded ? hasExpanded(data) : { expand: Boolean(data.expand) }),
    [data, hasExpanded],
  );

  const handleUpdate = React.useCallback(
    (values: any) => {
      onUpdate && onUpdate(rowIndex, values);
    },
    [onUpdate, rowIndex],
  );

  const handleCellClick = React.useCallback(
    function handleCellClick(
      e: React.SyntheticEvent,
      cell: TYPES.GridColumn,
      cellIndex: number,
    ) {
      setTimeout(() => {
        onCellClick && onCellClick(e, cell, cellIndex, data, rowIndex);
      }, 50);
      onClick && onClick(e, data, rowIndex, cellIndex, cell);
    },
    [data, rowIndex, onCellClick, onClick],
  );

  function getColumnValue(rawValue: any, column: TYPES.GridColumn) {
    return column.formatter
      ? column.formatter(column, rawValue, data.record)
      : rawValue;
  }

  function getColumnRawValue(column: TYPES.GridColumn) {
    return column.valueGetter
      ? column.valueGetter(column, data.record)
      : data.record[column.name];
  }

  const renderColumn = React.useCallback(
    (column: TYPES.GridColumn, value: any) => {
      if (isRowCheck(column)) {
        const Comp = selectionType === "single" ? Radio : Checkbox;
        return (
          <Comp
            checked={selected}
            onChange={() => {}}
            className="m-0"
            tabIndex={-1}
            onClick={(e: any) => {
              e && e.stopPropagation();
              if (e) {
                handleCellClick(e, column, 0);
              }
            }}
          />
        );
      }
      if (isRowExpand(column)) {
        const { expand, disable } = expandState;
        return (
          <IconButton
             size="sm"
             className={clsx(styles.expandRowIcon, {
              [styles.disabled]: disable,
            })}
            onClick={(e) => {
              e.preventDefault();
              !disable && onExpand?.(data, !expand);
            }}
          >
              {ExpandIcon ? (
                <ExpandIcon expand={Boolean(expand)} />
              ) : (
                <MaterialIcon
                  icon={expand ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                />
              )}
          </IconButton>
        );
      }
      return value;
    },
    [ExpandIcon, data, expandState, onExpand, selected, selectionType],
  );

  const RowComponent = renderer || GridRowRoot;
  const rendererProps = renderer ? props : {};
  const classNames = useClassNames();
  const DragComponent: any = draggable ? GridDNDRow : React.Fragment;
  const borderWidth = 1;
  //const FinalRowComponent = draggable ? 'div' : RowComponent;

  return (
    <>
      <DragComponent {...(draggable ? { ...props, Component: GridRowRoot} : {})}>
        <RowComponent
          {...rendererProps}
          className={clsx(!draggable && styles.row, className, {
            [styles.selected]: !draggable && selected,
            [styles.inner]: draggable,
          })}
          style={style}
          onDoubleClick={draggable ? undefined : (e) =>
            onDoubleClick && onDoubleClick(e, data, rowIndex)
          }
        >
          {!rendererAll
            ? columns.map((column, index) => {
                const rawValue = getColumnRawValue(column);
                const value = getColumnValue(rawValue, column);
                return (
                  <GridColumn
                    key={column.id ?? column.name}
                    data={column}
                    index={index}
                    type="body"
                    record={data.record}
                    value={value}
                    rawValue={rawValue}
                    focus={editCell === index}
                    selected={selectedCell === index}
                    renderer={column.renderer || cellRenderer}
                    onClick={handleCellClick}
                    onUpdate={handleUpdate}
                    renderChildren={renderColumn}
                  />
                );
              })
            : null}
        </RowComponent>
      </DragComponent>
      {RowDetails && expandState?.expand && (
        <RowDetails
          className={styles.detailsRow}
          data-row-details={`${data.key}`}
          data={data}
          onClose={() => onExpand?.(data, Boolean(!expandState?.expand))}
          {...(width && {
            style: {
              width: width + borderWidth * 2, // add left + right border width
            },
          })}
        />
      )}
    </>
  );
});

const GridRowRoot = styled('div', {
  name: 'MuxGridRow',
})({

});