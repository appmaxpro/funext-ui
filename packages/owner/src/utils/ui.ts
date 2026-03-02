import type { Theme } from "@funext/ui/styles";
import React from "react";
import get from "lodash/get";
import type { Field, Property, Schema } from "./data-types";

export function getDrawerSxTransitionMixin(isExpanded: boolean, property: string) {
  return {
    transition: (theme: Theme) =>
      theme.transitions.create(property, {
        easing: theme.transitions.easing.sharp,
        duration: isExpanded
          ? theme.transitions.duration.enteringScreen
          : theme.transitions.duration.leavingScreen,
      }),
  };
}

export function getDrawerWidthTransitionMixin(isExpanded: boolean) {
  return {
    ...getDrawerSxTransitionMixin(isExpanded, 'width'),
    overflowX: 'hidden',
  };
}


/**
 * Extracts the `ref` from a React element, handling different React versions.
 */
export function getElementRef(element: unknown): React.Ref<unknown> | null {
  if (!React.isValidElement(element)) {
    return null;
  }

  const reactElement = element as React.ReactElement & { ref?: React.Ref<unknown> | undefined };
  const propsWithRef = reactElement.props as { ref?: React.Ref<unknown> | undefined } | undefined;

  return (/*isReactVersionAtLeast(19)*/ true ? propsWithRef?.ref : reactElement.ref) ?? null;
}




const TR_PREFIX = "t:";

function getTrKey(targetName: string) {
  if (targetName?.includes(".")) {
    const ind = targetName.lastIndexOf(".") + 1;
    return `${targetName.slice(0, ind)}${TR_PREFIX}${targetName.slice(ind)}`;
  }
  return `${TR_PREFIX}${targetName}`;
}

function getOptionLabel(option: unknown, key: string) {
  return get(option, getTrKey(key)) ?? get(option, key);
}

export function useOptionLabel({ targetName, targetSearch }: Property|Field) {
  return React.useCallback(
    (option: unknown) => {
      let label = getOptionLabel(option, targetName || "id");

      if (typeof label === "object") {
        const names = [
          ...(Array.isArray(targetSearch) ? targetSearch : []),
          "id",
        ];
        label = names.map((key) => getOptionLabel(label, key)).find((value) => value);
      }

      return label ?? "";
    },
    [targetName, targetSearch],
  );
}

/*

const getScrollbarWidth = () => {
    // Create a temporary div
    const scrollDiv = document.createElement('div');
    // Apply styles to force a scrollbar and hide it from view
    scrollDiv.style.overflowY = 'scroll';
    scrollDiv.style.width = '50px'; // Give it a fixed width
    scrollDiv.style.height = '50px'; // Give it a fixed height
    scrollDiv.style.visibility = 'hidden';
    scrollDiv.style.position = 'absolute';

    // Append to the body to measure
    document.body.appendChild(scrollDiv);

    // Calculate the scrollbar width (offsetWidth includes the scrollbar, clientWidth is the inner content area)
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Remove the temporary div
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
};*/


