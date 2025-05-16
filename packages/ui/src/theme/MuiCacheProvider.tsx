'use client';
import * as React from 'react';
import { CacheProvider as EmoCacheProvider} from '@emotion/react';
import createCache from '@emotion/cache';
import { StyleSheet } from '@emotion/sheet';
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";


// To fix [Jest performance](https://github.com/mui/material-ui/issues/45638).
const cacheMap = new Map();

// Need to add a private variable to test the generated CSS from Emotion, this is the simplest way to do it.
// We can't test the CSS from `style` tag easily because the `speedy: true` (produce empty text content) is enabled by Emotion.
// Even if we disable it, JSDOM needs extra configuration to be able to parse `@layer` CSS.
export const TEST_INTERNALS_DO_NOT_USE = {
  /**
   * to intercept the generated CSS before inserting to the style tag, so that we can check the generated CSS.
   *
   * let rule;
   * TEST_INTERNALS_DO_NOT_USE.insert = (...args) => {
   *    rule = args[0];
   * };
   *
   * expect(rule).to.equal(...);
   */
  insert: undefined,
};

// We might be able to remove this when this issue is fixed:
// https://github.com/emotion-js/emotion/issues/2790
const createEmotionCache = (options:any, CustomSheet:any) => {
  const cache = createCache(options);

  // Do the same as https://github.com/emotion-js/emotion/blob/main/packages/cache/src/index.js#L238-L245
  cache.sheet = new CustomSheet({
    key: cache.key,
    nonce: cache.sheet.nonce,
    container: cache.sheet.container,
    speedy: cache.sheet.isSpeedy,
    prepend: cache.sheet.prepend,
    insertionPoint: cache.sheet.insertionPoint,
  });

  return cache;
};

let insertionPoint:any;
if (typeof document === 'object') {
  // Use `insertionPoint` over `prepend`(deprecated) because it can be controlled for GlobalStyles injection order
  // For more information, see https://github.com/mui/material-ui/issues/44597
  insertionPoint = document.querySelector('[name="emotion-insertion-point"]');
  if (!insertionPoint) {
    insertionPoint = document.createElement('meta');
    insertionPoint.setAttribute('name', 'emotion-insertion-point');
    insertionPoint.setAttribute('content', '');
    const head = document.querySelector('head');
    if (head) {
      head.prepend(insertionPoint);
    }
  }
}

function getCache(injectFirst:any, enableCssLayer:any, rtl?: boolean) {
  if (injectFirst || enableCssLayer) {
    /**
     * This is for client-side apps only.
     * A custom sheet is required to make the GlobalStyles API injected above the insertion point.
     * This is because the [sheet](https://github.com/emotion-js/emotion/blob/main/packages/react/src/global.js#L94-L99) does not consume the options.
     */
    class MyStyleSheet extends StyleSheet {
      //@ts-ignore
      insert(rule:any, options:any) {
        if (TEST_INTERNALS_DO_NOT_USE.insert) {
          //@ts-ignore
          return TEST_INTERNALS_DO_NOT_USE.insert(rule, options);
        }
        //@ts-ignore
        if (this.key && this.key.endsWith('global')) {
          //@ts-ignore
          this.before = insertionPoint;
        }
        //@ts-ignore
        return super.insert(rule, options);
      }
    }
    const emotionCache = createEmotionCache(
      {
        key: rtl ? 'cssr' : 'css',
        insertionPoint: injectFirst ? insertionPoint : undefined,
        stylisPlugins: rtl ? [rtlPlugin] : []
      },
      MyStyleSheet,
    );
    if (enableCssLayer) {
      const prevInsert = emotionCache.insert;
      emotionCache.insert = (...args) => {
        if (!args[1].styles.startsWith('@layer')) {
          // avoid nested @layer
          args[1].styles = `@layer mui {${args[1].styles}}`;
        }
        return prevInsert(...args);
      };
    }
    return emotionCache;
  }
  return undefined;
}

export interface MuiCacheProviderProps {
  children?: React.ReactNode;
  enableCssLayer?: boolean;
  injectFirst?: boolean;
  rtl?: boolean;
}


export default function MuiCacheProvider(props:MuiCacheProviderProps) {
  const { enableCssLayer = true, injectFirst , children, rtl } = props;
  const cache = React.useMemo(() => {
    const cacheKey = `${injectFirst}-${enableCssLayer}-${rtl}`;
    if (cacheMap.has(cacheKey)) {
      return cacheMap.get(cacheKey);
    }
    const fresh = getCache(injectFirst, enableCssLayer, rtl);
    cacheMap.set(cacheKey, fresh);
    return fresh;
  }, [injectFirst, enableCssLayer]);

  return cache ? <EmoCacheProvider value={cache}>{children}</EmoCacheProvider> : children;
}
