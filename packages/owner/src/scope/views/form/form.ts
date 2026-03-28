import { noop, useLazyRef } from "@funext/ui";
import { isEqual, merge, omit, pick } from "lodash";
import React from "react";
import {
  useFormContext,
  useResourceContext,
  useViewBlock,
  useViewContext,
  useWidgetState,
} from "~/context";
import { useAsync } from "~/hooks/use-async";
import {
  DefaultActionExecutor,
  defaultEvalContext,
  evalProps,
  unSafeRenderBlock,
  useTabRoute,
  useViewSwitch,
} from "~/scope";
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
  removeEmpty,
  getDefaultValue,
  getDefaultValues,
  type Block,
  type DataContext,
  type DataRecord,
  type DeepPath,
  type FieldBlock,
  type FieldErrors,
  type FormViewBlock,
  type Schema,
  type Widget,
  type WidgetBlock,
  EMPTY_OBJECT,
  getWidgetItems,
} from "~/utils";
import {
  createEvalContext,
  createRef,
  type EvalContextOptions,
} from "~/utils/eval-context";
import { validate } from "~/utils/validate";

import { useScheduleLayoutEffect } from "~/hooks/use-schedule-layout-effect";
import type {
  ActionExecuter,
  ActionHandler,
  BasicWidgetState,
  EditableFormState,
  FormState,
  ICommitter,
  IFieldState,
  IFormContext,
  IIWidgetState,
  IRecordStore,
  IValidator,
  IWidgetState,
} from "~/scope";
import { useActionHandler } from "./form-handler";
import type { FilterFormProps } from "./shared";

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

class Base<A extends any = any, L extends (...args: A[]) => void = () => void> {
  _listeners: Set<L> = new Set();
  _parent?: BasicWidgetState;
  constructor(parent?: BasicWidgetState) {
    this._parent = parent;
    this.subscribe = this.subscribe.bind(this);
    this.emit = this.emit.bind(this);
  }
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

  get parent() {
    return this._parent;
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
    this.snapshot = this.snapshot.bind(this);
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
      console.log("IRecordStore: changes:", values);
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
  _block: WidgetBlock;
  _state: State;
  _form: IFormContext;
  _delay: number = 200;
  _onFocus: ((event: FocusEvent) => void) | null;
  _onBlur: ((event: Event) => void) | null;
  constructor(
    form: IFormContext,
    block: WidgetBlock,
    parent?: BasicWidgetState,
  ) {
    super(parent ?? form);
    this._form = form;
    this._block = block;
    this._state = { ...this.default, uid: block.uid };
    this._onFocus = null;
    this._onBlur = null;
    this.snapshot = this.snapshot.bind(this);
    this.init();
  }

  init() {
    //_widget
    const props = evalProps(this.block, this.form.context);
    if (props != null && Object.keys(props).length) {
      this._state = { ...this._state, props };
    }
  }

  get default() {
    return pick(this._block, "hidden", "disabled");
  }

  reset() {
    const props = evalProps(this.block, this.form.context);
    this._state = {
      ...this.default,
      props,
      uid: this._block.uid,
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

  get context() {
    return this.form.context;
  }

  trigger(ctx: object) {
    const block = this._block;

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

  get block() {
    return this._block;
  }

  get name() {
    return this._block.schema.name;
  }

  get field() {
    return this._block as FieldBlock;
  }

  abstract get isField(): boolean;
}

class AnyWidgetState extends WidgetState implements IIWidgetState {
  constructor(
    form: IFormContext,
    widget: WidgetBlock,
    parent?: BasicWidgetState,
  ) {
    super(form, widget, parent);
  }

  get isField(): false {
    return false;
  }
}

class ValueState extends Base {
  field: IFieldState;
  constructor(field: IFieldState) {
    super();
    this.field = field;
    this.snapshot = this.snapshot.bind(this);
  }

  snapshot() {
    return this.field.value;
  }
}

class FieldState extends WidgetState implements IFieldState {
  _value: ValueState;
  constructor(
    form: IFormContext,
    widget: FieldBlock,
    parent?: BasicWidgetState,
  ) {
    super(form, widget, parent);
    this._value = new ValueState(this);
  }

  get default() {
    return pick(this._block, "hidden", "readonly", "required", "disabled");
  }

  get isField(): true {
    return true;
  }

  get name() {
    return this._block.schema.name!;
  }

  get block() {
    return this._block as FieldBlock;
  }

  get readOnly() {
    return (
      (!this.form.editing || this.form.readonly || this.state.readonly) === true
    );
  }

  reset() {
    const widget: WidgetBlock = this._block;
    this._state = {
      ...omit(this._state, "dirty", "touched", "error", "valid"),
      ...this.default,
      filled: !!this.value,
      uid: this._block.uid,
    };
  }

  set(value?: any, trigger: boolean = true, markDirty: boolean = true) {
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

    this._value.emit(value);
    this.emit();

    if (markDirty && dirty !== this.state.dirty) {
      this.setState("dirty", true);
    }
  }

  get(value?: any) {
    return this._form.store.get(this.name!, value);
  }

  get value() {
    return this.get();
  }

  changed<K extends keyof State>(key: K, value?: State[K]) {
    if (this._state[key] !== value) {
      if (key === "error" && value !== this._state.error) {
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
        //this.setState("dirty", false);
        this.setState("touched", !this._state.focused);
      }
    }
  }

  async validate() {
    if (this.state.dirty || this._form.isNew) {
      const props = this.field.schema;
      const context = this.context;

      if (this.block.validate) {
        const oldError = this.state.error;
        await this.block.validate(context);
        if (this.state.error !== oldError && this.state.error) {
          //this.setState("error", error);
          return {
            error: this.state.error,
            valid: false,
          };
        }
      }

      if (this.block.validIf) {
        const valid = await this.block.validIf(context);
        if (valid) {
          this.setState("error", undefined);
          this.setState("valid", true);
          return { valid: true };
        }
        const error = {
          ...this.state.error,
          error: i18n.t("Evaluate field validation error.."),
        };
        this.setState("error", error);
        this.setState("valid", false);
        return {
          error,
          valid: false,
        };
      }

      const error = validate(this.value, {
        props,
        context,
        touched: this.state.touched,
        focused: this.state.focused,
      });
      this.setState("error", error);
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
    const filled = value != null;
    this._value.emit(value);
    if (this.state.filled !== filled) {
      if (trigger) {
        this.setState("filled", filled);
        return;
      }
      this._state = { ...this.state, filled };
    }
  }

  resetState() {
    const oldSate = this._state;
    this._state = {
      ...this.state,
      error: undefined,
      dirty: false,
      valid: true,
    };
    if (!isEqual(removeEmpty(oldSate), removeEmpty(this._state)))
      this.form.toEmit(this);
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

class FormContextObject extends Base implements EditableFormState {
  _record: RecordStore;
  _widgets: Map<string, WidgetState> = new Map();
  _fields: Map<string, FieldState> = new Map();
  _holds: Set<FieldState> = new Set();
  _depends: Map<string, Set<string>> = new Map();

  _pending: Pending = {};
  _result: ComputeResult = {};
  _state: FormState = {
    uid: "",
    readonly: true,
    dirty: false,
    valid: true,
    change: 0,
    prev: 0,
  };
  _seq: number = 0;
  _close: boolean = false;
  _subscribe: () => void;
  _editing: boolean = false;
  _readonly: boolean = false;
  _view: FormViewBlock;
  _handler: ActionHandler;
  _executer: ActionExecuter;
  _parentForm?: IFormContext;
  _validators = new Set<IValidator>();
  _committers = new Set<ICommitter>();
  constructor(
    data: DataRecord,
    view: FormViewBlock,
    handler: ActionHandler,
    parent?: BasicWidgetState,
  ) {
    super(parent);
    this._view = view;
    this._handler = handler;
    this._state = {
      ...this._state,
      uid: view.schema.uid!,
      readonly: view.readonly,
      editing: view.editable,
    };
    this._record = new RecordStore(data);
    this._executer = new DefaultActionExecutor(handler);
    this._onRecord = this._onRecord.bind(this);
    this._subscribe = this._record.subscribe(this._onRecord);
    this.snapshot = this.snapshot.bind(this);
    this.submit = this.submit.bind(this);
    this.refresh = this.refresh.bind(this);
    this.validate = this.validate.bind(this);
    this.commit = this.commit.bind(this);
    if (parent) {
      let current: BasicWidgetState | undefined = parent;
      while (current) {
        if (current instanceof FormContextObject) {
          this._parentForm = current as unknown as IFormContext;
          break;
        }
        current = current.parent;
      }
    }
  }

  reset(data: DataRecord = this._record._origin, makeDefaults: boolean = true) {
    if (isEqual(data, this.record)) {
      return;
    }

    this._seq++;
    this._executer.restartQueue();

    this._result = {};
    this._pending = {};
    const rec = { ...data };

    if (!data.id && makeDefaults) {
      getDefaultValues(
        Array.from(this.list.map((item) => item.field.schema)),
        rec,
      );
    }
    this._state = {
      ...this._state,
      dirty: false,
      error: undefined,
      change: 0,
      prev: 0,
    };
    this._record.reset(rec);
    this._widgets.forEach((w) => w.reset());
    this._record.emit();
    const keys = Object.keys(rec);
    this.fields.forEach((f) => !keys.includes(f.name) && f.emit());
    this.emit();
  }

  register(block: WidgetBlock, parent?: BasicWidgetState) {
    const s = block.schema;
    const widget = isFieldBlock(block)
      ? new FieldState(this, block, parent)
      : new AnyWidgetState(this, block, parent);

    this._widgets.set(block.uid, widget);
    const depends = [...(s.depends?.split(",") ?? EMPTY_ARRAY)];
    if (widget.isField) {
      const name = block.schema.name!;
      let field = this._fields.get(name) as FieldState | undefined;

      if (field && field.state.hidden) {
        this._holds.add(field);
        field = undefined;
      }
      if (!field) {
        this._fields.set(name, widget as FieldState);
      }
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

    if (widget.isField && this.isNew) {
      let field = widget as FieldState;
      const schema = widget.field.schema;
      if (field.get() === undefined) {
        let defaults = getDefaultValue(schema);
        if (defaults !== undefined) {
          defaults = defaults === "" ? null : defaults;
          field.set(defaults, true, false);
        }
      }
    }

    return widget;
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
    const widget = state._block;
    this._widgets.delete(state._state.uid);
    this._pending.states?.delete(state);
    const depends = [...(widget.schema.depends?.split(",") ?? EMPTY_ARRAY)];
    if (state.isField) {
      let field = state as FieldState;
      if (!this._holds.delete(field)) {
        this._fields.delete(field.name);
        const holdField = this._holds
          .values()
          .find((item) => item.name === field.name);
        if (holdField) {
          let hasOther = holdField;
          if (holdField.state.hidden) {
            const visField = this._holds
              .values()
              .find((item) => item.name === field.name && !item.state.hidden);
            if (visField) {
              hasOther = visField;
            }
          }

          this._holds.delete(hasOther);
          this._fields.set(field.name, hasOther);
        }
      }
    }

    for (const name of depends) {
      let deps = this._depends.get(name);
      if (deps) {
        deps.delete(widget.uid);
        if (!deps.size) this._depends.delete(name);
      }
    }
  }

  addCommitter(fn: ICommitter) {
    this._committers.add(fn);
    return () => this._committers.delete(fn);
  }

  addValidator(fn: IValidator) {
    this._validators.add(fn);
    return () => this._validators.delete(fn);
  }

  render(block: Block, ref?: any) {
    if (this._close) return null;
    return unSafeRenderBlock(block, this.context, ref);
  }

  setFState<K extends keyof State>(
    name: string,
    key: K,
    value?: State[K],
    withDone?: boolean,
  ) {
    let field = this._fields.get(name);
    if (field && field.changed(key, value)) {
      this.toEmit(field, withDone);
      if (key === "dirty") this.checkDirty();
      if (key === "valid") this.checkValidity();
    }
  }

  setStateUid<K extends keyof State>(uid: string, key: K, value?: State[K]) {
    if (this.widget(uid)?.changed(key, value)) {
      this.toEmit(this.widget(uid)!);
      if (key === "dirty") this.checkDirty();
      if (key === "valid") this.checkValidity();
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
    this._executer.runLast(fn);
  }

  _onRecord(data: Partial<DataRecord> = this.record) {
    const dataKeys = Object.keys(data);

    if (!dataKeys.length) return;

    const ignore = this._pending.keys;
    const keys = ignore ? dataKeys.filter((k) => !ignore.has(k)) : dataKeys;
    const curSeq = this._seq;
    this.toEmitField(dataKeys, data);
    if (keys.length) {
      this._executer.run(async () => this.compute(keys, curSeq));
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
      this._executer.run(async () => this.enqueue(keys, curSeq));
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
    this._close = true;
    this._seq++;
    this._result = {};
    this._pending = {};
    this._executer.restartQueue();
    this.store.close();
    this._widgets.forEach((w) => w.close());
  }

  onRecord(callback: (data?: Partial<DataRecord>) => void) {
    return this.store.subscribe(callback);
  }

  snapshot() {
    return this.state;
  }

  async submit() {
    if (this.state.status !== "submit") await this.commit();
    if (this.dirty /*&& this.valid*/ && this.state.status !== "submit") {
      this.setState("status", "submit");
      try {
        const result = await this._handler.save();
        this.resetState();
        return result;
      } catch (e) {
        this.setState("error", e);
        this.setState("status", "error");
        console.error(e);
      }
    }
  }

  async refresh() {
    return await this._executer
      .runLast(async () => this._handler.refresh())
      .then(() => this.resetState());
  }

  async validate() {
    if (this.dirty) {
      return await this._executer.run(
        async () =>
          await Promise.all(this.list.map((field) => field.validate())),
      );
    }
  }

  async commit() {
    const promos = Promise.all(this.list.map((field) => field.commit()));
    return await this._executer.runNow(async () => await promos);
  }

  get editing() {
    return this._editing;
  }
  get readonly() {
    return this._readonly;
  }

  get record() {
    return this.store.rec;
  }

  get id() {
    return this.record.id;
  }

  get context() {
    return this._handler.context;
  }

  get isNew() {
    return !this.record.id;
  }

  get store(): IRecordStore {
    return this._record;
  }

  get view() {
    return this._view;
  }

  get state() {
    return this._state;
  }

  get dirty() {
    return this.state.dirty;
  }

  get valid() {
    return this.state.valid;
  }

  get list() {
    return this._fields.values();
  }

  get executer() {
    return this._executer;
  }
  get states() {
    return this._widgets;
  }

  get fields() {
    return this._fields;
  }

  get parentForm() {
    return this._parentForm;
  }

  checkDirty() {
    const dirty = this.list.some((field) => !!field.state.dirty);
    this.setState("dirty", dirty);
    this.checkValidity();
  }

  checkValidity() {
    const invalid = this.list.some((field) => !field.state.valid);
    this.setState("valid", !invalid);
  }

  resetState() {
    this.list.forEach((field) => field.resetState());
    this._state = {
      ...this._state,
      status: undefined,
      error: undefined,
      valid: true,
      dirty: false,
    };
    this.emit();
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

  emit() {
    this._state = { ...this._state, prev: this.state.change };
    this._handler.schedule(0, () => super.emit());
  }
}

export const useFormSate = () => {
  const form = useFormContext();
  const state = React.useSyncExternalStore(form.subscribe, form.snapshot);
  return state;
};

const createFormContext = (
  data: DataRecord,
  view: FormViewBlock,
  handler: Readonly<ActionHandler>,
): IFormContext => new FormContextObject(data, view, handler);

export const useCreateFormContext = (
  refreshRef: React.MutableRefObject<() => void>,
) => {
  //const { tab, dataStore } = useResourceContext();
  const { view, dataStore, evalContext, bind, fields } =
    useViewContext<FormViewBlock>();
  //const route = useTabRoute("form");

  let formRef = React.useRef<IFormContext>();

  const context = useLazyRef(() => {
    const map = new Map(fields?.map((field) => [field.name, field]));

    return createEvalContext(
      {},
      {
        popup: evalContext._popup,
        get record(): DataRecord {
          return formRef.current?.record ?? EMPTY_OBJECT;
        },
        field(name) {
          const form = formRef.current!;
          return form.field(name)?.block?.schema ?? map.get(name);
        },
        async execute(action: string, options: { context?: DataContext }) {
          const form = formRef.current!;
          switch (action) {
            case "save":
            case "submit":
              return await form.submit();
            case "validate":
              return await form.validate();
            case "commit":
              return await form.commit();
            default:
              return await form.executer.execute(action, options);
          }
        },
        //valid: v
      },
    );
  });

  /** Imperatively run a function on the next layout effect cycle. */
  const schedule = useScheduleLayoutEffect();

  const options = useLazyRef(() => {
    const submit = async () => {
      const rec = formRef.current!.record;

      await dataStore.save(rec, {});
    };
    const refresh = async () => {
      return refreshRef.current();
    };
    return {
      schedule,
      refresh,
      submit,
      get formContext() {
        return formRef.current!;
      },
      get context() {
        return context.current;
      },
    };
  });

  const handler = useActionHandler(options);

  const form = useLazyRef(() => {
    return createFormContext({}, view, handler);
  }).current;

  formRef.current = form;

  React.useEffect(() => {
    /*
    bind({
      fields,
      get context() {
        return form.record;
      },
      get evalContext() {
        return context;
      },
    });*/
    //form.re

    return () => {
      console.log("-----------Close Form-----------");
      form.close();
    };
  }, [form]);

  /*
  React.useEffect(() => {
    const formStatus = form.state.status;
    
    if (state === "loading") {
      if (formStatus !== "submit" && formStatus !== "validate") {
        form.setState('status', state)
      }
    }
  }, [state]);*/

  return form;
};

export const useCreateFilterForm = (props: FilterFormProps) => {
  const viewContext = useViewContext<FormViewBlock>();
  const { query } = useResourceContext();
  //const { tab, listParams, modifiers } =
  //const view = (useViewBlock() ?? tab.filter?.form) as FormViewBlock;
  const parentForm = useFormContext();
  const parentWidget = useWidgetState();
  const queryRef = React.useRef(query);

  queryRef.current = query;
  const propsRef = React.useRef(props);
  propsRef.current = props;

  let formRef = React.useRef<FormContextObject>();
  let viewContextRef = React.useRef(viewContext);
  viewContextRef.current = viewContext;

  const fields = React.useMemo(() => {
    const fields = new Map();
    const visit = (widget: Schema) => {
      if (isField(widget)) {
        fields.set(widget.name, widget);
      } else {
        getWidgetItems(widget).forEach(visit);
      }
    };

    visit(viewContext.view.schema);
    return fields;
  }, [viewContext.view]);

  const { filter } = props ?? EMPTY_OBJECT;

  let recordRef = React.useRef(EMPTY_OBJECT);
  //console.log("useCreateFilterForm:: filter:", filter)
  const hasRef = React.useRef(false);

  React.useEffect(() => {
    const rec = recordRef.current;
    if (filter) {
      const newFilter = fields
        .keys()
        .filter((name) => filter[name] != null)
        .reduce((acc, name) => ({ ...acc, [name]: filter[name] }), {} as any);

      recordRef.current = isEqual(newFilter, rec) ? rec : newFilter;
    } else {
      recordRef.current = isEqual(EMPTY_OBJECT, rec) ? rec : EMPTY_OBJECT;
    }
    //console.log("useCreateFilterForm:: reset:", recordRef.current !== rec, ", filter:", filter, ", current: ", recordRef.current, ", fields:", Array.from(fields.entries()))
    if (recordRef.current !== rec) {
      (formRef.current as any)?.reset(recordRef.current, false);
    }
  }, [filter]);

  

  const context = useLazyRef(() =>
    createEvalContext(
      {},
      {
        get record(): DataRecord {
          return formRef.current?.record ?? EMPTY_OBJECT;
        },
        popup: true,
        field: fields.get.bind(fields),
        async execute(action: string, options: { context?: DataContext }) {
          const form = formRef.current!;
          switch (action) {
            case "submit":
              return await form.submit();
            case "validate":
              return await form.validate();
            case "commit":
              return await form.commit();
            case "refresh":
              return await form.refresh();
            default:
              return await form.executer.execute(action, options);
          }
        },
      },
    ),
  );

  /** Imperatively run a function on the next layout effect cycle. */
  const schedule = useScheduleLayoutEffect();

  React.useEffect(() => {
    if (hasRef.current) {
      const tm = setTimeout(() => {
        hasRef.current = false;
        console.log("FilterSidebar: filter:", query?.filter);
        propsRef.current!.search?.();
      }, 500);
      return () => clearTimeout(tm);
    }
  }, [filter]);

  const options = useLazyRef(() => {
    const submit = async () => {
      const form = formRef.current!;

      const rec = form.record;
      console.log("FilterForm submit: ", rec);
      hasRef.current = true;
      propsRef.current.updateFilters(rec, false);
      
      schedule(8, () => propsRef.current.onSubmit?.());
    };

    const reset = async () => {
      const form = formRef.current!;
      const rec = form.record;
      const restRec = {} as any;
      Object.keys(rec).forEach((key) => (restRec[key] = null));
      //if(isEqual(recordRef.current, rec))
      //  return;

      form.reset({}, false);
      hasRef.current = true;
      propsRef.current.updateFilters(restRec);

      //schedule(9, () => propsRef.current.search?.());
      schedule(7, () => propsRef.current.onReset?.());
    };
    return {
      schedule,
      refresh: reset,
      submit,
      get formContext() {
        return formRef.current!;
      },
      get context() {
        return context.current;
      },
    };
  });

  const handler = useActionHandler(options);

  const form = React.useMemo(() => {
    return new FormContextObject(
      recordRef.current,
      viewContext.view,
      handler,
      parentWidget ?? parentForm,
    );
  }, [viewContext.view]);

  formRef.current = form;

  React.useEffect(() => {
    form.setState("editing", true);
    form.setState("readonly", false);
    return () => form.close();
  }, [form]);

  return form;
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
    get context(): DataContext {
      return defaultEvalContext;
    }
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
