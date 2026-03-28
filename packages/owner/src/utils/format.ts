import _ from "lodash";


//import { toKebabCase } from "./names";
import { l10n, moment } from "./l10n";
import { DEFAULT_SCALE, EMPTY_OBJECT } from "./constant";
import { getMultiValues, type Option } from "./data-types";

export type FormatOptions = {
  props?: any;
  context?: any;
};

export type Formatter = (value: any, opts?: FormatOptions) => string;

export function getTimeFormat({ props }: FormatOptions = {}) {
  if (props?.timeFormat) return props.timeFormat;
  const seconds = props?.seconds || props?.props?.seconds;
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

  if (props?.seconds || props?.props?.seconds) {
    text = text + ":" + s;
  }

  return text;
};

const formatDate: Formatter = (value, opts = {}) => {
  const format = getDateFormat(opts);
  return value ? moment(value).format(format) : "";
};

const formatTime: Formatter = (value, opts = {}) => {
  const format = getTimeFormat(opts);
  return value
    ? moment(value, [
        "YYYY-MM-DDTHH:mm:ss",
        "YYYY-MM-DDTHH:mm:ssZ[Z]",
        "HH:mm:ss",
        "HH:mm",
      ]).format(format)
    : "";
};

const formatDateTime: Formatter = (value, opts = {}) => {
  const format = getDateTimeFormat(opts);
  return value ? moment(value).format(format) : "";
};

const formatString: Formatter = (value, opts = {}) => {
  const { props, context } = opts;
  if (props?.translatable && context) {
    const key = `t:${props.name}`;
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



const formatNumber: Formatter = (value, opts = {}) => {
  const { props, context = {} } = opts;
  let { scale, currency, pType, type, props:attrs } = props ?? {};
  // special case for filter, ie using hard coded currency, see __currency
  const { currencyText } = attrs ?? {};

  if (
    (value === null || value === undefined) &&
    props?.defaultValue === undefined
  ) {
    return value;
  }

  if ((pType ?? type)?.toUpperCase() === "DECIMAL") {
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

const formatSelection: Formatter = (value, opts = {}) => {
  const { props: { options = EMPTY_OBJECT, multiple, widget } = EMPTY_OBJECT } = opts;
  if (multiple || widget === "checkbox-select") {
    return getMultiValues(value)
      .map(
        (item) =>
          options?.find((x:Option) => String(x.value) === item)?.title ?? item,
      )
      .join(", ");
  } else {
    const item = options.find(
      (x:Option) => String(x.value) === String(value),
    );
    return item?.title ?? "";
  }
};


const formatOne: Formatter = (value, opts = {}) => {
  const { props, context: record } = opts;

  if (!value) return "";
  if (!props?.targetName) return value.name ?? value.code ?? value.id ?? "";

  function getValue(val: any, name: string) {
    const key = `t:${name}`;
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
  text: formatString,
  int: formatInteger,
  long: formatInteger,
  decimal: formatNumber,
  float: formatNumber,
  percent: formatPercent,
  boolean: formatBoolean,
  duration: formatDuration,
  time: formatTime,
  date: formatDate,
  datetime: formatDateTime,
  select: formatSelection,
  //"one-to-one": formatOne,
  "otm": formatMany,
  "mto": formatOne,
  "mtm": formatMany,
};

const format: Formatter = (value, opts = {}) => {
  const { props, context } = opts;
  if (typeof props?.format === 'function') {
    return props?.format(context ?? EMPTY_OBJECT)
  }
  
  let type = props?.pType ?? props?.type;
  //if (type) type = toKebabCase(type);

  if (props?.widget === "duration") type = "duration";
  if (props?.options) type = "select";

  let val = value;
  
  const func = Formatters[value as keyof typeof Formatters];
  if (func) {
    return func(val, opts);
  }

  return val ?? "";
};

export default format;
