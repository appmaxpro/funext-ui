type SaleEntryProps = {
  balance: string | number;
  count: number;
};

type SaleEntryUserProps = SaleEntryProps & {
  id: number;
  title: string;
};

type SaleEntryTargetProps = SaleEntryUserProps & {
  target: string;
  percent: number;
};

type SaleTargetSideProps = SaleEntryProps & {
  outside: SaleEntryProps;
  inside: SaleEntryProps;
};

type SaleTargetProps = Omit<SaleEntryTargetProps, "id"> & {
  id?: number;
  type: "states" | "state" | "branch";
  items: SaleEntryUserProps[] | SaleEntryTargetProps[];
  footer: string;
  sub_link: string;
  company: SaleTargetSideProps;
  individual: SaleTargetSideProps;
  state_id?: number;
  date_format?: string;
};

type SaleTargetStatesProps = Omit<SaleTargetProps, "type" | "items"> & {
  type: "states" | "state";
  items: SaleEntryTargetProps[];
};

type SaleTargetStateProps = Omit<SaleTargetStatesProps, "type"> & {
  id: number;
  type: "state";
};

type SaleTargetBranchProps = Omit<SaleTargetProps, "type" | "items"> & {
  id: number;
  state_id: number;
  type: "branch";
  items: SaleEntryUserProps[];
};

export type {
  SaleEntryProps,
  SaleEntryUserProps,
  SaleEntryTargetProps,
  SaleTargetProps,
  SaleTargetStatesProps,
  SaleTargetStateProps,
  SaleTargetBranchProps,
  SaleTargetSideProps
};
