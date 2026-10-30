import {
  camelCase,
  capitalize,
  kebabCase,
  snakeCase,
  startCase,
  upperFirst,
} from "lodash";

export function toCamelCase(name: string): string;
export function toCamelCase(name: string, firstUpper: boolean): string;
export function toCamelCase(name: string, firstUpper: boolean = true) {
  const res = camelCase(name);
  return firstUpper ? upperFirst(res) : res;
}

export function toKebabCase(name: string) {
  return kebabCase(name);
}

export function toSnakeCase(name: string) {
  return snakeCase(name);
}

export function toTitleCase(name: string): string;
export function toTitleCase(name: string, allUpper: boolean): string;
export function toTitleCase(name: string, allUpper = false) {
  const res = startCase(name);
  return allUpper ? res : capitalize(res);
}

const R_EMAIL =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
const R_FALSY = /^false|0$/i;
const R_KEYED_SUBSTITUTION = /%\((?<key>[^)]+)\)s/g;
const R_NUMERIC = /^\d+$/;
const R_REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

export const nbsp = "\u00a0";



/**
 * Escapes a pattern to use as a RegExp.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping}
 *
 * @param {string} pattern
 * @returns {string} escaped string to use as a RegExp
 */
export function escapeRegExp(pattern:string) {
    return pattern.replaceAll(R_REGEX_SPECIAL_CHARS, "\\$&");
}
