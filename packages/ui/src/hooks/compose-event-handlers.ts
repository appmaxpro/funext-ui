/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function composeEventHandlers<
	EventType extends React.SyntheticEvent | Event
>(
	theirHandler: ((event: EventType) => any) | undefined,
	ourHandler?: (event: EventType) => any
): (event: EventType) => any {
	return (event) => {
		theirHandler && theirHandler(event);
		if (!event.defaultPrevented && ourHandler) {
			return ourHandler(event);
		}
	};
}
/*
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}*/