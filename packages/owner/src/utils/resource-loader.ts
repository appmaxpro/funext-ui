import { uniqueId } from "lodash";
import { LoadingCache } from "./cache";
import { fetch } from "./client";
import {
  isContainer,
  isField,
  type BaseSchema,
  type Container,
  type DataContext,
  type FilterView,
  type FormView,
  type Property,
  type Resource,
  type ResourceContext,
  type ResourceView,
  type Schema,
  type Widget,
} from "./data-types";
import { l10n } from "./l10n";
import qs from "query-string";
import {
  createEvalContext,
  createSubEvalContext,
  evalExpr,
} from "./eval-context";
import { getDefaults } from "./filter";
import { mergeProps } from "./merge-props";

export type ViewProcessor = (
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => Promise<ResourceView>,
) => Promise<ResourceView | null>;

const processors: ViewProcessor[] = [];

export function registerViewProcessor(processor: ViewProcessor) {
  processors.push(processor);
}

const cache = new LoadingCache<Promise<Resource>>();

function getLoadKey(name: string, ctx: any) {
  const lang = ctx.lang ?? l10n.getLocale();
  return `${name}-${lang}`;
}

interface GetResourceParams {
  context: any;
  params?: Record<string, any>;
}

export async function getResource(name: string, params: GetResourceParams) {
  let isNew = false;
  const search = qs.stringify({
    ...params.params,
    context: JSON.stringify(params.context),
  });

  const res = cache.get(getLoadKey(name, params), async () => {
    isNew = true;

    const res = await fetch({
      url: `resources/${name}${search.length ? "?" + search : ""}`,
      method: "GET",
    });
    return finishProcess(await processResource(await res.json(), params));
  });

  if (!isNew) {
    let resource = await res;
    if (params.params?.popup !== resource.params?.popup) {
      resource = Object.create({
        ...res,
        params: { ...resource.params, ...params.params },
      });
      const get = Object.getOwnPropertyDescriptor(resource, "get")!;
      const context = { ...params.context, _model: resource.model };
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

  return res;
}

interface InitResource
  extends Omit<Resource, "type" | "filter" | "get" | "evalContext"> {}

export function processResource(
  res: InitResource,
  { context: ctx, params: initParams }: GetResourceParams,
) {
  res = Object.create(res);

  const resource = res as Resource;

  const context = processContext({
    ...ctx,
    ...resource.context,
    _model: res.model ?? ctx._model,
  });
  
  const params = { ...initParams, ...resource.params };

  res.fields = res.fields || [];
  const map = new Map(res.fields!.map((f) => [f.name, f]));
  const getField = map.get.bind(map);

  ctx = createEvalContext(context, {
    helpers: {
      getField,
      processWidget: (widget: Widget) => processWidget(widget, ctx),
    },
  });

  Object.defineProperties(resource, {
    type: {
      value: "resource",
      writable: false,
    },
    get: {
      value: getField,
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
  });

  processSchema(resource, ctx);

  return resource as Resource;
}

async function finishProcess(resource: Resource) {
  const ctx = resource.evalContext;
  const viewPromise = (resource.views || []).map((view) =>
    processResourceView(view, ctx),
  );
  const views = (await Promise.all(viewPromise)).filter(
    Boolean,
  ) as ResourceView[];

  resource.views = views.filter((view) => view.type !== "filter");

  const filterView = views.find((view) => view.type === "filter") as
    | FilterView
    | undefined;
  
  resource.filter = filterView;
  return resource;
}

function createProxyContext<Context extends object>(context: Context) {
  return new Proxy<Context>(context, {
    get: Reflect.get,
    set: Reflect.set,
    has: Reflect.has,
  });
}

async function processResourceView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
) {
  const stack: ViewProcessor[] = [
    ...processors,
    processFormView,
    processFilterView,
  ];
  let index = -1;

  const next = async () => {
    const func = stack[++index];
    if (func) {
      return await func(res, ctx, next);
    }
  };

  const view = await next();

  return view as ResourceView;
}

async function processFormView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => Promise<ResourceView>,
) {
  if (res.type === "form") {
    const form = ctx.processWidget(res) as FormView;
    form.readonly = form.readonly ?? false;
    return form;
  } else {
    return next();
  }
}

async function processFilterView(
  res: Partial<ResourceView>,
  ctx: ResourceContext,
  next: () => Promise<ResourceView>,
) {
  if (res.type === "filter") {
    const filter = processSchema(res as FilterView, ctx);

    filter.form = filter.form
      ? ((await processResourceView(filter.form, ctx)) as FormView)
      : undefined;
    filter.sidebar = filter.sidebar
      ? processFilterSidebar(filter.sidebar, ctx)
      : undefined;

    if (!filter.form && !filter.sidebar) {
      return null as any;
    }
    filter.defaults = getDefaults({
      widget: "group",
      items: [filter.form, filter.sidebar].filter(Boolean),
    } as any);

    return filter;
  } else {
    return next();
  }
}

function processFilterSidebar(res: Container, ctx: ResourceContext) {
  if (res.items) {
    processWidget(res!, ctx);
    return res as Container;
  }
}

export function processBaseWidget(schema: Widget, ctx: ResourceContext) {

}

export function processWidget(schema: Widget, ctx: ResourceContext) {
  
  if (isField(schema)) {
    const property = ctx.get(schema.name);
    property && mergeProps(schema, property);
    property && (schema.pType = property.type);
  }
  if (isContainer(schema)) {
    schema.items.map((widget) => processWidget(widget, ctx));
  }

  if(schema.slots) {
    if (typeof schema.slots === 'function'){
      schema.slots = schema.slots(ctx)
    }
    let slots:Record<string, Widget> = {...schema.slots};
    Object.keys(slots)
    .filter(Boolean)
    .forEach(key => {
      const widget = slots[key];
      if (widget) {
         slots[key] = processWidget(widget, ctx)
      } else{
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

export function processContext(context: DataContext) {
  const IGNORE = [
    "$attachments",
    "$processInstanceId",
    "_dirty",
    "_fetched",
    "_showRecord",
    "_showSingle",
    "$attr",
    "$default",
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