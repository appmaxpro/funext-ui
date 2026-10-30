import {
  isContainer,
  isField,
  type Container,
  type DataContext,
  type Field,
  type Identifier,
  type Property,
  type Schema,
  type ViewBlock,
  type Option,
  EMPTY_OBJECT,
} from "~/utils";
import {
  createEvalContext,
  evalExpr,
  type EvalContextOptions,
} from "~/utils/eval-context";
import type { BasicWidgetState, IFormContext, Ref } from "../types";
import React from "react";
import { generatePath } from "~/routes/router-provider";

export function getViewFields(
  view: ViewBlock | Container,
): Map<string, Property> {
  let schema: Container | undefined;
  if ("schema" in view) {
    schema = view.schema;
  } else if (isContainer(view)) {
    schema = view;
  }

  if (schema) {
    const fields = new Map();
    const visit = (widget: Schema) => {
      if (isField(widget)) {
        fields.set(widget.name, { ...widget, type: widget.pType });
      }
      if (isContainer(widget)) {
        widget.items.forEach(visit);
      }
    };

    visit(schema);
    return fields;
  }
  return new Map<string, Property>();
}

export function createViewContext(
  view: ViewBlock | Container,
  value: DataContext,
  options?: EvalContextOptions,
) {
  const fields = getViewFields(view);

  const context = createEvalContext(
    {
      value,
    },
    {
      ...options,
      field: fields.get.bind(fields),
    },
  );

  return context;
}

export function createExtendedContext(
  view: ViewBlock | Container,
  value: Ref<DataContext>,
  parent: Ref<DataContext>,
) {
  const fields = getViewFields(view);
  let extend: DataContext;
  try {
    extend = parent.current._extend(value.current, {
      field: fields.get.bind(fields),
      get _parent() {
        return parent.current;
      },
    });
  } catch (e) {
    extend = {
      ...value.current,
      get _parent() {
        return parent.current;
      },
    };
  }

  const context = createEvalContext(extend, {
    field: fields.get.bind(fields),
    get record() {
      return value.current;
    },
  });

  return context;
}

export function getWidgetStateForm(
  widget: BasicWidgetState,
): IFormContext | undefined {
  return (widget as any).form as IFormContext;
}

const allViewTypes = ["form", "list", "custom"];
const allViewModes = ["show", "edit", "new"];

export function getRouteParams(
  action: string | null = null,
  mode: string | null = null,
  id: string | null = null,
) {
  if (!action || action.startsWith("$")) return null;

  if (mode) {
    if (allViewTypes.includes(mode)) {
      if (id) return { action, id };
      if (mode === "list") return { action };
      return { action, mode };
    }
    if (allViewModes.includes(mode)) {
      if (mode === "show" && id) return { action, id };
      if (mode === "edit" && id) return { action, mode: "edit", id };
      return { action, mode: "new" };
    }
    return { action, id: id ?? mode };
  }

  if (id != null) {
    return { action, id: id ?? mode };
  }

  return { action };
}

export function getRouteUrl(
  action: string | null = null,
  mode: string | null = null,
  id: string | null = null,
) {
  const params = getRouteParams(action, mode, id);
  if (!params) return undefined;
  const url = Object.keys(params).reduce(
    (prev, key) => `${prev}/:${key}`,
    "/res",
  );
  return generatePath(url, params);
}

export function getRouteMode(
  type?: string,
  mode?: string,
  id?: string,
  prev?: any,
) {
  console.log("Try getRouteMode:", { type, mode, id });
  if (type) {
    if (type === "form" || (type === "custom" && id != null)) {
      mode = mode && allViewModes.includes(mode) ? mode : "show";
      id = mode === "new" ? "" : id;
      return { type: type, mode, id };
    }
    if (allViewTypes.includes(type)) {
      return { type };
    }
    //return { type: "list"};
  }

  if (id) {
    if (mode && allViewModes.includes(mode)) {
      return { type: "form", mode, id };
    }
    return { type: "form", mode: "show", id };
  }

  if (mode === "new") {
    return { type: "form", mode: "new", id: "" };
  }

  if (prev) {
    return { ...prev };
  }

  return { type: "list" };
}

export function isListMode(
  inMode: string | null = null,
  inId: string | null = null,
) {
  const params = getRouteParams(" ", inMode, inId);
  if (!params) {
    return false;
  }
  const { id, mode } = params;
  
  if (id || (mode && allViewModes.includes(mode))) {
     return false;
  }
  
  if(mode === 'custom') {
    return false;
  }

  return true;
  
}

export function getMediaUrl(
  targe: string,
  field: string,
  targetId?: Identifier,
) {
  const search = new URLSearchParams({
    model: targe,
    id: String(targetId),
    field,
  });
  return targetId
    ? `rest/media?${search.toString()}`
    : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
}

export function useSimpleSelectionList(schema: Field, value?: unknown) {
  const { options = [], optionsIn } = schema;

  const filterList = React.useMemo(() => {
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

  return React.useMemo(() => {
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
