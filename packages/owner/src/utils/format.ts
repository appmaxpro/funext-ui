import _ from "lodash";


//import { toKebabCase } from "./names";
import { l10n } from "./l10n";

export type FormatOptions = {
  props?: any;
  context?: any;
};

export type Formatter = (value: any, opts?: FormatOptions) => string;

export function getTimeFormat({ props }: FormatOptions = {}) {
  if (props?.timeFormat) return props.timeFormat;
  const seconds = props?.seconds || props?.widgetAttrs?.seconds;
  let format = "HH:mm";
  if (seconds) {
    format += ":ss";
  }
  return format;
}

export function getDateFormat({ props }: FormatOptions = {}) {
  if (props?.dateFormat) return props.dateFormat;
  return l10n.getDateFormat();
}

export function getDateTimeFormat({ props }: FormatOptions = {}) {
  const dateFormat = getDateFormat({ props });
  return dateFormat + " " + getTimeFormat({ props });
}

const formatDuration: Formatter = (value, opts = {}) => {
  if ((!value && value !== 0) || isNaN(value)) {
    return value;
  }

  value = Number(value);

  const props = opts?.props;

  let h = "" + Math.floor(value / 3600);
  let m = "" + Math.floor((value % 3600) / 60);
  let s = "" + Math.floor((value % 3600) % 60);

  h = _.padStart(h, props?.big ? 3 : 2, "0");
  m = _.padStart(m, 2, "0");
  s = _.padStart(s, 2, "0");

  let text = h + ":" + m;

  if (props?.seconds || props?.widgetAttrs?.seconds) {
    text = text + ":" + s;
  }

  return text;
};


const formatString: Formatter = (value, opts = {}) => {
  const { props, context } = opts;
  if (props?.translatable && context) {
    const key = `$t:${props.name}`;
    return context[key] ?? value;
  }
  return value;
};

function addCurrency(value: string, symbol: string) {
  if (value && symbol) {
    const lang = l10n.getLocale().split(/-|_/)[0];
    if (lang === "fr") {
      return value.endsWith(symbol) ? value : value + " " + symbol;
    }
    return value.startsWith(symbol) ? value : symbol + " " + value;
  }
  return value;
}

export const DEFAULT_SCALE = 2;

const MIN_SCALE = 0;
const MAX_SCALE = 20;

export function limitScale(value?: number) {
  if (value == null) {
    return value;
  }

  if (value < MIN_SCALE) {
    return MIN_SCALE;
  }

  if (value > MAX_SCALE) {
    return MAX_SCALE;
  }

  return value;
}

const formatNumber: Formatter = (value, opts = {}) => {
  const { props, context = {} } = opts;
  let { scale, currency, serverType, type, widgetAttrs } = props ?? {};
  // special case for filter, ie using hard coded currency, see __currency
  const { currencyText } = widgetAttrs ?? {};

  if (
    (value === null || value === undefined) &&
    props?.defaultValue === undefined
  ) {
    return value;
  }

  if ((serverType ?? type)?.toUpperCase() === "DECIMAL") {
    // referencing another field in the context?
    if (typeof scale === "string") {
      scale = +((_.get(context, scale) as number) ?? scale);
    }

    if (typeof scale !== "number" || isNaN(scale)) {
      scale = DEFAULT_SCALE;
    }
  } else {
    scale = 0;
  }

  if (currency) {
    // referencing another field in the context?
    currency = _.get(context, currency) as string;
  } else if (currencyText) {
    // else it is the currency text (legacy angular filter)
    currency = currencyText;
  }

  const num = +value;
  if (num === 0 || num) {
    const opts: Intl.NumberFormatOptions = {};
    opts.minimumFractionDigits = scale;
    opts.maximumFractionDigits = scale;
    if (currency) {
      opts.style = "currency";
      opts.currency = currency;
    }
    try {
      return l10n.formatNumber(num, opts);
    } catch (e) {
      // Fall back to adding currency symbol
      if (currency) {
        const result = l10n.formatNumber(num, {
          minimumFractionDigits: opts.minimumFractionDigits,
          maximumFractionDigits: opts.maximumFractionDigits,
        });
        return addCurrency(result, currency);
      }
      throw e;
    }
  }
  if (typeof value === "string" && currency) {
    return addCurrency(value, currency);
  }
  return value;
};

const formatInteger: Formatter = (value, opts = {}) => {
  const { props: { scale, ...props } = {} as any } = opts;
  return formatNumber(value, { ...opts, props });
};

const formatPercent: Formatter = (value, opts = {}) => {
  const { props, context = {} } = opts;
  let { scale } = props ?? {};

  // referencing another field in the context?
  if (typeof scale === "string") {
    scale = (_.get(context, scale) as number) ?? scale;
  }

  const num = +value;
  if (num === 0 || num) {
    const opts: Intl.NumberFormatOptions = { style: "percent" };
    if (scale) {
      opts.minimumFractionDigits = +scale || 2;
      opts.maximumFractionDigits = +scale || 2;
    }
    return l10n.formatNumber(num, opts);
  }

  return value;
};

const formatBoolean: Formatter = (value, opts = {}) => {
  return Boolean(value).toString();
};


const formatOne: Formatter = (value, opts = {}) => {
  const { props, context: record } = opts;

  if (!value) return "";
  if (!props?.targetName) return value.name ?? value.code ?? value.id ?? "";

  function getValue(val: any, name: string) {
    const key = `$t:${name}`;
    return val[key] ?? _.get(val, name);
  }

  return (
    getValue(value, props.targetName) ??
    (record && getValue(record, `${props.name}.${props.targetName}`)) ??
    ""
  );
};

const formatMany: Formatter = (value, opts = {}) => {
  return value ? `(${value.length})` : "";
};

export const Formatters = {
  string: formatString,
  integer: formatInteger,
  long: formatInteger,
  decimal: formatNumber,
  percent: formatPercent,
  boolean: formatBoolean,
  duration: formatDuration,
  "one-to-one": formatOne,
  "one-to-many": formatMany,
  "many-to-one": formatOne,
  "many-to-many": formatMany,
};

const format: Formatter = (value, opts = {}) => {
  const { props, context } = opts;
  let type = props?.serverType ?? props?.type;
  //if (type) type = toKebabCase(type);

  if (type === "enum") type = "enumeration";
  if (props?.widget === "duration") type = "duration";
  if (props?.selection) type = "selection";

  let val = value;
  const name = props?.name;

  if (context && val === undefined) {
    
  }

  const func = Formatters[type as keyof typeof Formatters];
  if (func) {
    return func(val, opts);
  }

  return val ?? "";
};

export default format;
