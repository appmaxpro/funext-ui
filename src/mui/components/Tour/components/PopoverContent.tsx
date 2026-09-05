import React from "react";
import { defaultSlots, PopoverSlotProps } from "./index";
import { PopoverContentProps } from "../types";
import { StylesObj, stylesMatcher } from "../styles";
import { clsx } from "../../../styles";
import Panel from "../../Panel";

const PopoverContent: React.FC<PopoverContentProps> = ({
  styles,
  Slots,
  slotProps,
  className,
  badgeContent,
  accessibilityOptions,
  disabledActions,
  onCloseClick,
  steps,
  setCurrentStep,
  currentStep,
  transition,
  isHighlightingObserved,
  setIsOpen,
  nextButton,
  prevButton,
  disableDotsNavigation,
  rtl,
  showPrevNextButtons = true,
  showCloseButton = true,
  showNavigation = true,
  showBadge = true,
  showDots = true,
  meta,
  setMeta,
  setSteps,
  style,
  ...others
}) => {
  const getStyles = stylesMatcher(styles ?? {});

  const step = steps[currentStep];
  const { Badge, Close, Content, Navigation, Arrow } = defaultSlots(Slots);

  const {
    badge: badgeProps,
    close: closeProps,
    navigation: navigationProps,
    content: contentProps,
  } = slotProps ?? ({} as PopoverSlotProps);

  const badge =
    badgeContent && typeof badgeContent === "function"
      ? badgeContent({
          currentStep,
          totalSteps: steps.length,
          transition,
        })
      : currentStep + 1;

  function closeClickHandler() {
    if (!disabledActions) {
      if (onCloseClick && typeof onCloseClick === "function") {
        onCloseClick({
          setCurrentStep,
          setIsOpen,
          currentStep,
          steps,
          meta,
          setMeta,
          setSteps,
        });
      } else {
        setIsOpen(false);
      }
    }
  }

  return (
    <Badge
      placement={"top-start"}
      {...badgeProps}
      containerProps={{
        ...badgeProps?.containerProps,
        className: clsx("flex w-full", badgeProps?.containerProps?.className),
        ...(rtl && { dir: "rtl" }),
      }}
      content={badge}
      invisible={!showBadge}
      style={getStyles("badge", { currentStep, rtl })}
    >
      {showCloseButton ? (
        <Close
          size="sm"
          {...closeProps}
          aria-label={accessibilityOptions?.closeButtonAriaLabel}
          disabled={disabledActions}
          onClick={closeClickHandler}
          style={{
            ...getStyles("close", { currentStep, rtl }),
            ...closeProps?.style,
          }}
        />
      ) : null}
      <Panel
        className={clsx("flex flex-col w-full rounded-xl", className)}
        style={{
          ...getStyles("content", {
            showCloseButton,
            currentStep,
            transition,
          }),
          ...style,
        }}
        fill
        elevation={16}
        {...others}
      >
        <Content
          {...contentProps}
          content={step?.content}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          transition={transition}
          isHighlightingObserved={isHighlightingObserved}
          setIsOpen={setIsOpen}
        />
        {showNavigation ? (
          <Navigation
            {...navigationProps}
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
            setIsOpen={setIsOpen}
            steps={steps}
            styles={styles}
            aria-hidden={!accessibilityOptions?.showNavigationScreenReaders}
            nextButton={nextButton}
            prevButton={prevButton}
            disableDots={disableDotsNavigation}
            hideButtons={!showPrevNextButtons}
            hideDots={!showDots}
            disableAll={disabledActions}
            rtl={rtl}
            Arrow={Arrow}
          />
        ) : null}
      </Panel>
    </Badge>
  );
};

export default PopoverContent;
