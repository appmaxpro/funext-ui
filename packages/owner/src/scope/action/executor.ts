import isEmpty from "lodash/isEmpty";

//import { alerts } from "@/components/alerts";
//import { dialogs } from "@/components/dialogs";

import { block } from "~/components/http-watch/use-block";
import { i18n, type ActionOptions, type ActionResult, type DataRecord } from "~/utils";
import { TaskQueue, type Task } from "~/utils/queue";
import type {
  ActionExecuter,
  ActionHandler,
  DataActionOptions
} from "./types";

const queue = new TaskQueue();

const executeAction = async (handler: ActionHandler, options: ActionOptions) => {
  return block(() => handler.action(options).then(processActionResult));
};

function mergeValues(
  prevValues: Partial<DataRecord>,
  newValues: Partial<DataRecord>,
) {
  function merge(prev: any, curr: any): any {
    if (Array.isArray(curr)) {
      return curr.map((v: DataRecord) =>
        merge(
          prev?.find?.((p: DataRecord) => p.id === v.id),
          v,
        ),
      );
    }
    if (curr && prev && typeof curr === "object") {
      return {
        ...Object.keys(curr).reduce(
          (rec, k) => ({ ...rec, [k]: merge(prev[k], curr[k]) }),
          prev as DataRecord,
        ),
      };
    }
    return curr;
  }
  return merge(prevValues, newValues);
}

const processActionResult = (result: ActionResult[]): ActionResult[] => {
  let actionValueResult: ActionResult["values"] = {};
  const actionAttrResult: ActionResult["attrs"] = {};
  const otherResults: ActionResult[] = [];

  function setAttrs(key: string, values: Record<string, any>) {
    if (Object.keys(values).length > 0) {
      actionAttrResult![key] = {
        ...actionAttrResult?.[key],
        ...values,
      };
    }
  }

  function setValues(values: Partial<DataRecord>) {
    actionValueResult = mergeValues(actionValueResult!, values);
  }

  result.forEach((res) => {
    const { attrs, values, ...rest } = res;
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v && typeof v === "object" && "value" in v) {
          const { value, ...other } = v;
          setValues({
            [k]: value,
          });
          setAttrs(k, other);
        } else {
          setAttrs(k, v);
        }
      });
    }

    if (values) {
      setValues(values);
    }

    if (!isEmpty(rest)) {
      otherResults.push(rest);
    }
  });

  return [
    ...(isEmpty(actionAttrResult) ? [] : [{ attrs: actionAttrResult }]),
    ...(isEmpty(actionValueResult) ? [] : [{ values: actionValueResult }]),
    ...otherResults,
  ] as ActionResult[];
};

export async function executeNow(task: () => Promise<any>) {
  try {
    queue.pause();
    return await task();
  } finally {
    queue.resume();
  }
}

export class DefaultActionExecutor implements ActionExecuter {
  #handler;
  #queue = new TaskQueue(); 
  constructor(handler: ActionHandler) {
    this.#handler = handler;
  }

  #ensureLast(actions: string[], name: string) {
    const index = actions.indexOf(name);
    const length = actions.length;

    if (index > -1 && index !== length - 1) {
      throw new Error(
        i18n.get('Invalid use of "{0}" action, must be the last action.', name),
      );
    }

    return index > -1;
  }

  #enqueue(action: string, options?: ActionOptions) {
    return this.#queue.add(() => this.#execute(action, options));
  }

  async waitFor(interval = 50) {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), interval);
    });
  }

  async wait() {
    return this.#queue.wait();
  }

  async execute(action: string, options?: DataActionOptions) {
    const { enqueue = true, ...opts } = options ?? {} as any;
    try {
      return enqueue
        ? await this.#enqueue(action, opts)
        : await this.#execute(action, opts);
    } catch (e) {
      const message =
        typeof e === "string" ? e : e instanceof Error ? e.message : null;
      /*
      if (message) {
        dialogs.error({
          content: message,
        });
      }*/
      return Promise.reject(e);
    }
  }

  async #execute(action: string, options?: ActionOptions) {
    const actions = action
      .split(",")
      .map((x) => x.trim())
      .filter((x) => {
        // we may not need `sync` now
        if (x === "sync") {
          console.warn(
            `We don't need "sync" action now, remove it from: ${action}`,
          );
          return false;
        }
        return true;
      })
      .filter(Boolean);

    if (actions.length === 0) {
      return;
    }

    // `new` and `close` must be the last action
    this.#ensureLast(actions, "new");
    this.#ensureLast(actions, "close");

    // re-join to remove white spaces<
    action = actions.join(",");

    

    if (action === "new") {
      return this.#handler.edit(null);
    }

    if (action === "validate") {
      return this.#handler.validate();
    }

    if (action === "save") {
      return this.#handler.save();
    }

    const context = this.#handler.context;
    const model = context._model ?? options?.context?._model ?? "";
    const data = {
      ...options,
      context: {
        ...context,
        ...options?.context,
      },
    };

    const result = await executeAction(this.#handler, {
      ...data,
      action,
      model,
    });

    for (const item of result) {
      if (item) {
        await this.#handle(item, options);
      }
    }

    return result;
  }

  run<T>(task: Task<T>) {
    return this.#queue.add(task)
  }

  runLast(task: () => void) {
    return this.#queue.addLast(task)
  }

  runNow<T>(task: Task<T>) {
    try {
      this.#queue.pause();
      return task();
    } finally {
      this.#queue.resume();
    }
  }

  restartQueue() {
    this.#queue.restart();
  }

  async #handle(data: ActionResult, options?: DataActionOptions) {
    if (options?.handle) {
      await options?.handle(data);
    }

    /*

    if (data.info) {
      const waitForDialog = dialogs.box({
        title: data.info.title,
        content: data.info.message,
        yesNo: false,
        yesTitle: data.info.confirmBtnTitle,
      });
      if (data.reload || data.pending) {
        await waitForDialog;
        if (data.reload) {
          await this.#handler.refresh();
        }
        if (data.pending) {
          return this.#execute(data.pending, options);
        }
      }
    }

    if (data.notify) {
      if (Array.isArray(data.notify)) {
        data.notify.forEach((x) => alerts.info(x));
      } else {
        alerts.info(data.notify);
      }
      if (data.reload || data.pending) {
        if (data.reload) {
          await this.#handler.refresh();
        }
        if (data.pending) {
          return this.#execute(data.pending, options);
        }
      }
    }

    if (data.error) {
      await dialogs.box({
        title: data.error.title ?? i18n.get("Error"),
        content: data.error.message,
        yesTitle: data.error.confirmBtnTitle,
        yesNo: false,
      });
      if (data.error.action) {
        await this.#execute(data.error.action, options);
      }
      return Promise.reject();
    }

    if (data.alert) {
      const confirmed = await dialogs.box({
        title: data.alert.title ?? i18n.get("Warning"),
        content: data.alert.message,
        yesTitle: data.alert.confirmBtnTitle,
        noTitle: data.alert.cancelBtnTitle,
      });
      if (confirmed) {
        if (data.pending) {
          return await this.#execute(data.pending, options);
        }
        return;
      }
      if (data.alert.action) {
        await this.#execute(data.alert.action, options);
      }
      return Promise.reject();
    }

    if (data.errors) {
      let hasErrors = false;
      for (const [name, value] of Object.entries(data.errors)) {
        if (value.trim().length > 0) {
          hasErrors = true;
        }
        this.#handler.setAttrs([
          {
            target: name,
            name: "error",
            value,
          },
        ]);
      }
      if (hasErrors) {
        return Promise.reject();
      }

    }
      */

    if (data.values) {
      //this.#handler.setValues(data.values);
    }

    if (data.reload) {
      await this.#handler.refresh();
      if (data.pending) {
        await this.#execute(data.pending, options);
      }
      /*
      if (data.view) {
        this.#openView(data.view);
      }*/
      return;
    }

    if (data.validate) {
      await this.#handler.validate();
      if (data.pending) {
        await this.#execute(data.pending, options);
      }
      return;
    }

    if (data.save) {
      await this.#handler.save();
      if (data.pending) {
        await this.#execute(data.pending, options);
      }
      return;
    }

    if (data.new) {
      await this.#handler.edit(null);
      if (data.pending) {
        await this.#execute(data.pending, options);
      }
      return;
    }

    if (data.signal) {
      await this.#handler.onSignal(data.signal, data.signalData);
    }


  }


}
