import {  RecordContext, useViewDataContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import { ErrorBox } from "../../../components/shared/error-box";
import type React from "react";

export function DataViewList({ children }: { children: React.ReactNode }) {
  const { dataStore } = useViewDataContext();
  //let router = useRouter();

  const { state, data, error, retryFn } = useAsync(async () => {
    return await dataStore!.search({})
  }, [dataStore]);

  if (state == "loading") {
    return;
  }

  if (state == "error") {
    return <ErrorBox status={500} error={error} onReset={retryFn} />;
  }

  return <RecordContext.Provider value={data as any}>{children}</RecordContext.Provider>;
}
