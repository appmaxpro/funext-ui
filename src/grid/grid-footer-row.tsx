import React from "react";
import { ToolPanel, useClassNames} from "../core";

import * as TYPES from "./types";

import { GridColumn } from "./grid-column";
import { capitalizeWord } from "./utils";
import { useTranslation } from "./translate";
import styles from "./grid.module.scss";
import Popover from "../mui/components/Popover";

export const GridFooterRow = React.memo(function GridFooterRow(
  props: TYPES.GridRowProps,
) {
  const {
    className,
    width,
    selected,
    selectedCell,
    columns = [],
    style,
    renderer,
    data,
  } = props;
  const RowRenderer = renderer || "div";
  const rendererProps = renderer ? props : {};
  const classNames = useClassNames();

  return (
    <RowRenderer
      {...rendererProps}
      className={classNames(styles.row, styles.footerRow, className, {
        [styles.selected]: selected,
      })}
      {...((width || style) && {
        style: { width, maxWidth: width, ...style },
      })}
    >
      {columns.map((column, index) => {
        return (
          <GridFooterRowColumn
            key={column.id ?? column.name}
            selected={selectedCell === index}
            index={index}
            data={column}
            row={data}
          />
        );
      })}
    </RowRenderer>
  );
});

function GridFooterRowColumn(
  props: TYPES.GridColumnProps & { row: TYPES.GridRow },
) {
  const { index, selected, data: column, row } = props;

  const textValue = React.useMemo(() => {
    if (!column.aggregate) {
      return null;
    }
    let _value = row.aggregate[column.name];
    if (column.aggregate && column.formatter) {
      _value = column.formatter(column, _value, { [column.name]: _value });
    }
    return _value;
  }, [column, row]);

  const t = useTranslation();
  
  return (
    <GridColumn selected={selected} index={index} data={column} type="footer">
      {column.aggregate && <Popover
            offset={7}
            arrow
            placement="top"
          >
            <Popover.Handler>
              <span>{textValue}</span>
            </Popover.Handler>
            <Popover.Content>
              <ToolPanel className="rounded-md p-2 shadow">
                <span>
                  {t(capitalizeWord(column.aggregate) as TYPES.GridLabel)} :{" "}
                  {textValue}
                </span>
              </ToolPanel>
          </Popover.Content>
        </Popover>}
    </GridColumn>
  );
}
