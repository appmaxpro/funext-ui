import React from "react";
import { useDrag } from "react-dnd";
import { Divider } from "../mui";
import { styled } from "..";
import Separator from "../mui/components/internal/svg-icons/Separator";

export function GridColumResizer(props: React.HTMLAttributes<HTMLSpanElement>) {
  const [, drag, preview] = useDrag(
    () => ({
      type: "COLUMN_RESIZER",
      item: {},
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [],
  );
  return (
    <ColumnSeparatorRoot ref={drag} {...props}>
      {preview && <span ref={preview} />}
      <Separator size="md" />
    </ColumnSeparatorRoot>
  );
}

const ColumnSeparatorRoot = styled("div", {
  name: "MuxDataGrid",
  slot: "columnSeparator",
})({
  position: "absolute",
  overflow: "hidden",
  zIndex: 3,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  maxWidth: 10,
  color: "var(--tw-hd-lg)",
});
