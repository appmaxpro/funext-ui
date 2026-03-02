"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

declare module "react" {
  interface Context<T> {
    _id: string;
  }
}

interface IContextProps<T> {
  value: T;
  children: React.ReactNode;
  name?: string;
}

interface IContext<T> {
  getChildContext: () => any;
  componentWillUnmount: () => void;
  shouldComponentUpdate: (props: T) => boolean | undefined;
  _id: string;
  _defaultValue?: T;
  _subs: Set<React.ReactNode> | null;
}

export let i = 0;

export function createContext<T>(defaultValue: T) {
  function Context(props: IContextProps<T>) {
    const topic = useMemo(() => crypto.randomUUID(), []);
    
    const value = props.value;

    /** provider notification */
    useEffect(() => {
      const event = new CustomEvent("context_provider", {
        detail: {
          topic,
          id: _id,
        },
      });

      window.dispatchEvent(event);
    }, []);

    /** change notification */
    useEffect(() => {
      const event = new CustomEvent(topic, { detail: value });
      window.dispatchEvent(event);
    }, [value]);

    return props.children;
  }

  const _id = "__cC" + i++;
  Context._id = _id;
  Context._defaultValue = defaultValue;

  /** @type {import('./internal').FunctionComponent} */
  Context.Consumer = (props: any, contextValue: T) => {
    return props.children(contextValue);
  };

  // we could also get rid of _contextRef entirely
  Context.Provider =
    Context._contextRef =
    (Context.Consumer as any).contextType =
      Context;

  return Context;
}

interface ContextEvent<T = any> {
  detail: ContextData<T>;
}

interface ContextData<T = any> {
  id: string;
  topic: string;
}

export function useContext<T>(context: React.Context<T>) {
  const topic = useRef<string | null>(null);
  const [value, setValue] = useState<T | undefined>();

  /** listening for provider topic */
  useEffect(() => {
    const onTopic = (event: { detail: T }) => {
      setValue(event.detail);
    };

    const onProvider = (event: ContextEvent<T>) => {
      if (!topic.current && event.detail.id === context._id) {
        topic.current = event.detail.topic;
        //@ts-ignore
        window.addEventListener(topic.current!, onTopic);
      }
    };

    //@ts-ignore
    window.addEventListener("context_provider", onProvider);

    return () => {
      //@ts-ignore
      window.removeEventListener("context_provider", onProvider);
      //@ts-ignore
      window.removeEventListener(topic.current!, onProvider);
    };
  }, []);

  return value ?? (context as any).defaultValue;
}
