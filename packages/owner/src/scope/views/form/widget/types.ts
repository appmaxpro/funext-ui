import type { IFieldState, IFState } from "~/scope/types";

export type FieldProps = {
  state: IFState;
  field: IFieldState;
  id: string;
  type?: string;
}

export type FieldControlProps = {
  field: IFieldState;
  state: IFState;
  children?: React.ReactNode;
  className?: string;
  showLabel?: boolean;
  withControl?: boolean;
}