import { Middleware, Placement, Alignment, Side } from "@floating-ui/react";

/**
 * Custom floating-ui middleware which calculates transform-origin X + Y offsets
 * based on the current floating rect's dimensions and shift offset.
 *
 * Scaling popovers with these transform-origin offsets will give the effect of
 * popvers slightly 'growing' from the origin/reference element.
 *
 * This middleware must be applied after both `@sanity/ui/size` and `shift` middlewares.
 */
export const origin: Middleware = {
  name: "@funext/ui/origin",
  fn({ middlewareData, placement, rects }) {
    const [side] = placement.split("-");

    const floatingWidth = rects.floating.width;
    const floatingHeight = rects.floating.height;

    const shiftX = middlewareData.shift?.x || 0;
    const shiftY = middlewareData.shift?.y || 0;

    if (floatingWidth <= 0 || floatingHeight <= 0) {
      return {};
    }

    const isVerticalPlacement = ["bottom", "top"].includes(side);

    const { originX, originY }: { originX: number; originY: number } =
      isVerticalPlacement
        ? {
            originX: clamp(0.5 - shiftX / floatingWidth, 0, 1),
            originY: side === "bottom" ? 0 : 1,
          }
        : {
            originX: side === "left" ? 1 : 0,
            originY: clamp(0.5 - shiftY / floatingHeight, 0, 1),
          };

    return {
      data: { originX, originY },
    };
  },
};

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export const transformOrigin = (options: {
  arrowWidth: number;
  arrowHeight: number;
}): Middleware => ({
  name: "transformOrigin",
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data;

    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const isArrowHidden = cannotCenterArrow;
    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;

    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[
      placedAlign
    ];

    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;

    let x = "";
    let y = "";

    if (placedSide === "bottom") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${-arrowHeight}px`;
    } else if (placedSide === "top") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${rects.floating.height + arrowHeight}px`;
    } else if (placedSide === "right") {
      x = `${-arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    } else if (placedSide === "left") {
      x = `${rects.floating.width + arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    }
    return { data: { x, y } };
  },
});

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Alignment] as const;
}
