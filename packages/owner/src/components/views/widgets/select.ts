import { isEqual } from "lodash";
import { useEffect, useMemo, useState } from "react";
import type { Field, Option, Schema } from "~/utils";
import { evalExpr } from "~/utils/eval-context";

export function useSimpleSelectionList(schema: Field, value?: unknown) {
  const { options = [], optionsIn } = schema;

  const filterList = useMemo(() => {
    let filterList: string[] | null = null;
    if (optionsIn && optionsIn.length > 0) {
      let expr = optionsIn.trim();
      if (!expr.startsWith("[")) {
        expr = "[" + expr + "]";
      }
      filterList = evalExpr(expr)({}) as string[];

      if (!Array.isArray(filterList) || filterList.length == 0) {
        filterList = null;
      }
    }
    return filterList;
  }, [optionsIn]);

  return useMemo(() => {
    const selectionList: Option[] = options;
    return filterList
      ? selectionList.filter(
          (item) =>
            (value !== undefined && String(value) === String(item.value)) ||
            filterList.some((x) => String(x) === String(item.value)),
        )
      : selectionList;
  }, [options, filterList, value]);
}
