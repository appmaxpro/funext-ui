import type { DataContext, Field, Property, Schema } from "./data-types";
import { toKebabCase } from "./names";
import { moment, type Moment } from "./l10n";
import { limitScale } from "./constant";

type Merge<T, U> = T & Omit<U, keyof T>;

export type ParserOptions = {
  props?: Merge<Schema, Merge<Field, Property>> | Property;
  context?: DataContext;
};

export type Parser<T> = (
  value: unknown,
  opts?: ParserOptions,
) => T | null | undefined;

const isNull = (value: unknown): value is null | undefined => value == null;

const isEmpty = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "");

const parseNone = <T>(
  value: unknown,
  required: boolean,
  def?: (() => T) | T,
) =>
  isEmpty(value)
    ? required
      ? typeof def === "function"
        ? (def as () => T)()
        : def
      : null
    : value;

export const parseDecimal: Parser<string> = (value, { props } = {}) => {
  const { required = true, scale = null } = props ?? {};
  const input = parseNone(value, required, 0);

  if (isNull(input)) return input;
  if (scale === null) return String(input);

  const nums = String(input).split(".");
  // scale the decimal part
  const limitedScale = limitScale(+scale);
  const dec = parseFloat(`0.${nums[1] || 0}`).toFixed(limitedScale);
  // increment the integer part if decimal part is greater than 0 (due to rounding)
  const num = BigInt(nums[0]) + BigInt(parseInt(dec));
  // append the decimal part
  return num + dec.substring(1);
};

export const parseInteger: Parser<number> = (value, { props } = {}) => {
  const { required = true } = props ?? {};
  const input = parseNone(value, required, 0);
  return isNull(input) ? input : parseInt(String(input));
};

export const parseBoolean: Parser<boolean> = (value: any, { props } = {}) => {
  const { required = true } = props ?? {};

  const input = parseNone(value, required, false);
  if (isNull(input)) return input;

  if (value?.toLowerCase?.() === "true") return true;
  if (value?.toLowerCase?.() === "false") return false;

  return Boolean(value);
};

export const parseString: Parser<string> = (value, { props } = {}) => {
  const { required = true } = props ?? {};

  const input = parseNone(value, required, "");
  if (!isNull(input)) {
    if (typeof input !== "string") {
      return input.toString();
    }
    return input;
  }
  return null;
};

export const parseDate: Parser<Date> = (value, options) => {
  let result = parseDatetime(value, options);
  if (result) {
    result.setHours(0, 0, 0, 0);
  }
  return result;
};

export const parseDatetime: Parser<Date> = (value, { props } = {}) => {
  const { required = true } = props ?? {};

  if (!isNull(value)) {
    if (value instanceof Date) return value;
    if (value instanceof moment) return (value as Moment).toDate();

    if (value === "today" || value === "now") {
      return Date.now();
    }
    if (typeof value === "number" || typeof value === "string") {
      return new Date(value);
    }
  }

  return required ? Date.now() : null as any;
};

export const Parsers = {
  decimal: parseDecimal,
  integer: parseInteger,
  long: parseInteger,
  boolean: parseBoolean,
  date: parseDate,
  datetime: parseDatetime
};

const convert: Parser<any> = (value, opts = {}) => {
  const { props } = opts;
  let type = props?.pType ?? (props as any)?.type;
  if (type) type = toKebabCase(type);

  const func = Parsers[type as keyof typeof Parsers];
  if (func) {
    return func(value, opts);
  }

  return isEmpty(value) ? null : value;
};

export default convert;
