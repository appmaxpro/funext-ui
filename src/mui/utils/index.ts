import Color from 'color';
export {default as withMT} from '../theme/tw/withMT';
export * from './cn';
export * from './objectsToString';
export {default as debounce} from "@mui/utils/debounce";

export function intcomma(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}



/**
 * Replaces slug special chars with a space
 */
export function explodeSlug(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').trim();
}

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
  return item !== undefined && item !== null;
}

export function nl2br(str: string): string {
  return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

export function escape(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function percent(value: number, totalValue: number): number {
  // prevent division by zero
  if (totalValue === 0) {
    return 0;
  }

  return (value / totalValue) * 100;
}

/**
 * Converts a multi-line textarea input value into an array,
 * eliminating empty lines
 */
export function extractMultilineFields(value: string): string[] {
  return value
    .split('\n')
    .map(f => f.trim())
    .filter(f => f !== '');
}

/**
 * If the value is of type Array, converts it to type string, keeping the line breaks, if there is any
 */
export function convertMultilineFieldValue<T extends string | string[]>(
  value: T
): string {
  if (Array.isArray(value)) {
    return value.join('\n');
  }

  if (typeof value === 'string') {
    return value.split('\n').join('\n');
  }

  return '';
}

// build actorIds
export const buildUserId = (id: string) => `user:${id}`;
export const buildTeamId = (id: string) => `team:${id}`;

/**
 * Removes the organization / project scope prefix on feature names.
 */
export function descopeFeatureName<T>(feature: T): T | string {
  if (typeof feature !== 'string') {
    return feature;
  }

  const results = feature.match(/(?:^(?:projects|organizations):)?(.*)/);

  if (results && results.length > 0) {
    return results.pop()!;
  }

  return feature;
}

export function isWebpackChunkLoadingError(error: Error): boolean {
  return (
    error &&
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('loading chunk')
  );
}

// NOTE: only escapes a " if it's not already escaped
export function escapeDoubleQuotes(str: string) {
  return str.replace(/\\([\s\S])|(")/g, '\\$1$2');
}


export const IS_ACCEPTANCE_TEST = !!process.env.IS_ACCEPTANCE_TEST;
export const NODE_ENV = process.env.NODE_ENV;

export function remToPx(value:number) {
  if (typeof document === 'undefined') {
    return value * 16;
  }

  return (
    value *
    parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
  );
}

export function pxToRem(value:number) {
  if (typeof document === 'undefined') {
    return value / 16;
  }

  return `${(
    value /
    parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
  )}`;
}

export function getWindow(node: any): typeof window {
  return node?.ownerDocument?.defaultView || window;
}

export function isRTL(element: Element | null | undefined):boolean  {
  return defined(element) && getWindow(element).getComputedStyle(element).direction === 'rtl';
}

export function isElement(value: unknown): value is Element {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
// It should to be noted that this function isn't equivalent to `text-transform: capitalize`.
//
// A strict capitalization should uppercase the first letter of each word in the sentence.
// We only handle the first word.
export function capitalize(string?: string, safe:boolean = true): string | undefined {
  if (!string) 
    return string;
  
  if (typeof string !== 'string') {
    if (safe) return '';
    
    throw new Error('MUI: `capitalize(string)` expects a string argument.');
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const alpha = (color:any, alpha:number) => Color(color).alpha(alpha).string();
 

export const isBrowser = typeof window !== 'undefined';
export const isDevelopment = process.env.NODE_ENV !== 'production';