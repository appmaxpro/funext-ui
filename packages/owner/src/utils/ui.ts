'use client';
import type { Theme } from "~/ui";
import React from "react";
import * as ReactIs from "react-is";
import get from "lodash/get";
import type { Field, Property, Schema } from "./data-types";

export function getDrawerSxTransitionMixin(isExpanded: boolean, property: string) {
  return {
    height: '100%',
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

export function isReactType(item:any) {
  return ReactIs.isValidElementType(item)
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


// Note: determining the types is typically needed only on the new page (thus: in `pageswap`)
// However, because we set the `view-transition-names` based on the types (see `mpa.css`)
// we also determine it on the outgoing page.
window.addEventListener("pageswap", async (e) => {
	if (e.viewTransition) {
    console.log(`pageSwap:`, navigation.activation);  
		// @TODO: If destination does not start with basePath, abort the VT
    /*
		const transitionType = determineTransitionType(e.activation?.from, e.activation?.entry);
		console.log(`pageSwap: ${transitionType}`);
		e.viewTransition.types.add(transitionType);

		// Persist transitionType for browsers that don’t have the Navigation API
		if (!window.navigation) {
			localStorage.setItem("transitionType", transitionType);
		}
    */
	}
});

window.addEventListener("pagereveal", async (e) => {
	if (e.viewTransition) {
    console.log(`pageReveal:`, navigation.activation);  
		// @TODO: If destination does not start with basePath, abort the VT
    /*
		// Get transitionType from localStorage or derive it using the NavigationActivationInformation
		let transitionType;
		if (!window.navigation) {
			transitionType = localStorage.getItem("transitionType");
		} else {
			transitionType = determineTransitionType(navigation.activation.from, navigation.activation.entry);
		}

		console.log(`pageReveal: ${transitionType}`);
		e.viewTransition.types.add(transitionType);
    */
	}
});


// Determine the View Transition class to use based on the old and new navigation entries
// Also take the navigateEvent into account to detect UA back/forward navigations
// @TODO: Check for dead code paths now that reload is triggered manually
const determineTransitionType = (oldNavigationEntry:any, newNavigationEntry:any) => {
	if (!oldNavigationEntry || !newNavigationEntry) {
		return 'unknown';
	}

	const currentURL = new URL(oldNavigationEntry.url);
	const destinationURL = new URL(newNavigationEntry.url);

	const currentPathname = currentURL.pathname.replace('/', '');
	const destinationPathname = destinationURL.pathname.replace('/', '');

	if (currentPathname === destinationPathname) {
		return "reload";
	} else {
		let currentPageIndex = currentPathname.replace('/index', '').replace('/', '').replace('.html', '');
		let destinationPageIndex = destinationPathname.replace('/index', '').replace('/', '').replace('.html', '');

		// The first page has no number in its path
		let currentPage = currentPageIndex ? parseInt(currentPageIndex) : 1;
		let destinationPage = destinationPageIndex ? parseInt(destinationPageIndex) : 1;

		if (currentPage > destinationPage) {
			return 'backwards';
		}
		if (currentPage < destinationPage) {
			return 'forwards';
		}

		return 'unknown';
	}
};
