import { isArrayLikeObject, isPlainObject } from "lodash";
import { $request, $use } from "./http";
import { FUNEXT_API_SERVER } from "./constant";

export const CSRF_HEADER_NAME = "X-CSRF-Token";
export const CSRF_COOKIE_NAME = "CSRF-TOKEN";

export const readCookie = (name: string) => {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"),
  );
  return match ? decodeURIComponent(match[3]) : null;
};

// interceptors

$use(async (args, next) => {
  const { init = {} } = args;
  const token = readCookie(CSRF_COOKIE_NAME);
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) headers[CSRF_HEADER_NAME] = token;

  args.init = {
    ...init,
    credentials: "include",
    headers: {
      ...init.headers,
      ...headers,
    },
  };
  return next();
});

$use(async (args, next) => {
  const { init = {} } = args;
  const { body } = init;

  // convert plain object or array to JSON string
  if (isPlainObject(body) || isArrayLikeObject(body)) {
    init.headers = {
      ...init.headers,
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    };
    init.body = JSON.stringify(body, (key, value) => {
      //XXX: exclude dymmy fields, should be removed in next major release
      return key.startsWith("$") ? undefined : value;
    });
  }

  return next();
});

export type RequestOptions = {
  silent?: boolean;
};

export type RequestArgs = {
  url: string;
  method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  headers?: HeadersInit;
  signal?: AbortSignal;
  body?: any;
  options?: RequestOptions;
};

const baseURL = "/";
let URL =  FUNEXT_API_SERVER ?? '';
if (URL.length && !URL.endsWith('/')) {
  URL = URL.substring(0, URL.length -2)
}
//console.log("Request:process.env:",process.env);

export function makeURL(path: string | string[]) {
  const parts = [path].flat();
  const url = parts.join("/");
  if(URL) {
    if (!url.startsWith("/")) {
      return `${URL}/${url}`;
    }
    return `${URL}${url}`;
  }
  if (url.startsWith(baseURL) || url.startsWith("/")) {
    return `${URL}${url}`;
  }
  return baseURL + url;
}

export async function fetch(args: RequestArgs): Promise<Response> {
  const { url, method, headers, body, options } = args;
  //const input = `${process.env.url ?? ''}${makeURL(url)}`;
  const input = makeURL(url);

  const init = {
    method,
    headers,
    body,
  };
  return $request(input, init, options);
}
