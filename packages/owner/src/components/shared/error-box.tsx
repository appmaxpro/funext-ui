import { i18n } from "~/utils/i18n";
import { Box, Text, Button } from "~/ui";
import { useCallback, useEffect, useRef } from "react";
import { useDialogs } from "~/hooks/use-dialogs";

export type ErrorProxProps = {
  status?: number;
  statusText?: string;
  error?: Error;
  detailsTitle?: string;
  resetTitle?: string;
  onRetry?: () => void;
  onReset?: () => void;
};

export function ErrorBox({
  status=500,
  statusText,
  error,
  detailsTitle = i18n.get("Details"),
  resetTitle = i18n.get("Reset"),
  onReset,
  onRetry = onReset,
}: ErrorProxProps) {
  const message =
    (statusText ?? status === 404)
      ? i18n.get("Page not found")
      : i18n.get("Unexpected error occurred");

  const { alert } = useDialogs();

  useEffect(() => {
    console.error("Got error:", error)
    //console.error(error?.stack);
  }, [error]);

  const showDetails = useCallback(() => {
    
    alert(
      <Box as="pre" flex={1} px={2}>
        {error?.stack ?? i18n.get("Something wont wrong.")}
      </Box>,
      {title: " "}
    );
  }, [error?.stack]);

  return (
    <Box d="flex" flexDirection='column' flex={1} alignItems="center" justifyContent="center" height="100%" gap={2}>
        <Box as="h2" fontWeight="bold" textAlign="center">
          {status}
        </Box>
        <Box as="p" fontSize={12}>
          <Text as="span" color="error">
            {i18n.get("Opps!")}
          </Text>{" "}
          {message}
        </Box>
        <Box
          d="flex"
          g={2}
          alignItems="center"
          justifyContent="center"
        >
          {error && (
            <Button color="secondary" onClick={showDetails}>
              {detailsTitle}
            </Button>
          )}
          {onRetry && (
            <Button color="primary" onClick={onRetry}>
              {resetTitle}
            </Button>
          )}
        </Box>
    </Box>
  );
}
