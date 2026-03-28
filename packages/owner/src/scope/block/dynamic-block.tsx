import {
  useMemo,
  useRef
} from "react";


import { EMPTY_ARRAY, EMPTY_OBJECT, removeEmpty, type DataRecord } from "~/utils";
import type { WidgetBlockProps } from "../types";
import { useEvalDataContext, useRecord } from "~/context";
import { get, isEqual } from "lodash";
import { useRenderBlock } from "./block";

export function DynamicBlock({
  block,
}: WidgetBlockProps) {

  const { schema } = block;
  
  const record = useRecord()
  const recordRef = useRef<DataRecord>();
  const dataRef = useRef<any>(EMPTY_OBJECT);
  const ctx = useEvalDataContext();
  const render = useRenderBlock();

  const fields = useMemo(
    () => new Set([schema.name, ...(schema.depends?.split(",")?.map((s) => s.trim()) ?? EMPTY_ARRAY)]
    .filter(Boolean)),
    EMPTY_ARRAY,
  );


  const {hidden} = useMemo(()=> {
    const data = {} as any;
    
    fields.forEach(name => data[name] = get(record, name));
    if(!isEqual(data, recordRef.current)){
      recordRef.current = data;
      const newEval = removeEmpty({
        hidden: block.hideIf?.(ctx) ?? block.hidden
      })
      if(!isEqual(newEval, dataRef.current)){
         dataRef.current = newEval
      }
    }
    return dataRef.current as any
  }, [record, block])


  if (hidden) {
     //console.log("BoxTemplate: ",namer, " not visible");
     return null
  }

  
  return (
    render(block, ctx)
  );
}
