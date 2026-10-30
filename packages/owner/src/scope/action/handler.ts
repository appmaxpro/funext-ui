import { EMPTY_ARRAY, EMPTY_OBJECT, type ActionOptions, type ActionResult, type DataRecord } from "~/utils";
import type {
  ActionAttrsData,
  ActionData,
  ActionHandler,
  ActionListener,
  OnSaveHandler,
} from "./types";

export class DefaultActionHandler implements ActionHandler {
  #listeners = new Set<ActionListener>();
  #onSaveHandler?: OnSaveHandler;
  
  get onSaveHandler(){
    return this.#onSaveHandler;
  }
  
  set onSaveHandler(handler: OnSaveHandler|undefined) {
    this.#onSaveHandler = handler;
  }

  setFocus(target: string) {}

  async setValues(values: DataRecord) {}

  setCloseHandler(handler: () => Promise<void>) {}

  get context() {
    return EMPTY_OBJECT;
  }

  schedule(id: string | number, cb: () => void){

  }

  async save(record?: DataRecord): Promise<void> {}
  async edit(record?: DataRecord | null) {}

  async validate() {}

  async refresh() {}

  async close() {}

  async onSignal(signal: string, data?: any) {}

  async action(options: ActionOptions){
    return EMPTY_ARRAY as ActionResult[]
  }

  subscribe(subscriber: ActionListener) {
    this.#listeners.add(subscriber);
    return () => {
      this.#listeners.delete(subscriber);
    };
  }

  emit(data: ActionData) {
    this.#listeners.forEach((fn) => fn(data));
  }
}
