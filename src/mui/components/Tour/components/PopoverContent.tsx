import React from "react";
import { defaultComponents } from "./index";
import { PopoverContentProps } from "../types";
import { StylesObj, stylesMatcher } from "../styles";

const PopoverContent: React.FC<PopoverContentProps> = ({
  styles,
  components = {},
  badgeContent,
  accessibilityOptions,
  disabledActions,
  onClickClose,
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
  badgeProps,
  closeProps,
}) => {
  const getStyles = stylesMatcher(styles ?? {});

  const step = steps[currentStep];
  const { Badge, Close, Content, Navigation, Arrow } =
    defaultComponents(components);

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
      if (onClickClose && typeof onClickClose === "function") {
        onClickClose({
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
        className: `flex w-full ${badgeProps?.containerProps?.className}`,
        ...(rtl && {dir: 'rtl'})
      }}
      content={badge}
      invisible={!showBadge}
    >
      {showCloseButton ? (
          <Close
            size="sm"
            {...closeProps}
            aria-label={accessibilityOptions?.closeButtonAriaLabel}
            disabled={disabledActions}
            onClick={closeClickHandler}
            style={{...getStyles("close", {currentStep, rtl}), ...closeProps?.style}}
          />
        ) : null}
      <div
        className="flex flex-col w-full"
        style={getStyles("content", {
          showCloseButton,
          currentStep,
          transition,
        })}
      >
        
        <Content
          content={step?.content}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          transition={transition}
          isHighlightingObserved={isHighlightingObserved}
          setIsOpen={setIsOpen}
        />
        {showNavigation ? (
          <Navigation
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
      </div>
    </Badge>
  );
};

export default PopoverContent;
