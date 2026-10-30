import { merge, uniqueId } from "lodash";
import qs from "query-string";
import { LoadingCache } from "./cache";
import { fetch } from "./client";
import {
  getWidgetItems,
  isContainer,
  isDynamicField,
  isField,
  isRecordProps,
  isRelationField,
  type BaseSchema,
  type Container,
  type DataContext,
  type Domains,
  type Field,
  type FilterFormView,
  type FilterView,
  type FormView,
  type Property,
  type RelationField,
  type Resource,
  type ResourceContext,
  type ResourceView,
  type Schema,
  type Widget,
} from "./data-types";
import { createEvalContext, evalExpr } from "./eval-context";
import { htmlToJson } from "./htmltojsx";
import { l10n } from "./l10n";
import { isPlainObject, pick } from "./objects";
import { removeEmpty } from "./removeEmpty";
import { EMPTY_OBJECT, isDevelopment } from "./constant";

export type ViewProcessor = (
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => ResourceView,
) => ResourceView | null;

const processors: ViewProcessor[] = [];

export function registerViewProcessor(processor: ViewProcessor) {
  processors.push(processor);
}

const cache = new LoadingCache<Resource | Promise<Resource>>();

function getLoadKey(name: string, ctx: any) {
  const lang = ctx.lang ?? l10n.getLocale();
  return `${name}-${lang}`;
}

interface GetResourceParams {
  context: any;
  params?: Record<string, any>;
  loader?: {
    load: (res: string) => Promise<string | object>;
    type: "xml" | "json";
  };
}

export async function getResource(
  name: string,
  { loader, ...params }: GetResourceParams,
): Promise<Resource> {
  let isNew = false;
  const search = qs.stringify({
    ...params.params,
    context: JSON.stringify(params.context),
  });

  const res = await cache.get(getLoadKey(name, params), async () => {
    isNew = true;

    if (loader) {
      let result = await loader.load(name);
      console.log("Read resource using loader: result:", result);
      if (typeof result === "string") {
        if (loader.type === "xml") {
          const widgets = htmlToJson.convert(result);
          const resource = await doProcessResource(
            widgets as unknown as InitResource,
            params,
          );
          console.log("Final resource:", resource);
          return resource;
        } else {
          result = JSON.parse(result);
        }
      }
      if (isPlainObject(result)) {
        const resource = await doProcessResource(
          result as InitResource,
          params,
        );
        return resource;
      }
      return Promise.reject("Unable to detect the loader result type");
    }

    const response = await fetch({
      url: `${name}/view${search.length ? "?" + search : ""}`,
      method: "GET",
    });
    if (!response.ok) return Promise.reject(response.text);

    if (response.headers.get("Content-Type")?.includes("xml")) {
      const widgets = htmlToJson.convert(await response.text());
      const resource = await doProcessResource(
        widgets as unknown as InitResource,
        params,
      );
      return resource;
    }
    const resource = doProcessResource(await response.json(), params);
    return resource;
  });

  if (!isNew) {
    if (params.params?.popup !== res.params?.popup) {
      const newParams = { ...res.params, ...params.params };

      const context = {
        ...res.context,
        ...params.context,
        ...newParams,
      };
      const evalContext = res.evalContext._subContext(context);

      const resource = Object.create(
        {
          ...res,
        },
        {
          ...Object.getOwnPropertyDescriptors(res),
          params: {
            value: newParams,
          },
          context: {
            value: context,
          },
          evalContext: {
            value: evalContext,
          },
        },
      );

      return resource;
    }
  }
  console.error("isDevelopment?:", isDevelopment);
  if (isDevelopment) {
    cache.delete(getLoadKey(name, params));
  }

  return res;
}

interface InitResource
  extends Omit<
    Resource,
    "type" | "get" | "evalContext" | "processWidget" | "get"
  > {}

export function processResource(res: InitResource, params?: any) {
  res = { ...res };
  return doProcessResource(res, { context: EMPTY_OBJECT, params });
}

export function doProcessResource(
  res: InitResource,
  { context: ctx, params: initParams }: Omit<GetResourceParams, "loader">,
): Resource {
  //res = { ...res };

  const resource = res as Resource;

  const context = {
    ...ctx,
    ...resource.context,
    _model: res.model ?? ctx._model,
  };

  const params = { ...initParams, ...resource.params };

  let fields = res.fields || [];
  const map = new Map(res.fields!.map((f) => [f.name, f]));
  const field = map.get.bind(map);

  ctx = createEvalContext(context, {
    field,
    helpers: {
      processWidget: (widget: Widget) => processWidget(widget, ctx),
    },
  });

  processSchema(resource, ctx);
  finishProcess(resource, ctx);
  const {
    fields: ignore,
    ...rest
  } = Object.getOwnPropertyDescriptors(resource);

  return Object.create(
    {
      add(...field: Property[]) {
        field.forEach((f) => map.set(f.name, { ...map.get(f.name), ...f }));
        fields = Array.from(map.values());
      },
      remove(...field: string[]) {
        field.forEach((f) => map.delete(f));
        fields = Array.from(map.values());
      },
    },
    {
      ...rest,
      type: {
        value: "resource",
        writable: false,
      },
      fields: {
        value: fields,
      },
      get: {
        value: field,
        writable: false,
        configurable: false,
      },
      params: {
        value: params,
        writable: false,
      },
      context: {
        value: context,
        writable: false,
        configurable: false,
      },

      evalContext: {
        value: ctx,
        writable: false,
        configurable: false,
      },
    },
  ) as Resource;

  //return resource as Resource;
}

function finishProcess(resource: Partial<Resource>, ctx: ResourceContext) {
  const views = (resource.views || [])
    .map((view) => processResourceView(view, ctx!))
    .filter(Boolean) as ResourceView[];

  views.forEach((view) => (view.model ??= resource.model));

  const filterView = views.find((view) => view.type === "filter") as
    | FilterView
    | undefined;

  (resource as any).views = views.filter((view) => view.type !== "filter");

  (resource as any).filter = filterView;

  console.log(
    "Resource views:",
    views.filter((view) => view.type !== "filter"),
  );

  return resource as Resource;
}

function processResourceView(res: Partial<ResourceView>, ctx: ResourceContext) {
  const stack: ViewProcessor[] = [
    processView,
    ...processors,
    processFormView,
    processFilterView,
  ];
  let index = -1;

  const next = () => {
    const func = stack[++index];
    if (func) {
      return func(res, ctx, next);
    }
  };

  const view = next() ?? ctx.processWidget(res);
  if(view)
    processViewFields(view as ResourceView);
  return view as ResourceView;
}

function processView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => ResourceView,
) {
  const view = next() ?? ctx.processWidget(res);
  if (view && !view.model) {
    view.model = ctx._model;
  }
  return view as ResourceView;
}

function processFormView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => ResourceView,
) {
  if (res.type === "form") {
    const form = ctx.processWidget(res) as FormView;
    form.readonly = form.readonly ?? false;
    return form;
  } else {
    return next();
  }
}

function processFilterView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => ResourceView,
) {
  if (res.type === "filter") {
    const filter = processSchema(res as FilterView, ctx);

    filter.form = filter.form
      ? (processResourceView(
          { ...filter.form, type: "filter-form", handler: "form" },
          ctx,
        ) as FilterFormView)
      : undefined;
    filter.sidebar = filter.sidebar
      ? processFilterSidebar(filter.sidebar, ctx)
      : undefined;

    if (!filter.form && !filter.sidebar) {
      return null as any;
    }
    if (typeof filter.defaults === "string") {
      filter.defaults = evalExpr(filter.defaults)(ctx) as any;
    }
    return filter;
  } else {
    return next();
  }
}

function processFilterSidebar(res: Container, ctx: ResourceContext) {
  if (res.items) {
    const container = processWidget(res!, ctx) as Container;

    function visit(widget: Widget) {
      if (!widget.widget) {
        if (isField(widget)) {
          widget.widget = widget.pType;
        }
      }
      if (isContainer(widget)) {
        widget.items.forEach(visit);
      }
      if (isRecordProps(widget.props)) {
        const vals = removeEmpty(
          pick(widget.props as any, ["multiple", "op", "value", "comp"]),
        );
        if (Object.keys(vals).length)
          Object.assign(widget, vals, { ...widget });
      }
    }

    visit(container);

    return container;
  }
}

export function processBaseWidget(schema: Widget, ctx: ResourceContext) {}

export function processWidget(schema: Widget, ctx: ResourceContext) {
  if (schema.context) {
    schema.context = evalContext(schema.context, ctx);
  }
  let isRel = false;
  if (isField(schema)) {
    const {uid: _, ...property} = ctx._field(schema.name) ?? EMPTY_OBJECT;
    
    const field = (property ? merge({...schema,...property}, schema) : schema) as Field;
  
    console.log("processWidget: field: ", schema.name, ", property:", field)
    if (!field.pType) {
      field.pType = field.name === "id" ? "int" : "string";
    }
    
    processSlots(field, ctx);

    if (isRelationField(field)) {
      isRel = true;
      processRelField(field, ctx);
    }
    Object.assign(schema, field);
  } else {
    const items = getWidgetItems(schema);
    if(items.length) {
      schema.items = items.map((widget) => processWidget(widget, ctx));
    }
    processSlots(schema, ctx);
  }
  return processSchema(schema as Schema, ctx) as Widget;
}

function processSlots(schema: Widget, ctx: ResourceContext) {
  if (schema.slots) {
    if (typeof schema.slots === "function") {
      schema.slots = schema.slots(ctx);
    }
    let slots: Record<string, Widget> = { ...schema.slots };
    Object.keys(slots)
      .filter(Boolean)
      .forEach((key) => {
        const widget = slots[key];
        if (widget) {
          slots[key] = processWidget(widget, ctx);
        } else {
          delete slots[key];
        }
      });

    schema.slots = slots;
  }
}

export function processSchema<S extends Schema>(res: S, ctx: any) {
  res.uid = uniqueId("s-");
  processBase(res, ctx);
  return res;
}

function processBase(res: BaseSchema, ctx: any) {
  if (res.props && typeof res.props === "string") {
    res.props = evalExpr(res.props)(ctx) as Schema["props"];
  }
}

export function processRelField(schema: RelationField, ctx: ResourceContext) {
  if (isDynamicField(schema)) {
    const context = {
      _model: schema.target,
      ...schema.context,
      _field(name: string) {},
    };
    const newEvalContext = ctx._subContext(context);

    const views = schema.views;
    (schema as any).views = views.map((view) =>
      processResourceView(view, newEvalContext),
    );
  }
}
function evalDomain(domain: any, ctx: ResourceContext): Domains | undefined {
  if (typeof domain === "string") {
    return evalExpr(domain)(ctx) as any;
  }
  if (typeof domain === "function") {
    return domain(ctx);
  }
  return domain;
}

function evalContext(
  context: any,
  ctx: ResourceContext,
): ResourceContext | undefined {
  if (typeof context === "string") {
    return evalExpr(context)(ctx) as any;
  }
  if (typeof context === "function") {
    return context(ctx);
  }
  return context;
}

//function wakSchema<S extends Schema>(res: S) {}

export function processContext(context: DataContext) {
  const IGNORE = [
    "$attachments",
    "_dirty",
    "_fetched",
    "_showRecord",
    "_showSingle",
    "props",
    "defaults",
  ];

  function process(_value: DataContext) {
    if (typeof _value !== "object") return _value;
    const ctx = { ..._value };
    const value = {} as any;
    for (let k in ctx) {
      const v = ctx[k];
      if (k === "id") {
        value.id = !v ? null : v;
        continue;
      }

      const ignore = IGNORE.includes(k);
      const isDummy = !ignore && k !== "$version" && k.startsWith("_");

      // ignore values
      if (ignore || k.startsWith("tr:") || typeof v === "function") {
        continue;
      } else if (isDummy) {
        //k = getBaseDummy(k);
        //value[k] = value[k] ?? v;
      }

      if (v && typeof v === "object") {
        if (Array.isArray(v)) {
          value[k] = v.map(process);
        } else {
          value[k] = process(v);
        }
      } else {
        value[k] = v;
      }
    }
    return value;
  }

  const values = process(context);
  return values;
}

function processViewFields(res: ResourceView) {
  let fields = res.fields || [];
  function visit(widget: Widget) {
    if (isField(widget)) {
      if (!fields.includes(widget.name)) {
        fields.push(widget.name);
      }
    } else {
      getWidgetItems(widget).forEach(visit);
      if (widget.slots) {
        Object.values(widget).forEach(visit);
      }
    }
  }
  visit(res);

  res.fields = fields;
}
