import { isArrayLikeObject, isPlainObject } from "lodash";
import { $request, $use, type RequestArgs, type RequestOptions } from "./http";
import { FUNEXT_API_SERVER, CONTEXT_PATH } from "./constant";

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
      "x-requested-with": "XMLHttpRequest",
    };
    init.body = JSON.stringify(body, (key, value) => {
      //XXX: exclude dymmy fields, should be removed in next major release
      return key.startsWith("$") ? undefined : value;
    });
  }

  return next();
});

export type { RequestArgs, RequestOptions };
//
const baseURL = "/";
let URL = (FUNEXT_API_SERVER ?? "" + CONTEXT_PATH + "/").replaceAll(/\/\//g, "/");

console.log("Request:process.URL:", URL);

export function makeURL(path: string | string[]) {
  const parts = [path].flat();
  const url = parts.join("/");
  return `/${URL}${url}`.replaceAll(/\/\//g, "/");
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
