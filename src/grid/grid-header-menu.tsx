import React, { useCallback } from "react";
import { useClassNames } from "../core";

import {
  Box,
  Divider,
  Checkbox,
  Menu,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useRtl,
  Badge,
  Chip,
  clsx,
} from "../mui";

import { MaterialIcon } from "../icons/material-icon";
import GridDragElement, { DropHandler } from "./grid-drag-element";
import styles from "./grid.module.scss";
import { useTranslation } from "./translate";
import * as TYPES from "./types";

export interface GridHeaderMenuProps extends Pick<TYPES.GridState, "groupBy"> {
  columns?: TYPES.GridColumn[];
  onColumnShow?: (e: React.SyntheticEvent, column: TYPES.GridColumn) => void;
  onColumnHide?: (e: React.SyntheticEvent, column: TYPES.GridColumn) => void;
  onColumnCustomize?: (
    e: React.SyntheticEvent,
    column?: TYPES.GridColumn,
  ) => void;
  onColumnDrop?: DropHandler;
  onColumnGroupRemove?: (
    e: React.SyntheticEvent,
    group: TYPES.GridGroup,
  ) => void;
}

const GridGroupTag = ({
  name,
  title,
  onDrop,
  onRemove,
}: {
  name: string;
  title?: string;
  onDrop?: GridHeaderMenuProps["onColumnDrop"];
  onRemove?: GridHeaderMenuProps["onColumnGroupRemove"];
}) => {
  const data = React.useMemo(
    () => ({ name, title, $group: true }),
    [name, title],
  );
  return (
    <GridDragElement
      className={styles.groupTagWrapper}
      column={data}
      onDrop={onDrop}
    >
      <Chip
        className={styles.groupTag}
        color="primary"
        label={data.title}
        onClose={(e) => {
          e!.preventDefault();
          e!.stopPropagation();
          onRemove && onRemove(e!, data);
        }}
      />
    </GridDragElement>
  );
};

const CustomMenuItem = ({
  onEnter,
  onClick,
  padding = false,
  ...props
}: any) => {
  return (
    <MenuItem
      {...props}
      className={clsx(styles.headerMenuItem, !padding ? "p-0" : "p-2")}
      onClick={onClick}
      onKeyDown={(e: any) => {
        e.preventDefault();
        if (e.key === "Enter") {
          onClick && onClick(e);
        }
      }}
    />
  );
};

export const GridHeaderMenu = React.memo(function GridHeaderMenu({
  columns = [],
  groupBy,
  onColumnCustomize,
  onColumnShow,
  onColumnHide,
  onColumnDrop,
  onColumnGroupRemove,
}: GridHeaderMenuProps) {
  const t = useTranslation();
  const rtl = useRtl();
  const placement = rtl ? "bottom-start" : "bottom-end";

  return (
    <Menu.Button
      placement={placement}
      trigger={
        <IconButton dense>
          <MaterialIcon icon="more_vert" />
        </IconButton>
      }
      nav={false}
      listProps={{
        className: 'max-w-[300px]'
      }}
    >
      {columns
        .filter((c) => !c.action && c.title && c.hidden !== true)
        .map((column) => {
          const { visible = true } = column;
          function toggle(e: React.SyntheticEvent) {
            visible && onColumnHide && onColumnHide(e, column);
            !visible && onColumnShow && onColumnShow(e, column);
          }
          function render() {
            return (
              <Checkbox
                checked={visible}
                onChange={toggle}
                label={column.title}
                labelProps={{
                  className: 'pe-1'
                }}
              />
            );
          }
          return (
            <CustomMenuItem
              key={column.id ?? column.name}
              onClick={toggle}
              button={false}

            >
              {onColumnDrop ? (
                <GridDragElement
                  className={styles.dragColumn}
                  column={column}
                  onDrop={onColumnDrop}
                >
                  {render()}
                </GridDragElement>
              ) : (
                render()
              )}
            </CustomMenuItem>
          );
        })}

      {onColumnDrop && (
        <>
          <MenuDivider />
          <CustomMenuItem>
            <GridDragElement
              canDrag={false}
              canDrop={true}
              onDrop={onColumnDrop}
              className={styles.dragColumnArea}
              aria-disabled="true"
            >
              <Box className={styles.groupTagContainer}>
                {(groupBy || []).length === 0 && (
                  <Box className={styles.groupPlaceholder}>{t("Groups")}</Box>
                )}
                {(groupBy || []).map((group) => {
                  const column = columns.find((x) => x.name === group.name);
                  return (
                    <GridGroupTag
                      key={group.name}
                      title={column && column.title}
                      name={group.name}
                      onDrop={onColumnDrop}
                      onRemove={onColumnGroupRemove}
                    />
                  );
                })}
              </Box>
            </GridDragElement>
          </CustomMenuItem>
        </>
      )}
      {onColumnCustomize && (
        <>
          <MenuDivider />
          <CustomMenuItem
            padding
            onClick={onColumnCustomize}
          >
            {t("Customize...")}
          </CustomMenuItem>
        </>
      )}
    </Menu.Button>
  );
});
