import { merge, uniqueId } from "lodash";
import qs from "query-string";
import { LoadingCache } from "./cache";
import { fetch } from "./client";
import {
  getWidgetItems,
  isContainer,
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
import { isDevelopment } from "./constant";

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
) {
  let isNew = false;
  const search = qs.stringify({
    ...params.params,
    context: JSON.stringify(params.context),
  });

  const res = cache.get(getLoadKey(name, params), async () => {
    isNew = true;

    if (loader) {
      let result = await loader.load(name);
      console.log("Read resource using loader: result:", result);
      if (typeof result === "string") {
        if (loader.type === "xml") {
          const widgets = htmlToJson.convert(result);
          const resource = await processResource(
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
        const resource = await processResource(result as InitResource, params);
        return resource;
      }
      return Promise.reject("Unable to detect the loader result type");
    }

    const response = await fetch({
      url: `resources/${name}${search.length ? "?" + search : ""}`,
      method: "GET",
    });
    if (!response.ok) return Promise.reject(response.text);

    if (response.headers.get("Content-Type")?.includes("xml")) {
      const widgets = htmlToJson.convert(await response.text());
      const resource = await processResource(
        widgets as unknown as InitResource,
        params,
      );
      return resource;
    }
    const resource = await processResource(await response.json(), params);
    return resource;
  });

  if (!isNew) {
    let resource = await res;
    if (params.params?.popup !== resource.params?.popup) {
      resource = Object.create({
        ...res,
        params: { ...resource.params, ...params.params },
      });
      const get = Object.getOwnPropertyDescriptor(resource, "get")!;
      const context = {
        ...resource.context,
        ...params.context,
        _model: resource.model,
      };
      const evalContext = resource.evalContext._subContext(context);
      Object.defineProperties(resource, {
        get,
        context: {
          value: context,
          writable: false,
          configurable: false,
        },
        evalContext: {
          value: evalContext,
          writable: false,
          configurable: false,
        },
      });
      return resource;
    }
  }

  if (isDevelopment) {
    const realResource = await res;
    cache.delete(name);
    return realResource;
  }

  return res;
}

interface InitResource
  extends Omit<Resource, "type" | "filter" | "get" | "evalContext"> {}

export async function processResource(
  res: InitResource,
  { context: ctx, params: initParams }: GetResourceParams,
): Promise<Resource> {
  res = { ...res };

  const resource = res as Resource;

  const context = processContext({
    ...ctx,
    ...resource.context,
    _model: res.model ?? ctx._model,
  });

  const params = { ...initParams, ...resource.params };

  const fields = res.fields || [];
  const map = new Map(res.fields!.map((f) => [f.name, f]));
  const field = map.get.bind(map);

  ctx = createEvalContext(context, {
    helpers: {
      field,
      processWidget: (widget: Widget) => processWidget(widget, ctx),
    },
  });

  processSchema(resource, ctx);
  await finishProcess(resource, ctx);
  const { filter, views, fields: ignore, ...rest } = resource;

  return Object.defineProperties(
    { ...rest },
    {
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
      filter: {
        value: filter,
        writable: false,
      },
      views: {
        value: views,
        writable: false,
      },
    },
  ) as Resource;

  //return resource as Resource;
}

async function finishProcess(
  resource: Partial<Resource>,
  ctx: ResourceContext,
) {
  const viewPromise = (resource.views || []).map((view) =>
    processResourceView(view, ctx!),
  );

  const views = (await Promise.all(viewPromise)).filter(
    Boolean,
  ) as ResourceView[];

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

function createProxyContext<Context extends object>(context: Context) {
  return new Proxy<Context>(context, {
    get: Reflect.get,
    set: Reflect.set,
    has: Reflect.has,
  });
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
  if (isField(schema)) {
    const property = ctx._field(schema.name);
    const field = (property ? merge(schema, property) : schema) as Field;
    property && !field.pType && (field.pType = property.pType);
    schema = field;
    if (!field.pType) {
      field.pType = field.name === "id" ? "int" : "string";
    }
    if (isRelationField(field)) {
      processRelField(field, ctx);
    }
  }
  getWidgetItems(schema).map((widget) => processWidget(widget, ctx));

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

  return processSchema(schema as Schema, ctx) as Widget;
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
   if(schema.views) {
      
      const context = {
        _model: schema.target,
        ...evalContext(schema.context, ctx),
        _field(name: string) {

        }
      }
      const newEvalContext = ctx._subContext(context);
      
      const views = schema.views;
      schema.views = views.map(view => processResourceView(view, newEvalContext)) 
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

function evalContext(context: any, ctx: ResourceContext): ResourceContext | undefined {
   if (typeof context === "string") {
    return evalExpr(context)(ctx) as any;
  }
  if (typeof context === "function") {
    return context(ctx);
  }
  return context;
}


function wakSchema<S extends Schema>(res: S) {}

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

    const value = { ..._value };
    for (let k in value) {
      const v = value[k];
      const ignore = IGNORE.includes(k);
      const isDummy = !ignore && k !== "$version" && k.startsWith("_");

      // ignore values
      if (
        ignore ||
        k.startsWith("$t:") ||
        k.startsWith("tr:") ||
        typeof v === "function"
      ) {
        delete value[k];
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
      }
    }

    // set dummy id to null
    if (typeof value?.id === "number" && value.id < 0) {
      return { ...value, id: null };
    } else if (value?.id === "") {
      return { ...value, id: null };
    }

    return value;
  }

  const values = process(context);
  return values;
}
