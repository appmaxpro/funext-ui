import { useMemo, useRef } from "react";
import { useEvalDataContext, useRecord } from "~/context";
import { EMPTY_ARRAY, type DataContext, type RelationField } from "~/utils";
import { createExtendedContext, createViewContext } from "../utils";
import { useLazyRef } from "~/ui";
import { processViewBlock } from "./block-processor";

type Props = {
  //name: string;
  field: RelationField;
  viewType: string;
};

function RelationBlock(props: Props) {
  const { field, viewType } = props;

  const ctx = useEvalDataContext();

  const record = useRecord();
  const contextRef = useLazyRef<DataContext>(() => ({
    [field.name]: record[field.name],
  }));
  const parentRef = useRef(ctx);

  const [block, context] = useMemo(() => {
    const view =
      (field.views?.find((v) => v.type === viewType) ?? field.pType === "mto")
        ? field.views?.find((v) => v.type === "form")
        : field.views?.find((v) => v.type === "list");

    if (view) {
      const ctx = createExtendedContext(view, contextRef, parentRef);
      const block = processViewBlock(view, ctx);
      return [block, ctx];
    }

    return EMPTY_ARRAY;
  }, [field, viewType]);


  
}
