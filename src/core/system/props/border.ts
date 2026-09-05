import { TSubtleVariant, TVariant } from "../theme";
import { Config } from "../types";

export interface BorderProps {
  border?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  borderStart?: boolean;
  borderEnd?: boolean;
  borderWidth?: 0 | 1 | 2 | 3 | 4 | 5;
  borderColor?: TVariant | TSubtleVariant | "black" | "white";
  borderTranslucent?: boolean;
  rounded?: boolean | 0 | 1 | 2 | 3 | "circle" | "pill";
  roundedTop?: boolean;
  roundedBottom?: boolean;
  roundedStart?: boolean;
  roundedEnd?: boolean;
}

const border = (name: string) => (value: any) => {
  if (value === true) return name;
  if (value === false) return `${name}-0`;
  return `border-${value}`;
};

const rounded = () => (value: any) => {
  if (value === true) return `rounded`;
  if (value === false) return `rounded-0`;
  return `rounded-${value}`;
};

const roundedSide = (name: string) => (value: any) => {
  if (value) return name;
};

export const BorderConfig: Config<BorderProps> = {
  border: border("border"),
  borderTop: border("border-t"),
  borderBottom: border("border-b"),
  borderStart: border("border-s"),
  borderEnd: border("border-e"),
  borderWidth: border("border"),
  borderColor: border("border"),
  borderTranslucent: (value) => {
    if (value) {
      return {
        styles: {
          "--bs-border-color": "var(--bs-border-color-translucent)",
        } as any,
      };
    }
  },
  rounded: rounded(),
  roundedTop: roundedSide("rounded-t"),
  roundedBottom: roundedSide("rounded-b"),
  roundedStart: roundedSide("rounded-s"),
  roundedEnd: roundedSide("rounded-e"),
};
