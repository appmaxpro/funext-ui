
import styles from "./grid.module.scss";

export interface TableStyles {
  table_grid?: string;
  select_no_border?: string;
  container?: string;
  no_records?: string;
  no_columns?: string;
  has_add_new?: string;
  has_footer?: string;
  variable_rows?: string;
  overflow?: string;
  border?: string;
  rtl?: string;

  body?: string;
  addNewText?: string;
  noRecordsText?: string;
  disabled?: string;
  focusElement?: string;
  resizingColumns?: string;
  
  header?: {
    header?: string;
    headerColumnTitle?: string;
    resizable?: string;
    ascSortIcon?: string;
    headerColumnMenuIcon?: string;
    columnResizer?: string;
    sticky?: string;
    options?: string;
    shadow?: string;
    column?: {
      column?: string;
      action?: string;
      selected?: string;
    }
  },
  row?: {
    row?: string;
    selected?: string;
    inner?: string;
    draggable?: string;
    detailsRow?: string;
    editRow?: string;
    dndRow?: string;
    expandRowIcon?: string;
    footerRow?: string;
    searchRow?: string;
    dragElement?: string;
    dragging?: string;
    drag_over_current?: string;
  }
  column: {
    column?: string;
    action?: string;
    selected?: string;
    center?: string;
    no_padding?: string;
    no_padding_end?: string;
    padding?: string;
  },
  group?: {
    group?: string;
    groupRow?: string;
    selected?: string;
    groupSpacer?: string;
    groupRowContent?: string;
    groupRowIcon?: string;
  },
  footer?:{
    footer?: string;
    sticky?: string;
  }
  
}

export const defaultTableStyles:TableStyles = Object.freeze( {
  table_grid: 'table-grid',
  select_no_border: 'select_no_border',
  container: styles.container,
  no_records: styles['no-records'],
  no_columns: styles['no-columns'],
  has_add_new: styles['has-add-new'],
  has_footer: styles['has-footer'],
  variable_rows: styles['variable-rows'],
  overflow: styles['overflow'],
  border: styles['border'],
  rtl: styles.rtl,

  body: styles.body,
  addNewText: styles.addNewText,
  noRecordsText: styles.noRecordsText,
  disabled: styles.disabled,
  focusElement: styles.focusElement,
  resizingColumns: styles.resizingColumns,
  header: {
    header: styles.header,
    headerColumnTitle: styles.headerColumnTitle,
    resizable: styles.resizable,
    ascSortIcon: styles.ascSortIcon,
    headerColumnMenuIcon: styles.headerColumnMenuIcon,
    columnResizer: styles.columnResizer,
    sticky: styles.sticky,
    options: styles.options,
    shadow: styles.shadow,
    column: {
      column: styles.column,
    }
  },

  column: {
    column: styles.column,
    action: styles.action,
    no_padding: styles['no-padding'],
    no_padding_end: styles['no-padding-end'],
    padding: styles.padding,
    selected: styles.selected,
  },
  group: {
    group: styles.group,
    groupRow: styles.groupRow,
    selected: styles.selected,
    groupSpacer: styles.groupSpacer,
    groupRowContent: styles.groupRowContent,
    groupRowIcon: styles.groupRowIcon,
  },
  footer:{
    footer: styles.footer,
    sticky: styles.sticky,
  }
})

//export function mergeTableStyles()