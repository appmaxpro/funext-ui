import getObjValue from "lodash/get";
import isEqual from "lodash/isEqual";
import isPlainObject from "lodash/isPlainObject";

import {
  DataSource,
} from "./data";

import type {
  DeleteOption,
  Domains,
  ExportResult,
  ReadOptions,
  SaveOptions,
  SaveResult,
  SearchOptions,
  SearchPage,
  SearchResult,
} from "./data-types";
import type { DataContext, DataRecord } from "./data-types";
import { getDefaultPageSize } from "./session";
import { EMPTY_ARRAY, EMPTY_RECORD } from "./constant";
import { pick } from "./objects";

function ifDiff<T>(current: T, value: T): T {
  return isEqual(current, value) ? current : value;
}

const TO_PIC1 = ['limit', 'order', 'active', 'fields', "s", "param", "context"]
function ifSearch1(current: SearchOptions, value: SearchOptions) {
  const ci = pick(current, TO_PIC1);
  const vi = pick(value, TO_PIC1);
  return ifDiff(ci, vi) !== ci
}

function iDomain1(current: SearchOptions, value: SearchOptions) {
   return ifDiff(current.domain, value.domain)
}


function updateRecord(
  initialRecord: DataRecord,
  record: DataRecord,
): DataRecord {
  const rec: DataRecord = {};

  Object.keys(initialRecord).forEach((fieldName) => {
    const fieldValue = record[fieldName];
    if (fieldName.includes(".")) {
      const nestValue = getObjValue(record, fieldName.split("."));
      rec[fieldName] =
        nestValue !== undefined ? nestValue : initialRecord[fieldName];
    } else if (
      fieldValue &&
      initialRecord[fieldName] &&
      typeof fieldValue === "object" &&
      !Array.isArray(fieldValue)
    ) {
      rec[fieldName] = updateRecord(
        initialRecord[fieldName],
        fieldValue as DataRecord,
      );
    } else {
      rec[fieldName] = Object.hasOwn(record, fieldName)
        ? fieldValue
        : initialRecord[fieldName];
    }
  });

  return rec;
}

export type DataStoreListener = (ds: DataStore) => void;

export class DataStore extends DataSource {
  #options: SearchOptions;
  #records: DataRecord[] = [];
  #page: SearchPage = {};
  #domain?: Domains;

  #listeners: DataStoreListener[] = [];

  constructor(model: string, options: SearchOptions = {}) {
    super(model);
    
    this.#domain = options.domain && options.domain.length ? [...options.domain] : undefined;
    this.#options = {...options, domain: undefined};
    this.#page = {
      offset: options.offset ?? 0,
      limit: options.limit ?? getDefaultPageSize(),
      total: 0,
      pages: 0,
      page: 0
    };
    this.subscribe = this.subscribe.bind(this)
  }

  get options() {
    return this.#options;
  }

  get page() {
    return this.#page;
  }

  get records() {
    return this.#records;
  }

  async refresh(){
    let records = this.#records ?? []
    this.#records = [];
    await this.search({...this.#options, offset: 0})
  }

  subscribe(listener: DataStoreListener) {
    const listeners = this.#listeners;
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  #notify() {
    this.#listeners.forEach((fn) => fn(this));
  }

  #setVersion(context: DataContext, nested = false) {
    if (!isPlainObject(context)) {
      return context;
    }
    return Object.entries(context).reduce((acc, [key, value]) => {
      if (isPlainObject(value) && value.version !== undefined) {
        const { version: $version, ...rest } = value;
        value = { $version, ...rest };
        value = this.#setVersion(value, true);
      }
      if (Array.isArray(value)) {
        value = value.map((item) => this.#setVersion(item, true));
      }
      if (nested && key === "version") {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as DataContext);
  }

  #prepareOption(options: SearchOptions) : SearchOptions {
    const opts = this.#options;
    const { offset, limit } = this.#page;
    const { context, domain:newDomain } = opts ?? EMPTY_RECORD;
    let domain:Domains|undefined = opts.domain;

    if (opts.domain && newDomain && newDomain.length) {
      domain = ifDiff(opts.domain, newDomain) as Domains
    }
    else if (newDomain && newDomain.length) {
      domain = newDomain
    }

    return {
      ...opts,
      offset,
      limit,
      ...options,
      domain: domain?.length ? domain : undefined,
      context: context
        ? this.#setVersion(context)
        : undefined,

    };
  }

  #accept(options: SearchOptions, page: SearchPage, records: DataRecord[], reset?: boolean) {
    //const _options = ifDiff(this.#options, options);
    const pChange = ifSearch1(this.#options, options)
    
    const d1 = ifDiff(this.#options.domain, options.domain)
    const domChange = d1 !== this.#options.domain

    let _records = records ;
    const _page = ifDiff(this.#page, page);
    const pOffset = this.#page.offset !== page.offset;

    if (pChange || domChange || pOffset){
      this.#options = options;
    } else if(_page ===  this.#page) {
      _records = ifDiff(this.#records, records)
    }

    const changed =
      pChange ||
      domChange ||
      this.#records !== _records ||
      _page !==  this.#page;

    this.#page = _page;

    const infinite = options.infinite ?? this.#options.infinite;
    const infiniteChange = infinite !== this.#options.infinite
    if (infinite && !infiniteChange && !pChange && !domChange){
      const newKeys = new Set<any>(records.map( r => r.id));
      const lastRecords = this.records; 
      const newRecords = lastRecords.filter (r => !newKeys.has(r.id))
      this.#records = newRecords.concat(_records);
    } 
    else {
      this.#records = _records;
    }

    if (changed) this.#notify();
  }

  async search(options: SearchOptions, reset?: boolean): Promise<SearchResult> {
    const opts = this.#prepareOption(options);
    const { page, records = [] } = await this._search(opts);

    this.#accept(opts, page, records);

    return {
      page,
      records: this.records,
    };
  }

  async _search(options: SearchOptions): Promise<SearchResult> {
      if(this.#domain) {
        const domain = options.domain ? this.#domain.concat(options.domain) : this.#domain;
        options = {
          ...options,
          domain: domain as Domains
        }
      }
      return await super.search(options);
  }

  async read(
    id: number,
    options?: ReadOptions,
    silent?: boolean,
  ): Promise<DataRecord> {
    const res = await super.read(id, options, silent);
    if (res) {
      const records = this.records.slice();
      const recInd = records.findIndex((r) => r.id === res.id);
      if (recInd > -1) {
        records[recInd] = updateRecord(records[recInd], res);
        this.#accept(this.#options, this.#page, records);
      }
    }
    return res;
  }



  async delete(options: DeleteOption | DeleteOption[]): Promise<number> {
    const opts = [options].flat();
    const ids = opts.map((x) => x.id);

    const res = await super.delete(opts);

    const page = this.#page;
    const { total: totalCount = this.records.length } = page;

    const _records = this.#records.filter((x) => !ids.includes(x.id!));
    const _page = {
      ...page,
      totalCount: totalCount - res,
    };

    this.#accept(this.#options, _page, _records);

    return res;
  }

  async save<T extends DataRecord | DataRecord[]>(
    data: T,
    options?: SaveOptions<T>,
  ): Promise<SaveResult<T>> {
    const res = await super.save(data, options);

    if (Array.isArray(data) || Array.isArray(res) || !res) {
      return res;
    }

    const records = this.#records.slice();
    let page = this.#page;

    if (data.id) {
      const recInd = records.findIndex((r) => r.id === res.id);
      if (recInd > -1) {
        records[recInd] = updateRecord(records[recInd], { ...data, ...res });
      }
    } else if (res.id && res.id !== data.id) {
      const totalCount = page.total ?? this.records.length;

      records.push(res);
      page = {
        ...page,
        total: totalCount + 1,
      };
    }

    this.#accept(this.#options, page, records);

    return res;
  }

}
