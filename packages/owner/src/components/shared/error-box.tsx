import { i18n } from "~/utils/i18n";
import { Box, Text, Button } from "@funext/ui";
import { useCallback, useEffect, useRef } from "react";
import { useDialogs } from "~/hooks/use-dialogs";

export type ErrorProxProps = {
  status: number;
  statusText?: string;
  error?: Error;
  detailsTitle?: string;
  resetTitle?: string;
  onReset?: () => void;
};

export function ErrorBox({
  status,
  statusText,
  error,
  detailsTitle = i18n.get("Details"),
  resetTitle = i18n.get("Reset"),
  onReset,
}: ErrorProxProps) {
  const message =
    (statusText ?? status === 404)
      ? i18n.get("Page not found")
      : i18n.get("Unexpected error occurred");

  const isPrinted = useRef(false);

  const { confirm, alert } = useDialogs();

  useEffect(() => {
    console.error("Got error:", error)
    //console.error(error?.stack);
  }, [error]);

  const handleDetails = useCallback(() => {
    
    alert(
      <Box as="pre" flex={1} py={3} px={2}>
        {error?.stack ?? i18n.get("Something wont wrong.")}
      </Box>,
    );
  }, [error?.stack]);

  return (
    <Box d="flex" flex={1} alignItems="center" justifyContent="center" height="100%">
      <Box textAlign="center">
        <Box as="h1" fontWeight="bold">
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
          flex={1}
          alignItems="center"
          justifyContent="center"
        >
          {error && (
            <Button color="secondary" onClick={handleDetails}>
              {detailsTitle}
            </Button>
          )}
          {onReset && (
            <Button color="primary" onClick={onReset}>
              {resetTitle}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
