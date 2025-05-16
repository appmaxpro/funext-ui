import * as React from "react";
import { AutoSelectProps } from "./types";

/**
 *
 * Demos:
 *
 * - [Autocomplete](https://next.mui.com/material-ui/react-autocomplete/)
 *
 * API:
 *
 * - [Autocomplete API](https://next.mui.com/material-ui/api/autocomplete/)
 */
export default function AutoSelect<
  Value,
  Multiple extends boolean | undefined = false,
>(props: AutoSelectProps<Value, Multiple>): React.JSX.Element;


export function AutoSelect<
Value,
Multiple extends boolean | undefined = false,
>(props: AutoSelectProps<Value, Multiple>): React.JSX.Element;
;