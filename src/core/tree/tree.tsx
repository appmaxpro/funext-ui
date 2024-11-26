import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { TreeHeaderColumn } from "./tree-column";
import { RootDroppable, TreeNode } from "./tree-node";
import { useClassNames } from "../styles";
import * as TYPES from "./types";
import styles from "./tree.module.scss";

function toNode({
  $key,
  ...record
}: any): TYPES.TreeNode {
  return {
    $key: $key,
    id: record.id,
    data: record,
    children: record._children,
    level: 0,
  };
}

function getChildrenList(data: any, parent: any): number[] {
  const collectChildrenIds = (parent: any): any => {
    return data
      .filter((item: any) => item.parent === parent)
      .reduce(
        (list: any[], item: any): any => [
          ...list,
          item.$key,
          ...collectChildrenIds(item.$key),
        ],
        [],
      );
  };
  return collectChildrenIds(parent);
}

function getParentList(data: any, parent: any): number[] {
  const collectParentIds = (parent: any): any => {
    if (!parent) return [];
    return data
      .filter((item: any) => item.$key === parent)
      .reduce(
        (list: any[], item: any): any => [
          ...list,
          item.$key,
          ...collectParentIds(item.parent),
        ],
        [],
      );
  };
  return collectParentIds(parent);
}

export function Tree(props: TYPES.TreeProps) {
  const {
    className,
    sortable,
    onLoad,
    onSort,
    columns,
    records,
    nodeRenderer,
    textRenderer
  } = props;
  const [data, setData] = useState<TYPES.TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortColumns, setSortColumns] = useState<TYPES.TreeSortColumn[] | null>(
    null,
  );
  const loadedRef = useRef<Record<string, boolean>>({});

  const selectRow = useCallback((index: number) => {
    setData((data) =>
      data.map((row, i) => {
        if (i === index) {
          return { ...row, selected: true };
        }
        return row.selected ? { ...row, selected: false } : row;
      }),
    );
  }, []);

  const handleSort = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, column: TYPES.TreeColumn) => {
      setSortColumns((sortColumns) => {
        if (!sortColumns) {
          sortColumns = [];
        }
        const exist = sortColumns.find((c) => c.name === column.name);
        if (exist) {
          if (!e.shiftKey) {
            sortColumns = [exist];
          }
          return sortColumns.map((col) => {
            if (col.name === column.name) {
              return { ...col, order: col.order === "asc" ? "desc" : "asc" };
            }
            return col;
          });
        }
        return [
          ...(e.shiftKey ? sortColumns : []),
          {
            name: column.name,
            order: "asc",
          },
        ];
      });
    },
    [],
  );

  const handleToggle = useCallback(
    async function handleToggle(record: any, index: number, isHover = false) {
      let loaded = loadedRef.current[record.$key];
      if (!loaded && record.children && onLoad) {
        loadedRef.current[record.$key] = true;
        
        try {
          setLoading(true);
          const children = await onLoad(record, sortColumns || []);
          loaded = true;
          setData((data) => {
            const index = data.findIndex((item) => item.$key === record.$key);
            return [
              ...data.slice(0, index + 1),
              ...children.map((item: any) => ({
                ...toNode(item),
                parent: record.$key,
              })),
              ...data.slice(index + 1),
            ];
          });
        } finally {
          setLoading(false);
        }
      }
      loadedRef.current[record.$key] = loaded;
      const updateKey = isHover ? "hover" : "selected";
      setData((data) =>
        data
          .map((row) => (row[updateKey] ? { ...row, [updateKey]: false } : row))
          .map((row) =>
            row.$key === record.$key
              ? {
                  ...row,
                  [updateKey]: true,
                  expanded: !record.expanded,
                }
              : (record.childrenList || []).includes(row.$key)
                ? { ...row, hidden: Boolean(record.expanded) }
                : row,
          ),
      );
    },
    [onLoad, sortColumns],
  );

  const handleSelect = useCallback(
    async function handleSelect(_: any, record: any, index: number) {
      if (record.children) {
        await handleToggle(record, index);
      } else {
        selectRow(index);
      }
    },
    [handleToggle, selectRow],
  );


  const handleNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex: number = data.findIndex((row) => row.selected);
    let activeIndex = currentIndex;

    if (activeIndex > -1) {
      switch (e.key) {
        case "Enter":
          return handleSelect({}, data[activeIndex], activeIndex);
        case "ArrowUp":
          for (let i = 0; i < data.length; i++) {
            if (i < currentIndex && !data[i].hidden) {
              activeIndex = i;
            }
          }
          break;
        case "ArrowDown":
          for (let i = 0; i < data.length; i++) {
            if (i > currentIndex && !data[i].hidden) {
              activeIndex = i;
              break;
            }
          }
          break;
      }
    }

    selectRow(Math.max(0, activeIndex));
  };

  useEffect(() => {
    // reset loaded state
    loadedRef.current = {};

    const [sortColumn] = sortColumns || [];
    setData(
      (sortColumn && !onSort
        ? [...records].sort((r1, r2) => {
            const v1 = r1[sortColumn.name];
            const v2 = r2[sortColumn.name];
            if (v1 > v2) return sortColumn.order === "asc" ? 1 : -1;
            if (v1 < v2) return sortColumn.order === "asc" ? -1 : 1;
            return 0;
          })
        : [...records]
      ).map(toNode),
    );
  }, [records, sortColumns, onSort]);

  useEffect(() => {
    onSort && sortColumns && onSort(sortColumns);
  }, [sortColumns, onSort]);


  const classNames = useClassNames();

  const $data = useMemo(() => {
    return data.map((item: any) => {
      const childrenList = getChildrenList(data, item.$key);
      const parentList = getParentList(data, item.parent);
      return {
        ...item,
        ...(loadedRef.current[item.$key]
          ? {
              children: childrenList.length ? true : false,
            }
          : {}),
        level: parentList.length,
        childrenList,
      };
    });
  }, [data]);
  
  $data.forEach(console.log);

  return (
    <div
      className={classNames("table-tree", className, styles.tree, {
        [styles.loading]: loading,
      })}
      tabIndex={0}
      onKeyDown={handleNavigation}
    >
      
      <div className={styles.body}>
        {$data.map(
          (row, rowIndex) =>
            !row.hidden && (
              <TreeNode
                key={rowIndex}
                index={rowIndex}
                columns={columns}
                data={row}
                renderer={nodeRenderer}
                textRenderer={textRenderer}
                onToggle={handleToggle}
                onSelect={handleSelect}
              />
            ),
        )}
      </div>
    </div>
  );
}
