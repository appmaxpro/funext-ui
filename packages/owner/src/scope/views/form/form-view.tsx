import * as React from "react";
import { useCreateFormContext, useFormSate, usePagination } from "./form";
import { Root, Field, Pane, FormTabs } from "./widget";

import { IFormContext, useFormContext, useViewContext } from "~/context";
import {
  meta,
  renderBlockItems,
  useGetViewState,
  useTabRoute,
  useViewTab,
  type BlockMeta,
  type EditableFormState,
} from "~/scope";
import {
  DataStore,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  i18n,
  type DataRecord,
  type FormViewBlock,
  type Identifier,
} from "~/utils";
import {
  AppBar,
  BackButton,
  Container,
  Icons,
  Loader,
  Toolbar,
} from "~/components/shared";
import {
  cn,
  Divider,
  Flex,
  IconButton,
  Stack,
  Text,
  useLazyRef,
  useRtl,
} from "@funext/ui";
import { useAsyncFetch } from "~/hooks/use-async-fetch";
import { isEqual, noop } from "lodash";

export function FormView() {
  const refreshRef = React.useRef<() => void>(noop);

  const form = useCreateFormContext(refreshRef);
  console.log("FormView::::", form);
  const route = useTabRoute("form");

  const { dataStore } = useViewContext<FormViewBlock>();

  const [record, setRec] = React.useState(EMPTY_OBJECT);
  const recordRef = React.useRef(record);
  const signalRef = React.useRef<AbortSignal>();
  const refresh = React.useCallback(
    async (id?: Identifier) => {
      const lodId = id ?? recordRef.current?.id;
      if (lodId) {
        const record = await dataStore.read(lodId, {
          signal: signalRef.current,
        });
        if (!isEqual(record, recordRef.current)) {
          recordRef.current = record;
          setRec(record);
          return record;
        }
        return recordRef.current;
      }
    },
    [dataStore],
  );

  const { state, fetch, isLoading, signal } = useAsyncFetch(refresh);

  signalRef.current = signal;
  refreshRef.current = fetch;

  React.useEffect(() => {
    fetch(route?.id);
  }, [fetch, route?.id]);

  React.useEffect(() => {
    form.setState("status", state);
  }, [state]);

  React.useEffect(() => {
    form.reset(record);
  }, [record]);

  React.useEffect(() => {
    return dataStore.subscribe(() => {
      //dataStore.records.findIndex((r) => r.id === res.id);
    });
  }, EMPTY_ARRAY);

  if (form.view.open === false) {
    return null;
  }

  return (
    <IFormContext.Provider value={form}>
      
      <Stack className="relative">
        <FormAppBar form={form as EditableFormState}/>

        <Container>
          <Toolbar />
          <FormRender form={form as EditableFormState} />
          <Toolbar />
          {state === "loading" && <Loader />}
        </Container>
        <Pagination dataStore={dataStore} record={record} />
        
      </Stack>
    </IFormContext.Provider>
  );
}

function FormAppBar({ name, form }: { name?: string; form: EditableFormState }) {
  const state = React.useSyncExternalStore(form.subscribe, form.snapshot);
  const tab = useViewTab()
  //const refresh = React.useCallback(()=> form.refresh
  return (
    <AppBar
      className="item-enter"
      color="default"
      position="fixed"
      elevation={0}
    >
      <Toolbar>
        <Flex items="center" gap={1}>
          <BackButton onClick={tab.goPrev}/>
          <ViewTitle form={form as EditableFormState} name={name}/>
        </Flex>

        <Flex items="center" ml="auto">
          <IconButton onClick={!state.status ? form.refresh : undefined}>
            <Icons.Refresh
              className={
                state.status === "loading" ? "animate-spin" : undefined
              }
            />
          </IconButton>
        </Flex>
      </Toolbar>
    </AppBar>
  );
}

function ViewTitle({ name, form }: { name?: string; form: EditableFormState }) {
  const getTile = React.useCallback(
    () =>
      form.record[name ?? "name"] ??
      form.record[name ?? "id"] ??
      i18n.t("No Title"),
    [form],
  );
  const title = React.useSyncExternalStore(form.subscribe, getTile);
  return (
    <Text
      variant="h5"
      noWrap
      component="div"
      className="grow"
    >
      {title}
    </Text>
  );
}

function Pagination({
  dataStore,
  record,
}: {
  dataStore: DataStore;
  record: DataRecord;
}) {
  const state = useFormSate();
  const rtl = useRtl();
  const PrevIcon = rtl ? Icons.ArrowForward : Icons.ArrowBack;
  const NextIcon = rtl ? Icons.ArrowBack : Icons.ArrowForward;
  const { canPrev, canNext, onPrev, onNext, text } = usePagination(
    dataStore,
    record,
    state.readonly,
  );

  return (
    <Stack className="fixed inset-x-0 bottom-0">
      <Container>
        <Toolbar className="flex no-wrap justify-between items-center">
          <IconButton onClick={onNext} disabled={!canPrev} size="lg" color="default" variant="filled">
            <PrevIcon />
          </IconButton>

          <IconButton onClick={onNext} disabled={!canNext} size="lg" color="default" variant="filled">
            <NextIcon />
          </IconButton>
        </Toolbar>
      </Container>
    </Stack>
  );
}

const FormRender = React.memo(({ form }: { form: EditableFormState }) => {
  const [com, setCom] = React.useState<React.ReactNode>();
  React.useEffect(() => {
    setCom(
      <Root form={form}>{renderBlockItems(form.view, form.context)}</Root>,
    );
  }, [form]);
  return com;
});

const MForm = meta(React.memo(FormView), { noProps: true });

const Wrapper = ({ block }: { block: any }) => {
  return <Pane block={block} defaults />;
};

const formMeta: Readonly<BlockMeta> = Object.freeze({
  wrap: Wrapper,
  noProps: true,
});

export const Form = {
  form: MForm,
  Field,
  Pane,
  Tabs: FormTabs,
  formMeta,
};
