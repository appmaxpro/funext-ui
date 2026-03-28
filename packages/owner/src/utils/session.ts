import { fetch } from "./client";
import { DEFAULT_MAX_PER_PAGE, DEFAULT_PAGE_SIZE } from "./constant";
import { i18n } from "./i18n";


export interface ClientInfo {
  name: string;
  icon?: string;
  title?: string;
}

export interface SessionInfo {
  application: {
    name?: string;
    author?: string;
    description?: string;
    copyright?: string;
    theme?: string;
    logo?: string;
    icon?: string;
    lang?: string;
    country?: string;
    version?: string;
    home?: string;
    help?: string;
    mode?: string;
    pollingInterval?: number;
    resetPasswordEnabled?: boolean;
    totp?: boolean;
    disableLoginLanguage?: boolean;
    openIdForce?: boolean;
    emailEnabled?: boolean;
    singlePage?: boolean;
  };
  authentication?: {
    callbackUrl?: string;
    clients?: ClientInfo[];
    defaultClient?: string;
    exclusive?: boolean;
    currentClient?: string;
    tenants?: Record<string, string>;
    tenant?: string;
    
  };
  user?: {
    id: number;
    token: string;
    login: string;
    name: string;
    nameField?: string;
    lang?: string | null;
    country?: string;
    image?: string | null;
    action?: string | null;
    theme?: string | null;
    group?: string | null;
    navigator?: string | null;
    technical?: boolean;
  };
  api?: {
    pagination?: {
      maxPerPage?: number;
      defaultPerPage?: number;
    };
  };
  data?: {
    upload?: {
      maxSize?: number;
    };
  };
  features?: {
    //by Nabil
    socket?: boolean;
    tracking?: boolean;
  };
  route?: {
    path: string;
    state: Record<string, unknown>;
  };
}

export type SessionListener = (info: SessionInfo | null) => void;

type ApiToken = string | null
type StoreApiToken = (headers: ApiToken) => void;

let token: ApiToken = null;
let storeApiToken: StoreApiToken;

const setApiToken: StoreApiToken = (apiToken: ApiToken) => {
    if (apiToken !== token ) {
        token = apiToken;
        storeApiToken?.(apiToken)
    }
};



async function init() {
  
  const url = "app/info";
  const headers = token ? {Authorization: 'Basic '+ token} : undefined;
  const resp = await fetch({ url, headers });

  if (!resp.ok) {
    if (token && resp.status === 401) {
      setApiToken(null);
      return init()
    }
    return Promise.reject(resp.status);
  }

  const data = await resp.json();

  await i18n.load();

  return data as SessionInfo;
}

export class Session {
  #info: SessionInfo | null = null;
  #infoPromise: Promise<SessionInfo> | null = null;
  #listeners = new Set<SessionListener>();


  #notify() {
    this.#listeners.forEach((fn) => fn(this.#info));
  }

  subscribe(listener: SessionListener) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  get info() {
    return this.#info;
  }

  async init() {

    return this.#info ?? (await this.#load());
  }

  async #load() {
    this.#infoPromise = this.#infoPromise ?? init();
    this.#info = await this.#infoPromise;
    this.#notify();
    return this.#info;
  }

  async login(
    args: {
      username: string;
      password: string;
      newPassword?: string;
      code?: string;
    },
    options?: {
      params?: URLSearchParams;
      tenant?: string;
    },
  ): Promise<SessionInfo> {
    const params = options?.params;
    const tenant = options?.tenant;
    const url = "auth/login" + (params ? `?${params}` : "");
    const headers = tenant ? { "X-Tenant-ID": String(tenant) } : undefined;
    const response = await fetch({
      url,
      method: "POST",
      headers,
      body: args,
    });

    const { status, ok } = response;

    if (!ok) {
      return Promise.reject(response);
    }

    const data = await response.json();
    const { user } = data;
    

    if (user) {
      this.#info = data;
      setApiToken(user.token);
      this.#notify();
      return data;
    }

    return (this.#infoPromise = init());
  }

  async logout() {
    const headers = token ? {Authorization: 'Basic '+ token} : undefined;
    const response = await fetch({ url: "auth/logout", headers });
    const { status } = response;
    const redirectUrl: string | null =
      status === 200 ? (await response.json()).redirectUrl : null;

    setApiToken(null);


    this.#info = null;
    this.#infoPromise = null;
    this.#notify();

    return { status, redirectUrl };
  }

}

export const session = new Session();

 
export async function loadSession(apiToken:ApiToken, setApiToken:StoreApiToken): Promise<SessionInfo> {
  token = apiToken;
  storeApiToken = setApiToken;
  const info = session.info;
  if (info) {
    return info;
  }
  return await session.init();
}

const EMPTY_HEADERS = {}
export function getHeaders() {
  const headers = token ? {Authorization: 'Basic '+ token} : undefined
;
  return headers
}

export function getDefaultPageSize(): number {
  const defaultSize =
    session.info?.api?.pagination?.defaultPerPage ?? 0 > 0
      ? session.info?.api?.pagination?.defaultPerPage
      : DEFAULT_PAGE_SIZE;
  if (getDefaultMaxPerPage() > 0) {
    return Math.min(getDefaultMaxPerPage(), defaultSize!);
  }
  return defaultSize!;
}

/**
 * Get the max number of records to display per page.
 */
export function getDefaultMaxPerPage(): number {
  return session.info?.api?.pagination?.maxPerPage ?? DEFAULT_MAX_PER_PAGE;
}