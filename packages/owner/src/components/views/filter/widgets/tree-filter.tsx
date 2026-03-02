import { uniq } from "lodash";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  memo,
} from "react";

import {
  Box,
  List,
  Collapse,
  Text,
} from "@funext/ui";


import { ItemFilterHeader } from "./item-filter";
import { DataStore, DEFAULT_COMPLETION_PAGE_SIZE, EMPTY_ARRAY, getWidgetProp, i18n, useOptionLabel, type DataContext, type DataRecord, type Identifier, type SearchOptions } from "~/utils";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useAsync } from "~/hooks/use-async";
import type { NodeSearchFilterField } from "~/utils/filter";
import type { FilterProps } from "../types";
import { Icons } from "~/components/other/icons";

export type TreeRecord = DataRecord & {
  _level?: number;
  _selected?: boolean;
  _expand?: boolean;
  _loading?: boolean;
  _loaded?: boolean;
  children?: TreeRecord[];
  childrenCount?: number;
};

interface TreeNodeItemProps {
  root?: TreeRecord;
  data: TreeRecord[];
  selected: any[];
  expanded: any[];
  onSelect?: (root: TreeRecord) => void;
  onExpand?: (data: TreeRecord, select?: boolean) => void;
  getLabel?: (key: any) => string;
}

const TreeNodeItem = memo(function TreeNode({
  data,
  selected,
  expanded,
  onSelect,
  onExpand,
  getLabel,
}: Omit<TreeNodeItemProps, "data"> & { data: TreeRecord }) {
  const expand = expanded.includes(data.id);
  const select = selected.includes(data.id);
  const title = sanitize(getLabel?.(data) ?? i18n.get("empty"));
  return (
    <>
      <List.ItemButton
        title={title}
        selected={select}
        sx={{
          paddingLeft: `${(data._level ?? 0) * 0.75}rem`,
        }}
        onClick={() => {
          onExpand?.(data, true);
        }}
        endIcon={
          data.childrenCount && (
            (expand ? <Icons.ChevronDown/> : <Icons.ChevronRight/>)
            
          )
        }
        startIcon={
          !data.childrenCount && (
            <List.Prefix className="me-1">
              {(select ? <Icons.Checkbox className="text-primary"/> : <Icons.Blank/>)}
              
            </List.Prefix>
          )
        }
        className="py-0.5 px-1 hover:bg-hd-sm active:bg-hd-sm"
      >
        <Text noWrap>{title}</Text>
      </List.ItemButton>
      {data.children && (
        <Collapse open={expand}>
          <TreeNodeList
            data={data.children}
            onSelect={onSelect}
            onExpand={onExpand}
            getLabel={getLabel}
            expanded={expanded}
            selected={selected}
          />
        </Collapse>
      )}
    </>
  );
});

const TreeNodeList = memo(function TreeNodeList({
  data = [],
  selected,
  expanded,
  onSelect,
  onExpand,
  getLabel,
  item
}: TreeNodeItemProps & {item?: NodeSearchFilterField}) {
  return (
    <List className="w-full" >
      {item &&
        <ItemFilterHeader
          icon={getWidgetProp(item.props, "icon")}
          title={item.title}
          type={item.type}
          pType={item.pType}
        />
      }
      {data.map((record, ind) => (
        <TreeNodeItem
          key={record.id ?? `ROOT_${ind}`}
          data={record}
          selected={selected}
          expanded={expanded}
          onSelect={onSelect}
          onExpand={onExpand}
          getLabel={getLabel}
        />
      ))}
    </List>
  );
});

export function TreeFilter({
  item,
  onChange,
  toggleOpen
}: FilterProps<NodeSearchFilterField>) {
  let { rootDomain, context, parent, multiple, value, ...schema } = item;
  
  const [records, setRecords] = useState<TreeRecord[]>([]);
  const [resetCount, doReset] = useReducer((c) => c + 1, 0);
  const [selected, setSelected] = useState(EMPTY_ARRAY as Identifier[])
  const [expanded, setExpanded] = useState(EMPTY_ARRAY as Identifier[])

  //cpnst  


  const getOptionLabel = useOptionLabel(schema);

  const {
    name: fieldName,
    orderBy,
    target,
    targetName,
    domain,
    limit = DEFAULT_COMPLETION_PAGE_SIZE,
  } = schema;

  const names = useMemo(
    () =>
      uniq(
        [targetName]
          .flat()
          .filter((name) => name !== "id" && Boolean(name)),
      ) as string[],
    [targetName, parent],
  );

  const getContext = useCallback(() => {
    const ctx = context ?? {};
    return {
      ...ctx,
      _model: target,
    } as DataContext;
  }, [target]);
  // check parent/child is of same model
  const isSameModelTree = true;

  const toTreeData = useMemo(() => {
    function toTreeNode(record: TreeRecord, level = 0) {
      //level = Math.max(level, record._level ?? 0)
      const childrenCount = record["_children"];
      const children: TreeRecord[] = records
        .filter((rec) => rec[`parent.id`] === record.id)
        .map((record) => toTreeNode(record, level + 1));

      const $record = {
        ...record,
        _level: level,
        _selected: selected.includes(record.id!),
        _expand: expanded?.includes(record.id!),
        childrenCount,
        children,
      } as TreeRecord;

      return $record;
    }
    return toTreeNode;
  }, [records, selected, expanded]);

  const dataStore = useMemo<DataStore | null>(() => {
    return target
      ? new DataStore(target, {
          fields: uniq(["id", ...names]),
          order: orderBy ? orderBy.split(",") : undefined,
        })
      : null;
  }, []);

  const doSearch = useCallback(
    async ({
      parentId,
      ...options
    }: Partial<SearchOptions> & { parentId?: any } = {}) => {
      if (dataStore) {
        const { ..._domainContext } = getContext() || {};

        let _domain = domain;
        let domains:any[] = [];
        if (_domain) {
          //domains.push(`(${_domain.trim()})`);
        }

        if (!parentId && rootDomain) {
          //domains.push(`(${rootDomain.trim()})`);
        }

        return dataStore.search({
          ...options,
          context: {
            ..._domainContext,
            _field: fieldName,
            ...(parent && { _countOn: parent }),
              ...(parentId &&
                parent && {
                  _parent: {
                    _model: target,
                    id: parentId,
                  },
                }),
          },
          domain: (domains as any)
        });
      }
    },
    [dataStore, rootDomain, getContext],
  );

  const {data:result, retryFn} = useAsync((signal) => doSearch({signal}));

  const onRefresh = useCallback(async () => {
    doReset();
    await retryFn();

    const records = result?.records?.map(toTreeData);

    setRecords(() => records || []);
    setSelected(selected => []);
  }, [doReset, retryFn]);

  const onExpand = useCallback(async (data: TreeRecord, select?: boolean) => {
    if (data._loading) {
      return;
    }

    if (select === true) {
      onSelect(data);
    }

    if (!data.childrenCount) {
      return;
    }
    setExpanded((expanded) =>
      expanded.includes(data.id!)
        ? expanded.filter((id) => id !== data.id)
        : [...expanded, data.id!],
    );

    if (!data.children) {
      data._loading = true;
      doReset();
      try {
        const result = await doSearch({ parentId: data.id });
        let resultRecords = result?.records?.map((rec) => ({
          ...rec,
          ["parent.id"]: data.id,
        }));
        const newRecords =
          resultRecords?.map((rec) => toTreeData(rec, data._level ?? 0)) ?? [];
        setRecords(() => [...records, ...newRecords]);
      } finally {
        data._loading = false;
        doReset();
      }
    }
  }, []);

  const onSelect = useCallback(
    (data: TreeRecord) => {
      setSelected((selected)=> {
        const wasSelected = selected.includes(data.id!);
        function mapAll(prev: Identifier[], cur: TreeRecord): Identifier[] {
          let result = [...prev, cur.id!];
          return cur.children?.reduce(mapAll, result) || result;
        }
        const ids = mapAll([], data);
  
        let newSelected = selected.filter((id) => !ids.includes(id));
        if (!wasSelected) {
          if (!multiple) {
            newSelected = [data.id!];
          } else {
            newSelected = [...selected, data.id!];
          }
        }
        return newSelected;
      })
    },
    [selected],
  );

  useEffect(()=> {
    const records = result?.records?.map(toTreeData);

    setRecords(() => records || []);
    //setSelected(() => () => EMPTY_ARRAY as Identifier[]);
  })


  const { offset = 0, total = 0 } = dataStore?.page || {};
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="w-full" data-list="" data-filter-key={item.name}>
      <TreeNodeList
        data={records}
        expanded={expanded}
        selected={selected}
        onExpand={onExpand}
        onSelect={onSelect}
        getLabel={getOptionLabel}
        item={item}
      />
    </div>
  );
}


function sanitize(value: any): string {
  if (value == null ) return "";
  let s: string;
  if (typeof value === "object") {
    try {
      s = value.toString?.() ?? JSON.stringify(value);
    } catch {
      s = String(value);
    }
  } else {
    s = String(value);
  }
  // Strip any HTML tags, collapse whitespace and trim
  return s.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim();
}

