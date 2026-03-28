import type { ActionOptions, ActionResult, DataContext, DataRecord } from "~/utils";
import type { Task } from "~/utils/queue";


export interface IActionData {
  type: string;
}

export interface ActionAttrsData extends IActionData {
  type: "attrs";
  attrs: {
    target: string;
    name: string;
    value: any;
  }[];
}

export interface ActionValueData extends IActionData {
  type: "value";
  target: string;
  value: any;
  op: "set" | "add" | "del";
}

export interface ActionRecordData extends IActionData {
  type: "record";
  value: DataRecord;
}

export interface ActionFocusData extends IActionData {
  type: "focus";
  target: string;
}

export interface ActionCloseData extends IActionData {
  type: "close";
}

export type ActionData =
  | ActionAttrsData
  | ActionValueData
  | ActionFocusData
  | ActionCloseData
  | ActionRecordData;

export type ActionListener = (data: ActionData) => void;


export type Schedule = (id: string | number, cb: () => void) => void;

export interface ActionHandler {
  setFocus(target: string): void;

  setCloseHandler(handler: () => Promise<void>): void;

  save(record?: DataRecord): Promise<void>;
  edit(record?: DataRecord | null): Promise<void>;

  validate(): Promise<void>;

  refresh(target?: string): Promise<void>;

  close(): Promise<void>;

  readonly context: Readonly<DataContext>;

  schedule(id: string | number, cb: () => void): void;

  onSignal(signal: string, data?: any): Promise<void>;

  subscribe(subscriber: ActionListener): () => void;

  emit(data: ActionData): void;

  action(options: ActionOptions): Promise<ActionResult[]>
}

export type DataActionOptions = ActionOptions &{

  enqueue?: boolean;
  handle?: (result: ActionResult) => Promise<void>;
};

export interface ActionExecuter {
  execute(
    action: string,
    options?: Omit<DataActionOptions, 'action'>,
  ): Promise<ActionResult[] | void>;
  wait(): Promise<void>;
  waitFor(interval?: number): Promise<void>;
  run<T>(task: Task<T>):Promise<T>;
  runLast(task:() => void):Promise<void>;
  restartQueue(): void;
  runNow<T>(task: Task<T>):Promise<T>;
}