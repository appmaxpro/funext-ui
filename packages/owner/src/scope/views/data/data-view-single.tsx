import { useParams } from "react-router";
import { RecordContext, useViewDataContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import { ErrorBox } from "../../../components/shared/error-box";
import React from "react";
import { EmptyData } from "../../../components/shared/empty-data";
import { Container } from "../../../components/shared/container";

export function DataViewSingle({
  children,
  id,
  ...rest
}: { children: React.ReactNode; id: string } & Record<string, any>) {
  return (
    <Container {...rest}>
      <MemoDataView id={id}>{children}</MemoDataView>
    </Container>
  );
}

function DataView({ children, id }: { children: React.ReactNode; id: string }) {
  const { dataStore } = useViewDataContext();
  //let params = useParams();
  const { state, data, error, retryFn } = useAsync(async () => {
    if (id) return await dataStore!.read(parseInt(id));
  }, [id, dataStore]);

  if (state === "loading") {
    return;
  }

  if (state === "error") {
    return <ErrorBox status={500} error={error} onReset={retryFn} />;
  }

  if (!data) {
    return <EmptyData />;
  }

  return (
    <RecordContext.Provider value={data}>{children}</RecordContext.Provider>
  );
}

const MemoDataView = React.memo(DataView, (p1, p2) => p1.id === p2.id);
