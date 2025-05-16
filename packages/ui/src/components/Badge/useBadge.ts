import { usePrevious } from "../../hooks";

export interface UseBadgeParameters {
  /**
   * The content rendered within the badge.
   */
  content?: React.ReactNode;
  /**
   * If `true`, the badge is invisible.
   * @default false
   */
  invisible?: boolean;
  /**
   * Max count to show.
   * @default 99
   */
  max?: number;
  /**
   * Controls whether the badge is hidden when `badgeContent` is zero.
   * @default false
   */
  showZero?: boolean;
}

export interface UseBadgeReturnValue {
  /**
   * Defines the content that's displayed inside the badge.
   */
  content: React.ReactNode;
  /**
   * If `true`, the component will not be visible.
   */
  invisible: boolean;
  /**
   * Maximum number to be displayed in the badge.
   */
  max: number;
  /**
   * Value to be displayed in the badge. If `badgeContent` is greater than `max`, it will return `max+`.
   */
  displayValue: React.ReactNode;
}


function useBadge(parameters: UseBadgeParameters): UseBadgeReturnValue {
  const {
    content: badgeContentProp,
    invisible: invisibleProp = false,
    max: maxProp = 99,
    showZero = false,
  } = parameters;

  const prevProps = usePrevious({
    content: badgeContentProp,
    max: maxProp,
  });

  let invisible = invisibleProp;

  if (invisibleProp === false && badgeContentProp === 0 && !showZero) {
    invisible = true;
  }

  const { content, max = maxProp } = invisible ? prevProps : parameters;

  const displayValue: React.ReactNode =
  content && Number(content) > max ? `${max}+` : content;

  return {
    content,
    invisible,
    max,
    displayValue,
  };
}

export default useBadge;