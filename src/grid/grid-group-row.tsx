import React from "react";
import { useClassNames } from "../core";

import { MaterialIcon } from "../icons/material-icon";
import styles from "./grid.module.scss";
import { useTranslation } from "./translate";
import * as TYPES from "./types";
import { useRtl, clsx, styled } from "..";

export const GridGroupRow = React.memo(function GridGroupRow(
  props: TYPES.GridRowProps,
) {
  const { className, selected, data, index, width, style, renderer, onClick } =
    props;
  const { state, record } = data;
  const { title, level, value, total } = record;
  const RowRenderer = renderer || GridGroupRowRoot;
  const rendererProps = renderer ? props : {};
  const classNames = useClassNames();
  const isRTL = useRtl();
  const t = useTranslation();

  return (
    <RowRenderer
      {...rendererProps}
      className={classNames(styles.row, styles.groupRow, className, {
        [styles.selected]: selected,
      })}
      {...((width || style) && { style: { width, ...style } })}
    >
      {new Array(level)
        .fill(0)
        .map((_, ind) =>
          ind !== 0 ? <div key={ind} className={styles.groupSpacer} /> : null,
        )}
      <div
        onClick={(e) => onClick && data && onClick(e as any, data, index)}
        className={clsx(styles.groupRowContent, 'inline-flex')}
      >
        <MaterialIcon
          className={clsx(styles.groupRowIcon, 'p-1')}
          size={22}
          icon={
            state === "close"
              ? isRTL
                ? "chevron_left"
                : "chevron_right"
              : "expand_more"
          }
        />
        {title} : {value} ({total} {t("items")})
      </div>
    </RowRenderer>
  );
});
const GridGroupRowRoot = styled('div', {
  name: 'MuxGridGroupRow',
})('');