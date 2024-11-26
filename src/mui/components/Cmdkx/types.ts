import { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import type { MaterialIconProps } from "../../../icons/material-icon";

export type IconName = MaterialIconProps['icon'];

export type ItemValueProps = {}


export type JsonStructure = Array<{
  items: Array<JsonStructureItem>;
  heading?: string;
  id: string;
}>;

export type JsonStructureItem = Omit<
  ItemValueProps,
  "index"
>;

export type RenderLink = (
  props: DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > & { "data-close-on-select"?: boolean }
) => ReactNode;
