import { noop, useLazyRef } from "@funext/ui";
import { isEqual, merge, omit, pick } from "lodash";
import React, { useSyncExternalStore } from "react";
import {
  useResourceContext,
  useViewBlockContext,
  WidgetStateContext,
} from "~/context";
import { useAsync } from "~/hooks/use-async";
import {
  DataStore,
  deepClone,
  deepEqual,
  deepGet,
  EMPTY_ARRAY,
  EMPTY_RECORD,
  i18n,
  isContainer,
  isField,
  isFieldBlock,
  type DataContext,
  type DataRecord,
  type DeepPath,
  type FieldBlock,
  type FieldErrors,
  type FormViewBlock,
  type Schema,
  type Widget,
  type WidgetBlock,
} from "~/utils";
import { KeepLast } from "~/utils/concurrency";
import { createEvalContext } from "~/utils/eval-context";
import { TaskQueue } from "~/utils/queue";
import { validate } from "~/utils/validate";
import { useTabRoute, useViewSwitch } from "./tabs/use-tabs";
import { useDataStore } from "~/hooks/use-data-store";
import { DataSource } from "~/utils/data";

export type Schedule = (id: string | number, cb: () => void) => void;

export type State = {
  readonly uid: string;
  readonly readonly?: boolean;
  readonly focused?: boolean;
  readonly touched?: boolean;
  readonly hidden?: boolean;
  readonly required?: boolean;
  readonly dirty?: boolean;
  readonly error?: FieldErrors;
  readonly valid?: boolean;
  readonly filled?: boolean;
  readonly disabled?: boolean;
  readonly props?: Record<string, any>;
};

type ComputeResult = {
  values?: Record<string, any>;
  hidden?: Record<string, boolean>;
  required?: Record<string, boolean>;
  valid?: Record<string, boolean>;
  readonly?: Record<string, boolean>;
  error?: Record<string, FieldErrors | undefined>;
};

export interface IWidgetState {
  subscribe(callback: () => void): () => void;
  snapshot(): State;
  get state(): State;
  setState<K extends keyof State>(key: K, value?: State[K]): void;

  emit(): void;
  trigger(ctx: object): void;

  unregister(): void;
  get name(): string | undefined;

  get widget(): WidgetBlock;

  get isField(): boolean;

  close(): void;
}

export interface IIWidgetState extends Omit<IWidgetState, "isField"> {
  get isField(): false;
}

export interface IFieldState
  extends Omit<IWidgetState, "widget" | "isField" | "name"> {
  get isField(): true;
  get widget(): FieldBlock;
  get name(): string;

  set(value?: any, trigger?: boolean, markDirty?: boolean): void;
  get(defaults?: any): any | null | undefined;
  get value(): any | null | undefined;

  compute(ctx: object): Promise<ComputeResult | undefined> | undefined;
  onChange(ctx: object): Promise<ComputeResult | undefined> | undefined;
  validate(): Promise<any>;
  commit(force?: boolean): Promise<any>;

  get form(): IFormContext;
}

export type IRecordStore = {
  subscribe: (callback: (data?: Partial<DataRecord>) => void) => () => void;
  snapshot: () => DataRecord;
  get rec(): DataRecord;
  set(data: Partial<DataRecord>, trigger?: boolean, force?: boolean): void;
  get(path: DeepPath, defaultValue?: any): any | undefined;
  emit: () => void;
  close(): void;
};

type FormState = {
  readonly status?: "loading" | "error" | "submit" | "validate";
  readonly error?: any;
  readonly editing?: boolean;
  readonly readonly?: boolean;
  readonly change: number;
  readonly prev: number;
};

export interface IFormContext {
  register<W extends WidgetBlock>(widget: W): IWidgetState;

  get store(): IRecordStore;
  wState(str: string): State | undefined;
  widget(str: string): IWidgetState | undefined;
  field(str: string): IFieldState | undefined;
  reset(data?: DataRecord): void;
  close(): void;
  onRecord: (callback: (data?: Partial<DataRecord>) => void) => () => void;
  subscribe: (callback: () => void) => () => void;
  snapshot(): FormState;
  emit(): void;
  get isNew(): boolean;
  submit(): Promise<any>;
  refresh(): void;
  get view(): FormViewBlock;
  get state(): FormState;
  get record(): DataRecord;
  setState<K extends keyof FormState>(
    key: K,
    value?: FormState[K],
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
  implements IRecordStore
{
  _record: DataRecord;
  _origin: DataRecord;

  constructor(data: DataRecord) {
    super();
    this._record = { ...deepClone(data) };
    this._origin = { ...data };
    this._listeners = new Set();
  }

  reset(data: DataRecord) {
    this._record = { ...deepClone(data) };
    this._origin = { ...data };
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
      this._record = { ...record, ...data };
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
  _state: State;
  _form: IFormContext;
  _delay: number = 200;
  _onFocus: ((event: FocusEvent) => void) | null;
  _onBlur: ((event: Event) => void) | null;
  constructor(form: IFormContext, widget: WidgetBlock) {
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

  changed<K extends keyof State>(key: K, value?: State[K]) {
    if (this._state[key] !== value) {
      this._state = { ...this._state, [key]: value };
      return true;
    }
    return false;
  }

  setState<K extends keyof State>(key: K, value?: State[K]) {
    this.form.setStateUid(this._state.uid, key, value);
  }

  get state() {
    return this._state;
  }

  get form(): FormContextObject {
    return this._form as FormContextObject;
  }

  trigger(ctx: object) {
    const block = this._widget;

    if (block.hideIf) {
      this.setState("hidden", block.hideIf(ctx));
    }

    if (block.readonlyIf) {
      this.setState("readonly", block.readonlyIf(ctx));
    }

    if (this.isField && this.field.requiredIf) {
      this.setState("required", this.field.requiredIf(ctx));
    }
  }

  unregister() {
    this._listeners.clear();
    this.form._unregister(this);
  }

  get widget() {
    return this._widget;
  }

  get name() {
    return this._widget.schema.name;
  }

  get field() {
    return this._widget as FieldBlock;
  }

  abstract get isField(): boolean;
}

class AnyWidgetState extends WidgetState implements IIWidgetState {
  constructor(form: IFormContext, widget: WidgetBlock) {
    super(form, widget);
  }

  get isField(): false {
    return false;
  }
}

class FieldState extends WidgetState implements IFieldState {
  constructor(form: IFormContext, widget: FieldBlock) {
    super(form, widget);
  }

  get default() {
    return pick(this._widget, "hidden", "readonly", "required", "disabled");
  }

  get isField(): true {
    return true;
  }

  get name() {
    return this._widget.schema.name!;
  }

  get widget() {
    return this._widget as FieldBlock;
  }

  reset() {
    const widget: WidgetBlock = this._widget;
    this._state = {
      ...omit(this._state, "dirty", "touched", "error", "valid"),
      ...this.default,
      filled: !!this.value,
      uid: this._widget.uid,
    };
  }

  set(value?: any, trigger: boolean = true, markDirty: boolean = true) {
    if (this.isField) {
      const next =
        typeof value === "string" && value.trim() === "" ? null : value;
      const prev = this.get();
      if (deepEqual(next, prev)) return;
      const dirty = markDirty && this.field.schema.canDirty !== false;
      const data = { [this.name!]: value };

      if (trigger) {
        this.form._onChange(data);
      } else {
        this._form.store.set(data, true, true);
      }
      if (markDirty && dirty !== this.state.dirty) {
        this.setState("dirty", true);
      }
    }
  }

  get(value?: any) {
    if (this.isField) {
      return this._form.store.get(this.name!, value);
    }
  }

  get value() {
    return this.get();
  }

  changed<K extends keyof State>(key: K, value?: State[K]) {
    if (this._state[key] !== value) {
      if (key === "error" && !!value !== !!this._state.error) {
        this._state = { ...this._state, valid: !value };
      }

      this._state = { ...this._state, [key]: value };

      if (key === "focused" && !value) {
        this.validate();
      }

      return true;
    }
    return false;
  }

  async commit(force?: boolean) {
    if (
      (force && this.state.dirty) ||
      (this.state.touched && this._form.isNew)
    ) {
      const result = await this.validate();
      if (!result || result.valid) {
        this.setState("dirty", false);
        this.setState("touched", !this._state.focused);
      }
    }
  }

  async validate() {
    if (this.state.dirty || this._form.isNew) {
      const props = this.field.schema;
      const context = this.form.context;
      const error = validate(this.value, {
        props,
        context,
        touched: this.state.touched,
        focused: this.state.focused,
      });
      this.setState("error", error);
      this.setState("filled", this.value != null);
      return {
        error,
        valid: !error,
      };
    }
  }

  compute(ctx: object) {
    if (this.isField && this.field.compute) {
      return this.field.compute(ctx);
    }
  }

  async onChange(ctx: object) {
    if (this.isField && this.field.onChange) {
      return await this.field.onChange(ctx);
    }
  }

  onRecord(value?: any, trigger: boolean = false) {
    const filled = value !== null;
    if (this.state.filled !== filled)
      if (trigger) {
        this.setState("filled", value != null);
        return;
      }
    this._state = { ...this.state, filled };
  }
}

type Pending = {
  keys?: Set<string>;
  states?: Set<IWidgetState>;
};

type FormOptions = {
  refresh?: () => void;
  submit: () => Promise<any>;
  schedule: Schedule;
  readonly context: DataContext;
};

class FormContextObject extends Base implements IFormContext {
  _record: RecordStore;
  _widgets: Map<string, WidgetState> = new Map();
  _fields: Map<string, FieldState | FieldState[]> = new Map();
  _depends: Map<string, Set<string>> = new Map();
  _queue: TaskQueue = new TaskQueue();
  _keepLast: KeepLast = new KeepLast();

  _pending: Pending = {};
  _result: ComputeResult = {};
  _state: FormState = {
    change: 0,
    prev: 0,
  };
  _seq: number = 0;
  _subscribe: () => void;
  _editing: boolean = false;
  _readonly: boolean = false;
  _view: FormViewBlock;
  _options: FormOptions;

  constructor(data: DataRecord, view: FormViewBlock, options: FormOptions) {
    super();
    this._view = view;
    this._options = options;
    this._onRecord = this._onRecord.bind(this);
    this._record = new RecordStore(data);
    this._subscribe = this._record.subscribe(this._onRecord);
  }

  reset(data: DataRecord = this._record._origin) {
    this._seq++;
    this._queue.restart();

    this._result = {};
    this._pending = {};
    const rec = { ...data };

    if (!data.id) {
      this._fields.forEach((block) => {
        const schema = (Array.isArray(block) ? block[0] : block).field.schema;
        let defaults = schema.defaults;
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
    return this._editing;
  }
  get readonly() {
    return this._readonly;
  }

  get context() {
    return this._options.context;
  }

  register(block: WidgetBlock) {
    const s = block.schema;
    const widget = isFieldBlock(block)
      ? new FieldState(this, block)
      : new AnyWidgetState(this, block);

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

    if (widget.isField && !this.record.id) {
      let field = widget as FieldState;
      const schema = widget.field.schema;
      if (field.get() === undefined) {
        let defaults = schema.defaults;
        if (defaults !== undefined) {
          defaults = defaults === "" ? null : defaults;
          field.set(defaults, true, false);
        }
      }
    }

    return widget;
  }

  get isNew() {
    return !this.record.id;
  }

  get store(): IRecordStore {
    return this._record;
  }

  wState(str: string): State | undefined {
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

  setFState<K extends keyof State>(
    name: string,
    key: K,
    value?: State[K],
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

  setStateUid<K extends keyof State>(uid: string, key: K, value?: State[K]) {
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

  _onChange(data: Partial<DataRecord>) {
    const ignore = this._pending.keys;
    const keys = ignore
      ? Object.keys(data).filter((k) => !ignore.has(k))
      : Object.keys(data);
    if (keys.length) {
      const pendKeys = (this._pending.keys ??= new Set());
      keys.forEach((key) => pendKeys.add(key));
      this.store.set(data, true, true);
      const curSeq = this._seq;
      this._queue.add(async () => this.enqueue(keys, curSeq));
      this.onDone();
    } else {
      this.store.set(data, true, true);
    }
  }

  async enqueue(keys: string[], seq: number) {
    let changes: ComputeResult = this._result;
    for (const key of keys) {
      const fields = this._fields.get(key);

      if (fields) {
        const field = Array.isArray(fields)
          ? fields.find((f) => f.field.onChange)
          : fields;
        if (field?.field?.onChange) {
          const result = await field.onChange(this.context);
          if (seq !== this._seq) {
            return;
          }
          if (result) {
            this._result = changes = merge(changes, result);
          }
        }
      }
    }

    if (seq !== this._seq) return;

    const values = changes.values;
    const newKeys = values ? Object.keys(values) : EMPTY_ARRAY;

    const pending = (this._pending.keys = new Set([
      ...(this._pending.keys ?? EMPTY_ARRAY),
      ...keys,
      ...(values ? Object.keys(values) : EMPTY_ARRAY),
    ]));

    this._pending.keys = pending;

    delete changes.values;

    if (newKeys.length) {
      this._record.set(values!);
    }

    ["hidden", "readonly", "required", "valid", "error"].forEach((stateKey) => {
      const keyOf = stateKey as keyof ComputeResult;
      if (stateKey in changes && changes[keyOf]) {
        Object.entries(changes[keyOf]).forEach(([key, value]) =>
          this.setFState(key, keyOf as keyof State, value, false),
        );
      }
    });

    return await this.compute(pending, seq);
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
        const prom = (trigger as IFieldState).compute(context);
        if (seq !== this._seq) return;
        if (prom) {
          const result = await prom;
          if (result !== undefined && trigger.name) {
            this._record.set({ [trigger.name]: result });
          }
        }
      }
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

  submit() {
    return this._options.submit();
  }

  refresh() {
    return this._options.refresh?.();
  }

  get view() {
    return this._view;
  }

  get state() {
    return this._state;
  }

  setState<K extends keyof FormState>(
    key: K,
    value?: FormState[K],
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
export const IFormContext = React.createContext<IFormContext>();
export const useFormContext = () => React.useContext(IFormContext);

const createFormContext = (
  data: DataRecord,
  view: FormViewBlock,
  options: Readonly<FormOptions>,
): IFormContext => new FormContextObject(data, view, options);

export const useCreateFormContext = () => {
  const { tab, dataStore } = useResourceContext();
  const view = (useViewBlockContext() ?? tab.state.block) as FormViewBlock;
  const route = useTabRoute("form");

  const {
    data: record,
    error,
    state,
    retryFn,
  } = useAsync<DataRecord>(
    async (signal) =>
      route?.id ? dataStore.read(parseInt(route?.id), { signal }) : {},
    [route?.id],
  );

  const context = useLazyRef(() =>
    tab.action.evalContext._subContext({
      get _record() {
        return form.record;
      },
    }),
  );

  /** Imperatively run a function on the next layout effect cycle. */
  const schedule = useScheduleLayoutEffect();

  const options = useLazyRef(() => {
    const submit = async () => {
      const rec = form.record;

      await dataStore.save(rec, {});
    };
    return {
      schedule,
      refresh: retryFn,
      submit,
      get context() {
        return context.current;
      },
    };
  });

  const form = React.useMemo(() => {
    return createFormContext(record ?? {}, view, options.current);
  }, [view]);

  React.useEffect(() => {
    return () => form.close();
  }, [form]);

  React.useEffect(() => {
    form.setState("status", state, false);

    form.setState("error", error, false);

    if (!state && record) {
      const rec = form.store.rec;
      if (record.id && record.id === rec.id) {
        if (deepEqual(rec, record)) {
          return;
        }
      } else if (!record.id && !rec.id) {
        return;
      }

      form.reset(record);
    } else {
      form.emit();
    }
  }, [record, error]);

  return form;
};

export const useCreateSubFormContext = () => {
  //const parent = useFormContext();
  const view = useViewBlockContext() as FormViewBlock;
  const fieldState = React.useContext(WidgetStateContext) as IFieldState;

  const parent = fieldState.form;

  const context = useLazyRef(() => {
    const fields = new Map();
    const visit = (widget: Schema) => {
      if (isField(widget)) {
        fields.set(widget.name, widget);
      }
      if (isContainer(widget)) {
        widget.items.forEach(visit);
      }
    };

    visit(view.schema);
    const result = createEvalContext(
      {
        ...parent.store.get(fieldState.name, {}),
      },
      {
        valid: (name?: string) =>
          !name || form.field(name)?.state?.valid !== false,
        field: fields.get.bind(fields),
        execute: (action: string, options?: DataContext) => {
          return Promise.resolve();
        },
        record: form.record,
      },
    );

    return result;
  });

  /** Imperatively run a function on the next layout effect cycle. */
  const schedule = useScheduleLayoutEffect();

  const options = useLazyRef(() => {
    const submit = async () => {};
    return {
      schedule,
      //refresh: ,
      submit,
      get context() {
        return context.current;
      },
    };
  });

  const form = React.useMemo(() => {
    return createFormContext({}, view, options.current);
  }, [view]);

  const dataSource = React.useMemo(
    () => new DataSource(fieldState.widget.schema.target!),
    [fieldState],
  );
  /*
  const records = React.useSyncExternalStore(
    dataStore.subscribe,
    React.useCallback(() => dataStore.records, [dataStore]),
  );*/

  React.useEffect(() => {
    let oldValue:any;
    return parent.store.subscribe(async (data) => {
      if (!data || data[fieldState.name] != undefined) {
        if(oldValue === fieldState.value)
          return
        oldValue = fieldState.value;
        if (fieldState.value) {
          const rec = await dataSource.read(fieldState.value);
          form.reset(rec)
        } else {
          form.reset(EMPTY_RECORD)
        }
      }
    });
  }, [parent]);

  return form;
};

export const useRecord = () => {
  const form = useFormContext();
  const record = React.useSyncExternalStore(form.onRecord, form.store.snapshot);

  return record;
};

export function usePagination(
  dataStore: DataStore,
  record: DataRecord,
  readonly?: boolean,
) {
  const { offset = 0, limit = 0, total = 0 } = dataStore.page;
  const index = dataStore.records.findIndex((x) => x.id === record.id);

  const switchTo = useViewSwitch();

  const onPrev = React.useCallback(async () => {
    let prev = dataStore.records[index - 1];
    if (prev === undefined) {
      const { records = [] } = await dataStore.search({
        offset: offset - limit,
      });
      prev = records[records.length - 1];
    }
    const id = String(prev.id);
    const props = { readonly };
    switchTo("form", { route: { id }, props });
  }, [dataStore, index, limit, offset, readonly, switchTo]);

  const onNext = React.useCallback(async () => {
    let next = dataStore.records[index + 1];
    if (next === undefined) {
      const { records = [] } = await dataStore.search({
        offset: offset + limit,
      });
      next = records[0];
    }
    const id = String(next.id);
    const props = { readonly };
    switchTo("form", { route: { id }, props });
  }, [dataStore, index, limit, offset, readonly, switchTo]);

  const canPrev = index > -1 && offset + index > 0;
  const canNext = index > -1 && offset + index < total - 1;

  const text =
    index > -1 ? i18n.get("{0} of {1}", offset + index + 1, total) : "";

  return {
    canPrev,
    canNext,
    onPrev,
    onNext,
    text,
  };
}

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

export function getEmptyWidgetState(): IWidgetState {
  if (emptyWidgetState) return emptyWidgetState;

  //class EmptyFormContext
  const emptyBlock: WidgetBlock = {
    schema: EMPTY_RECORD as any,
    tag: "other",
    uid: "",
    sType: "",
  };
  class EmptyStateWidget implements IWidgetState {
    subscribe(callback: () => void): () => void {
      return noop;
    }
    snapshot(): State {
      return EMPTY_RECORD as State;
    }
    get state(): State {
      return this.snapshot();
    }
    setState<K extends keyof State>(key: K, value?: State[K]): void {}
    emit(): void {}
    trigger(ctx: object): void {}
    unregister(): void {}
    get name(): string | undefined {
      return undefined;
    }
    get widget(): WidgetBlock<Widget> {
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
