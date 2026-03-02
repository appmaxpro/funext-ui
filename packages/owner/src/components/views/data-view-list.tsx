import { useParams } from "react-router";
import {  RecordContext, useViewContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import { ErrorBox } from "../app/error-box";
import type React from "react";

export function DataViewList({ children }: { children: React.ReactNode }) {
  const { dataStore } = useViewContext();
  let params = useParams();

  const { state, data, error, retryFn } = useAsync(async () => {
    return await dataStore!.search({})
  }, [params.id, dataStore]);

  if (state == "loading") {
    return;
  }

  if (state == "error") {
    return <ErrorBox status={500} error={error} onReset={retryFn} />;
  }

  return <RecordContext.Provider value={data as any}>{children}</RecordContext.Provider>;
}
