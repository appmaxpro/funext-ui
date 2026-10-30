import { noop, useLazyRef } from "~/ui";
import { isEqual, pick } from "lodash";
import React from "react";
import {
  deepGet,
  EMPTY_ARRAY,
  EMPTY_RECORD,
  isFieldBlock,
  type DataContext,
  type DataRecord,
  type DeepPath,
  type FieldBlock,
  type FieldErrors,
  type Widget,
  type WidgetBlock
} from "~/utils";
import { KeepLast } from "~/utils/concurrency";
import { TaskQueue } from "~/utils/queue";
import type { IFieldState, IFState, IIWidgetState, IWidgetState, Ref } from "../types";

type Schedule = (id: string | number, cb: () => void) => void;


type ComputeResult = {
  values?: Record<string, any>;
  hidden?: Record<string, boolean>;
  required?: Record<string, boolean>;
  valid?: Record<string, boolean>;
  readonly?: Record<string, boolean>;
  error?: Record<string, FieldErrors | undefined>;
};



type ICRecordStore = {
  subscribe: (callback: (data?: Partial<DataRecord>) => void) => () => void;
  snapshot: () => DataRecord;
  get rec(): DataRecord;
  set(data: Partial<DataRecord>, trigger?: boolean, force?: boolean): void;
  get(path: DeepPath, defaultValue?: any): any | undefined;
  emit: () => void;
  close(): void;
};

type IIRecordStore = ICRecordStore & {
  reset(data: DataRecord): void;
};

type ControlState = {
  readonly status?: "loading" | "error" | "submit" | "validate";
  readonly error?: any;
  readonly editing?: boolean;
  readonly readonly?: boolean;
  readonly change: number;
  readonly prev: number;
};

interface IController<CState extends ControlState = ControlState> {
  register<W extends WidgetBlock>(widget: W): IWidgetState;

  get store(): ICRecordStore;
  widget(str: string): IWidgetState | undefined;
  field(str: string): IFieldState | undefined;
  reset(data?: DataRecord): void;
  close(): void;
  subscribe: (callback: () => void) => () => void;
  snapshot(): CState;
  emit(): void;
  get isNew(): boolean;
  refresh(): void;
  get state(): CState;
  get record(): DataRecord;
  setState<K extends keyof ControlState>(
    key: K,
    value?: ControlState[K],
    trigger?: boolean,
  ): void;

  get context(): DataContext;
}

class Base<A extends any = any, L extends (...args: A[]) => void = () => void> {
  _listeners: Set<L> = new Set();

  subscribe(callback: L) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  emit(...args: A[]) {
    this._listeners.forEach((l) => l(...args));
  }

  close() {
    this._listeners.clear();
  }
}

class RecordStore
  extends Base<Partial<DataRecord> | undefined>
  implements ICRecordStore
{
  _record: DataRecord = {};

  constructor(data: DataRecord) {
    super();
    this.reset(data);
  }

  reset(data: DataRecord) {
    this._record = data;
  }

  get rec() {
    return this._record;
  }

  snapshot() {
    return this._record;
  }

  set(
    data: Partial<DataRecord>,
    trigger: boolean = true,
    force: boolean = false,
  ): void {
    const record = this._record;

    if (!trigger) {
      this._record = { ...record, ...data };
      return;
    }

    const changes = force
      ? Object.keys(data)
      : Object.keys(data).filter((key) => !isEqual(data[key], record[key]));

    if (changes.length) {
      const values: Partial<DataRecord> = {};
      changes.forEach((key) => (values[key] = data[key]));
      
      this._record = { ...record, ...values };
      this.emit(values);
    }
  }

  get(path: DeepPath, defaultValue?: any) {
    return deepGet(this._record, path, defaultValue);
  }

  emit(data: Partial<DataRecord> = this._record) {
    super.emit(data);
  }
}

abstract class WidgetState extends Base implements IWidgetState {
  _widget: WidgetBlock;
  _state: IFState;
  _form: IController;
  _delay: number = 200;
  _onFocus: ((event: FocusEvent) => void) | null;
  _onBlur: ((event: Event) => void) | null;
  constructor(form: IController, widget: WidgetBlock) {
    super();
    this._form = form;
    this._widget = widget;
    this._state = { ...this.default, uid: widget.uid };
    this._onFocus = null;
    this._onBlur = null;
  }

  get default() {
    return pick(this._widget, "hidden", "disabled");
  }

  reset() {
    const widget: WidgetBlock = this._widget;
    this._state = {
      ...this.default,
      uid: this._widget.uid,
    };
  }

  snapshot() {
    return this._state;
  }

  changed<K extends keyof IFState>(key: K, value?: IFState[K]) {
    if (this._state[key] !== value) {
      if (key === 'props' && isEqual(this._state[key], value)) {
        return false
      }
      this._state = { ...this._state, [key]: value };
      return true;
    }
    return false;
  }

  setState<K extends keyof IFState>(key: K, value?: IFState[K]) {
    this.form.setStateUid(this._state.uid, key, value);
  }

  get state() {
    return this._state;
  }

  get form(): Controller {
    return this._form as Controller;
  }

  trigger(ctx: object) {
    const block = this._widget;

     if (block.evalProps) {
        this.setState("props",  block.evalProps(ctx));
     }

    if (block.hideIf) {
      this.setState("hidden", block.hideIf(ctx));
    }
  }

  unregister() {
    this._listeners.clear();
    this.form._unregister(this);
  }

  get block() {
    return this._widget;
  }

  get name() {
    return this._widget.schema.name;
  }


  abstract get isField(): boolean;
}

class AnyWidgetState extends WidgetState implements IIWidgetState {
  constructor(form: IController, widget: WidgetBlock) {
    super(form, widget);
  }

  get isField(): false {
    return false;
  }
}

class FieldState extends WidgetState implements IFieldState {
  constructor(form: IController, widget: FieldBlock) {
    super(form, widget);
  }

  get isField(): true {
    return true;
  }

  get name() {
    return this._widget.schema.name!;
  }

  get block() {
    return this._widget as FieldBlock;
  }

  set(value?: any, trigger: boolean = true, markDirty: boolean = true) {}

  get(value?: any) {
    return this._form.store.get(this.name!, value);
  }

  get value() {
    return this.get();
  }

  changed<K extends keyof IFState>(key: K, value?: IFState[K]) {
    if (this._state[key] !== value) {
      this._state = { ...this._state, [key]: value };
      return true;
    }
    return false;
  }

  compute(ctx: object) {
    if (this.block.compute) {
      return this.block.compute(ctx);
    }
  }

  async onChange(ctx: object) {
    return undefined;
  }

  onRecord(value?: any, trigger: boolean = false) {
    
    this.form.toEmit(this)
  }
}

type Pending = {
  keys?: Set<string>;
  states?: Set<IWidgetState>;
};

type ControlOptions = {
  refresh?: () => void;
  schedule: Schedule;
  readonly context: DataContext;
};

class Controller extends Base implements IController {
  _record: IIRecordStore;
  _widgets: Map<string, WidgetState> = new Map();
  _fields: Map<string, FieldState | FieldState[]> = new Map();
  _depends: Map<string, Set<string>> = new Map();
  _queue: TaskQueue = new TaskQueue();
  _keepLast: KeepLast = new KeepLast();

  _pending: Pending = {};
  _result: ComputeResult = {};
  _state: ControlState = {
    change: 0,
    prev: 0,
  };
  _seq: number = 0;
  _subscribe: () => void;
  _editing: boolean = false;
  _readonly: boolean = false;
  _options: ControlOptions;

  constructor(data: DataRecord, options: ControlOptions) {
    super();
    this._options = options;
    this._onRecord = this._onRecord.bind(this);
    this._record = this.createRecord(data);
    this._subscribe = this._record.subscribe(this._onRecord);
  }

  reset(data: DataRecord = {}) {
    this._seq++;
    this._queue.restart();

    this._result = {};
    this._pending = {};
    const rec = { ...data };

    if (!data.id) {
      this._fields.forEach((block) => {
        const schema = (Array.isArray(block) ? block[0] : block).block.schema;
        let defaults = schema.defaultValue;
        if (defaults !== undefined) {
          rec[schema.name] = defaults === "" ? null : defaults;
        }
      });
    }

    this._record.reset(rec);
    this._widgets.forEach((w) => w.reset());
    this._record.emit();
    this.emit();
  }

  get editing() {
    return false;
  }
  get readonly() {
    return true;
  }

  get context() {
    return this._options.context;
  }

  createRecord<S extends IIRecordStore>(data: DataRecord): S {
    return <S>(<unknown>new RecordStore(data));
  }

  createWidgetState(block: WidgetBlock) {
    return isFieldBlock(block)
      ? new FieldState(this, block)
      : new AnyWidgetState(this, block);
  }

  register(block: WidgetBlock) {
    const s = block.schema;
    const widget = this.createWidgetState(block);

    this._widgets.set(block.uid, widget);
    const depends = [...(s.depends?.split(",") ?? EMPTY_ARRAY)];
    if (widget.isField) {
      const name = block.schema.name!;
      let field = this._fields.get(name);
      if (field && !Array.isArray(field)) {
        this._fields.set(name, [field, widget as FieldState]);
      } else if (field) {
        (field as WidgetState[]).push(widget);
      } else {
        this._fields.set(name, widget as FieldState);
      }

      //let deps = this._depends.get(name);
    }
    if (depends.length) {
      for (const name of depends) {
        let deps = this._depends.get(name);
        if (!deps) {
          this._depends.set(name, (deps = new Set<string>()));
        }
        deps.add(block.uid);
      }
    }


    return widget;
  }

  get isNew() {
    return !this.record.id;
  }

  get store(): ICRecordStore {
    return this._record;
  }

  wState(str: string): IFState | undefined {
    return this._widgets.get(str)?.snapshot?.();
  }

  widget(str: string): WidgetState | undefined {
    return this._widgets.get(str);
  }

  field(str: string): FieldState | undefined {
    const field = this._fields.get(str);
    if (field) {
      return Array.isArray(field) ? field[0] : field;
    }
  }

  _unregister(state: WidgetState) {
    const widget = state._widget;
    this._widgets.delete(state._state.uid);
    this._pending.states?.delete(state);
    const depends = [...(widget.schema.depends?.split(",") ?? EMPTY_ARRAY)];
    if (state.isField) {
      let fld = this._fields.get(state.name!);
      this._fields.delete(state.name!);
      if (Array.isArray(fld)) {
        fld = fld.filter((item) => item !== state);
        if (fld.length === 1) {
          this._fields.set(state.name!, fld[0]);
        } else if (fld.length > 1) {
          this._fields.set(state.name!, fld);
        }
      } else this._fields.delete(state.name!);
    }

    for (const name of depends) {
      let deps = this._depends.get(name);
      if (deps) {
        deps.delete(widget.uid);
        if (!deps.size) this._depends.delete(name);
      }
    }
  }

  setFState<K extends keyof IFState>(
    name: string,
    key: K,
    value?: IFState[K],
    withDone?: boolean,
  ) {
    let field = this._fields.get(name);
    if (field) {
      if (Array.isArray(field)) {
        field.forEach(
          (store) => store.changed(key, value) && this.toEmit(store, withDone),
        );
      } else if (field.changed(key, value)) {
        this.toEmit(field, withDone);
      }
    }
  }

  setStateUid<K extends keyof IFState>(uid: string, key: K, value?: IFState[K]) {
    if (this.widget(uid)?.changed(key, value)) {
      this.toEmit(this.widget(uid)!);
    }
  }

  toEmit(widget: WidgetState, withDone?: boolean) {
    const states = (this._pending.states ??= new Set());
    states.add(widget);
    if (withDone !== false) this.onDone();
  }

  toEmitField(keys: string[], data: Partial<DataRecord>) {
    if (!keys.length) return;

    const states = (this._pending.states ??= new Set());
    const add = states.add.bind(states);
    for (const key of keys) {
      const fld = this._fields.get(key);
      if (Array.isArray(fld)) {
        fld.forEach(add);
        fld.forEach((fld) => fld.onRecord(data[key]));
      } else if (fld) {
        add(fld);
        fld.onRecord(data[key]);
      }
    }
  }

  onDone() {
    const curSeq = this._seq;
    const fn = this.done.bind(this, curSeq);
    const onDone = this._queue.add(async () => 1);
    this._keepLast.add(onDone).then(() => fn());
  }

  _onRecord(data: Partial<DataRecord> = this.record) {
    const dataKeys = Object.keys(data);

    if (!dataKeys.length) return;

    const ignore = this._pending.keys;
    const keys = ignore ? dataKeys.filter((k) => !ignore.has(k)) : dataKeys;
    const curSeq = this._seq;
    this.toEmitField(dataKeys, data);
    if (keys.length) {
      this._queue.add(async () => this.compute(keys, curSeq));
    }
    this.onDone();
  }

  async compute(keys: Iterable<string>, seq: number) {
    let context: DataContext = this.context;
    const triggers = new Set<IWidgetState>();
    for (const key of keys) {
      const deps = this._depends.get(key);
      if (deps) {
        for (const uid of deps) {
          const store = this.widget(uid);
          store && triggers.add(store);
        }
      }
    }
    const isNew = this.isNew;

    for (const trigger of triggers) {
      if (trigger.isField) {
        const prom = (trigger as FieldState).compute(context);
        if (seq !== this._seq) return;
        if (prom) {
          const result = await prom;
          if (result !== undefined && trigger.name) {
            this._record.set({ [trigger.name]: result });
          }
        }
      }
      
    }
    
    for (const trigger of triggers) {
       trigger.trigger(context);
    }

    this._pending.states = new Set([
      ...(this._pending.states ?? EMPTY_ARRAY),
      ...triggers,
    ]);
  }

  done(seq: number) {
    const triggers = this._pending.states ?? new Set();
    delete this._pending.states;
    const keys = this._pending.keys;
    if (keys) {
      delete this._pending.keys;
      for (const key of keys) {
        const deps = this._depends.get(key);
        if (deps) {
          for (const uid of deps) {
            const store = this.widget(uid);
            store && triggers.add(store);
          }
        }
      }
    }

    triggers.forEach((trigger) => seq === this._seq && trigger.emit());
  }

  close() {
    this._seq++;
    this._result = {};
    this._pending = {};
    this._queue.restart();
    this.store.close();
    this._widgets.forEach((w) => w.close());
  }

  onRecord(callback: (data?: Partial<DataRecord>) => void) {
    return this.store.subscribe(callback);
  }

  snapshot() {
    return this.state;
  }

  refresh() {
    return this._options.refresh?.();
  }

  get state() {
    return this._state;
  }

  setState<K extends keyof ControlState>(
    key: K,
    value?: ControlState[K],
    trigger: boolean = true,
  ) {
    if (this.state[key] !== value) {
      const prev = this.state.change;
      this._state = { ...this._state, change: prev + 1, [key]: value };
    }
    if (trigger && this.state.change !== this.state.prev) {
      this.emit();
    }
  }

  get record() {
    return this.store.rec;
  }

  emit() {
    this._state = { ...this._state, prev: this.state.change };
    this._options.schedule(0, () => super.emit());
  }
}

//@ts-ignore
const IController = React.createContext<IController>();

const createController = (
  data: DataRecord,
  options: Readonly<ControlOptions>,
): IController => new Controller(data, options);

type Props = {
  //view: ViewBlock;
  context: Ref<DataContext>;
}

export const useCreateController = (context: Ref<DataContext>) => {
 
  /** Imperatively run a function on the next layout effect cycle. */
  const schedule = useScheduleLayoutEffect();

  const options = useLazyRef(() => {
    const submit = async () => {
      const rec = controller.record;

      
    };
    return {
      schedule,
      refresh: noop,
      submit,
      get context() {
        return context.current;
      },
    };
  });

  const controller = React.useMemo(() => {
    return createController({}, options.current);
  }, [context]);

  React.useEffect(() => {
    return () => controller.close();
  }, [controller]);


  return controller;
};



const useLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
/** Imperatively run a function on the next layout effect cycle. */
const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<object>();
  const fns = useLazyRef(() => new Map<string | number, () => void>());

  useLayoutEffect(() => {
    fns.current.forEach((f) => f());
    fns.current = new Map();
  }, [s]);

  return (id: string | number, cb: () => void) => {
    fns.current.set(id, cb);
    ss({});
  };
};

let emptyWidgetState: IWidgetState | undefined;

function getEmptyWidgetState(): IWidgetState {
  if (emptyWidgetState) return emptyWidgetState;

  //class EmptyFormContext
  const emptyBlock: WidgetBlock = {
    schema: EMPTY_RECORD as any,
    tag: "other",
    uid: "",
    sType: "",
    evalProps: function (ctx: object) {
      throw new Error("Function not implemented.");
    }
  };
  class EmptyStateWidget implements IWidgetState {
    subscribe(callback: () => void): () => void {
      return noop;
    }
    snapshot(): IFState {
      return EMPTY_RECORD as IFState;
    }
    get state(): IFState {
      return this.snapshot();
    }
    setState<K extends keyof IFState>(key: K, value?: IFState[K]): void {}
    emit(): void {}
    trigger(ctx: object): void {}
    unregister(): void {}
    get name(): string | undefined {
      return undefined;
    }
    get block(): WidgetBlock<Widget> {
      return emptyBlock;
    }
    get isField(): boolean {
      return false;
    }
    close(): void {}
  }
  emptyWidgetState = new EmptyStateWidget();
  return emptyWidgetState;
}
