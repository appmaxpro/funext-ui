import type { DataRecord } from "./data-types";
import { i18n } from "./i18n";
import { moment } from "./l10n";
import { toCamelCase, toKebabCase, toSnakeCase, toTitleCase } from "./names";
import { session } from "./session";

export const evalHelpers = {
    get _user() {
      return session.info?.user?.login;
    },
    get _group() {
      return session.info?.user?.group;
    },
    get _userId() {
      return session.info?.user?.id;
    },
  _t(key: string, ...args: any[]) {
    return i18n.t(key, ...args);
  },
  _moment(date: any) {
    return moment(date);
  },
  _number(value: any) {
    return +value;
  },

  _contains(iter: any, item: any) {
    return iter?.includes?.(item) ?? false;
  },
  _sum(
    items: DataRecord[],
    field: string,
    operation?: string,
    field2?: string,
  ) {
    let total = 0;
    if (items && items.length) {
      items.forEach(function (item) {
        let value = 0;
        let value2 = 0;
        if (field in item) {
          value = +(item[field] || 0);
        }
        if (operation && field2 && field2 in item) {
          value2 = +(item[field2] || 0);
          switch (operation) {
            case "*":
              value = value * value2;
              break;
            case "/":
              value = value2 ? value / value2 : value;
              break;
            case "+":
              value = value + value2;
              break;
            case "-":
              value = value - value2;
              break;
          }
        }
        if (value) {
          total += value;
        }
      });
    }
    return total;
  },
  _lower(value: any) {
    return typeof value === "string" ? value.toLowerCase() : value;
  },
  _upper(value: any) {
    return typeof value === "string" ? value.toUpperCase() : value;
  },
  _titleCase(value: any) {
    return typeof value === "string" ? toTitleCase(value) : value;
  },
  _snakeCase(value: any) {
    return typeof value === "string" ? toSnakeCase(value) : value;
  },
  _kebabCase(value: any) {
    return typeof value === "string" ? toKebabCase(value) : value;
  },
  _camelCase(value: any) {
    return typeof value === "string" ? toCamelCase(value) : value;
  },
};
