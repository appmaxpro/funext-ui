import { Config, Responsive } from "../types";

export type TDisplay =
  | "none"
  | "inline"
  | "inline-block"
  | "block"
  | "grid"
  | "inline-grid"
  | "table"
  | "table-cell"
  | "table-row"
  | "flex"
  | "inline-flex";

export interface DisplayProps {
  d?: Responsive<TDisplay>;
  display?: Responsive<TDisplay>;
}

export interface DisplayPrintProps {
  print?: TDisplay;
}

const display = (name: string) => (value: any, breakpoint?: string) => {
  if (name) {
    return breakpoint ? `${breakpoint}:${name}-${value}` : `${name}-${value}`;
  } 
  return breakpoint ? `${breakpoint}:${value}` : `${value}`;
};

export const DisplayConfig: Config<DisplayProps & DisplayPrintProps> = {
  d: display(""),
  display: display(""),
  print: display("d-print"),
};
