//import { dialogs } from "@/components/dialogs";
import type { Domain } from "domain";
import { readCookie, fetch, type RequestArgs, type RequestOptions } from "./client";
import { EMPTY_OBJECT, EMPTY_RECORD } from "./constant";
import convert from "./convert";
import type {
  DataRecord,
  Perms, ReadOptions,
  SaveOptions,
  SaveResult,
  DeleteOption,
  SearchResult,
  SearchOptions,
  ResourceMeta,
  Property,
  ActionOptions,
  ActionResult,
  DataContext,
  Domains,
  Identifier
} from "./data-types";
import { reject, rejectAsAlert } from "./reject";
import { getHeaders } from "./session";

export type AccessType = "read" | "write" | "create" | "remove" | "export";


export type FetchRequest = Omit<RequestArgs, 'options'>
export type FetchOptions = RequestOptions

export class DataSource {
  #model;
  #showErrors:boolean;
  constructor(model: string, showErrors = false) {
    this.#model = model;
    this.#showErrors = showErrors;
  }

  get model() {
    return this.#model;
  }

  set showErrors(showErrors: boolean) {
    this.#showErrors = showErrors;
  }

  static async fromResponse(resp: Response){
      return  await resp.json();
  }

  mapContext(context?: DataContext){
  
    return context ? {context: {...context, lang: 'en'}} : undefined
  }


  async fetch(args: FetchRequest, options?: FetchOptions ): Promise<Response> {
    
    const headers = getHeaders()

    return fetch({...args, headers, options})
  }     

  async search(options: SearchOptions): Promise<SearchResult> {
    const url = `${this.model}/search`;
    const { silent, params, limit, context, single, signal, ...rest } = options ?? {};
    const resp = await this.fetch({
      url,
      method: "POST",
      signal,
      body: {
        params: {
          limit,
          ...this.mapContext(context),
          ...rest,
          ...params
        }
      },
    }, silent ? { silent } : undefined);

    if (resp.ok) {
      const data = await resp.json()
      //console.log("search::", {json, error, data})
      const {
        data: records,
        offset = 0,
        total = Array.isArray(records) ? records.length : 1,
        error,
      } = data ?? EMPTY_OBJECT;
      
      console.log("search records::", data)
      //const newLimit = limit == null && limit > 0 

      return !error
        ? {
            records,
            page: {
              offset,
              limit,
              total,
              pages: limit != null && limit > 0 ? Math.ceil(total / limit) : undefined,
              page: limit != null && limit > 0 ? Math.floor(offset / limit) + 1 : undefined
            },
          }
        : this.#showErrors 
        ? rejectAsAlert(error) 
        : Promise.reject(error);
    }

    return Promise.reject(resp.status);
  }

  async read(
    id: Identifier,
    options?: ReadOptions,
    silent?: boolean,
  ): Promise<DataRecord> {
    const url = `${this.model}/${id}`;
    const {signal, ...rest} = options ?? EMPTY_RECORD;
    const resp = await this.fetch({
      url,
      method: rest ? "POST" : "GET",
      body: rest ? {'params': rest} : undefined,
      signal
    }, silent ? { silent } : undefined);

    if (resp.ok) {
      const {error, data} = await DataSource.fromResponse(resp);
      return !error ? data : reject(silent ? null : error);
    }

    return Promise.reject(resp.status);
  }

  async save<T extends DataRecord | DataRecord[]>(
    data: T,
    options?: SaveOptions<T>,
  ): Promise<SaveResult<T>> {
    const { onError, ...rest } = options ?? {};

    if (!Array.isArray(data) && data?.$upload) {
      const upload = data.$upload;
      return this.upload(data, upload.field, upload.file) as Promise<
        SaveResult<T>
      >;
    }

    const isRecords = Array.isArray(data);
    const url = `${this.model}`;
    const resp = await this.fetch({
      url,
      method: "POST",
      body: isRecords ? { records: data, ...options } : { data, ...options },
    });

    if (resp.ok) {
      const {error, data} = await DataSource.fromResponse(resp);
      if (!error ) {
        return data;
      }
      return onError ? error(data).catch(reject) : reject(error);
    }

    return Promise.reject(resp.status);
  }

  async delete(options: DeleteOption | DeleteOption[]): Promise<number> {
    const records = Array.isArray(options) ? options : [options];
    const url = `${this.model}/removeAll`;
    const resp = await this.fetch({
      url,
      method: "POST",
      body: {
        records,
      },
    });

    if (resp.ok) {
      const {error, data} = await DataSource.fromResponse(resp);
      return !error ? data.length : reject(data);
    }

    return Promise.reject(resp.status);
  }

  async copy(id: number): Promise<DataRecord> {
    const url = `${this.model}/${id}/copy`;
    const resp = await this.fetch({
      url,
      method: "GET",
    });

    if (resp.ok) {
      const {error, data} = await DataSource.fromResponse(resp);
      return !error ? data : Promise.reject(500);
    }

    return Promise.reject(resp.status);
  }

  async verify(values: DataRecord) {
    const url = `${this.model}/verify`;
    const resp = await this.fetch({
      url,
      method: "POST",
      body: {
        data: values,
      },
    });
    if (resp.ok) {
      const {error, data} = await DataSource.fromResponse(resp);
      return !error;
    }
    return false;
  }

  async upload(
    data: DataRecord,
    field: string | Blob,
    file: File,
    onProgress?: (complete?: number) => void,
  ): Promise<DataRecord> {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const url = `${this.model}/upload`;
    


    //by Nabil
    if (data && !data.model) {
      data.model = this.model;
    }
    formData.append("file", file);
    formData.append("field", field);
    formData.append("request", JSON.stringify({ data }));

    return new Promise<DataRecord>(function (resolve, reject) {
      if (onProgress) {
        xhr.upload.addEventListener(
          "progress",
          function (e) {
            const complete = Math.round((e.loaded * 100) / e.total);
            onProgress(complete);
          },
          false,
        );
      }

      xhr.onerror = reject;
      xhr.onabort = reject;

      xhr.onload = function () {
        let data: any = {};
        try {
          data = JSON.parse(xhr.response || xhr.responseText);
        } catch {
          // ignore
        }

        const response = {
          data,
          status: xhr.status,
        };

        if (xhr.status === 200) {
          if (data?.status === 0) {
            resolve(data?.data[0]);
          } else {
            reject(500);
          }
        } else {
          reject(response.status);
        }
      };

      xhr.open("POST", url, true);
      xhr.setRequestHeader("X-CSRF-Token", readCookie("CSRF-TOKEN")!);
      const headers = getHeaders()
      if (headers) {
        for (let entry in Object.entries(headers)){
             xhr.setRequestHeader(entry[0], entry[1])
        }
      }
      
      xhr.send(formData);
    });
  }



  async perms(id?: number | null) {
    let url = `${this.model}/perms`;
    const params = new URLSearchParams();

    if ((id ?? 0) > 0) {
      params.append("id", String(id));
    }

    if (params.size > 0) {
      url += `?${params}`;
    }

    const resp = await this.fetch({ url, method: "GET" });

    if (resp.ok) {
      const { status, data } = await resp.json();

      if (status === 0) {
        if (data && Array.isArray(data)) {
          return data.reduce(
            (acc, curr) => {
              acc[curr?.toLowerCase?.()] = true;
              return acc;
            },
            {
              read: false,
              write: false,
              create: false,
              remove: false,
              export: false,
            },
          ) as Perms;
        }
      }
    }

    return Promise.reject(resp.status);
  }

  async isPermitted(action: AccessType, id?: number | null, silent?: boolean) {
    let url = `${this.model}/perms`;
    const params = new URLSearchParams({ action });

    if ((id ?? 0) > 0) {
      params.append("id", String(id));
    }

    if (params.size > 0) {
      url += `?${params}`;
    }

    const resp = await fetch({
      url,
      method: "GET",
      options: silent ? { silent } : undefined,
    });

    if (resp.ok) {
      const { status, errors } = await resp.json();

      if (status === 0) {
        return true;
      }

      if (!silent) {
        /*
        dialogs.box({
          title: i18n.get("Access error"),
          content: Object.values(errors ?? {}).join("<br>"),
          yesNo: false,
        });
        */
        throw errors;
      }

      return false;
    }

    return Promise.reject(resp.status);
  }
}



export function getDefaultValues(fields?: Property[], defaults?:DataRecord) {
  const result: DataRecord = fields?.reduce(
    (acc, field) => {
      let { defaultValue, name } = field;

      if (defaultValue === undefined || name.includes(".")) {
        return acc;
      }
      if(acc[name] != null) {
         return acc;
      }

      
      const value = convert(defaultValue, { props: field });
      return { ...acc, [name]: value };
    },
    defaults ?? {},
  ) ?? {};
  return result;
}

export function getDefaultValue(field: Property) {
   let { defaultValue, name } = field;

    if (defaultValue === undefined || name.includes(".")) {
      return undefined;
    }

   return convert(defaultValue, { props: field });

}

function prepareActionResult(
  data: any,
  errors?: ActionResult["errors"],
): ActionResult[] {
  const res = errors ? [{ errors }] : ([] as ActionResult[]);

  if (Array.isArray(data)) {
    return [
      ...res,
      ...data.map((item) => {
        const { "signal-data": signalData, ...rest } = item;
        return {
          ...rest,
          ...(signalData && { signalData }),
        };
      }),
    ];
  }

  return res;
}


export async function action(options: ActionOptions): Promise<ActionResult[]> {
  const url = "ws/action";
  const resp = await fetch({
    url,
    method: "POST",
    body: options,
  });

  if (resp.ok) {
    const { status, data, errors } = await resp.json();
    return status === 0 ? prepareActionResult(data, errors) : reject(data);
  }

  return Promise.reject(resp.status);
}
