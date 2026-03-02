import { DataStore } from "./data-store";
import type { SearchOptions } from "./data-types";
import { Cache } from "./cache";

export class DataStoreCache extends DataStore {
  #cache: Cache<any>;
  constructor(model: string, cache: Cache<any>, options: SearchOptions = {}) {
    super(model, options);
    this.#cache = cache;
  }
}