import { RecordContext, useViewDataContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import React, { useCallback, useMemo } from "react";

import { Box, Flex, Stack } from "~/ui";
import {
  Container,
  EmptyData,
  ErrorBox,
  Skeleton,
  Toolbar,
} from "~/components";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { DateFilterButton } from "./data-view-filter";

export function DataViewSingle({
  children,
  id,
  ...rest
}: { children: React.ReactNode; id: string } & Record<string, any>) {
  const [date, storeDate] = useLocalStorage("sale.date", "this_month");

  const onDateChange = useCallback(
    (values: any) => {
      let value = values;
      if (Array.isArray(values)) {
        value = `range_${values[0].getTime()}-${values[1].getTime()}`;
      } else if (values instanceof Date) {
        value = `range_${values.getTime()}`;
      }
      storeDate(value);
    },
    [storeDate],
  );

  const dateParams = useMemo(() => {
    let ds = date?.replace("range_", "").split("-");
    if (ds && ds[0] && parseInt(ds[0])) {
      let d1 = new Date(parseInt(ds[0])).toISOString().split("T");
      let d2 =
        parseInt(ds[1]) && new Date(parseInt(ds[1])).toISOString().split("T");
      if (d1 && d2) {
        return `${d1} ${d2}`;
      }
      return d1;
    }
    return ds?.[0] ?? 'this_month';
  }, [date]) as string;

  const dateValue = useMemo(() => {
    let ds = date?.replace("range_", "").split("-");
    if (ds && ds[0] && parseInt(ds[0])) {
      let d1 = new Date(parseInt(ds[0]));
      let d2 = parseInt(ds[1]) && new Date(parseInt(ds[1]));
      if (d1 && d2) {
        return [d1, d2];
      }
      return d1;
    }
    return ds?.[0];
  }, [date]);
  
  return (
    <Container height="100%" {...rest}>
      <Box width="100%" className="flex justify-end">
        <DateFilterButton value={dateValue} onChange={onDateChange} />
      </Box>
      <DataView id={id} dateParams={dateParams}>{children}</DataView>
    </Container>
  );
}

function DataView({ children, id, dateParams }: { children: React.ReactNode; id: string, dateParams: string }) {
  const { dataStore } = useViewDataContext();
  console.log("dateParams:", dateParams)
  //let params = useParams();
  const { state, data, error, retryFn } = useAsync(async () => {
    if (id || dateParams) return await dataStore!
    .read(parseInt(String(id ?? "0") ), dateParams ? {'date': dateParams} : undefined);
  }, [id, dateParams, dataStore]);

  if (state === "loading") {
    return <Skeleton count={3} />;
  }

  if (state === "error") {
    return <ErrorBox status={500} error={error} onRetry={retryFn} />;
  }

  if (!data) {
    return <EmptyData />;
  }

  return (
    <RecordContext.Provider value={data}>{children}</RecordContext.Provider>
  );
}

const MemoDataView = React.memo(DataView, 
  (p1, p2) => p1.id === p2.id && p1.dateParams === p2.dateParams
);
