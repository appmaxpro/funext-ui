
import { Box } from "~/ui";
import { i18n } from "./i18n";
import { session } from "./session";
import type { ErrorReport } from "./data-types";
import app from "./app";



export type RejectType = number | string | ErrorReport | null;

export function reject(data: RejectType) {
  return handleReject(data);
}

export function rejectAsAlert(data: RejectType) {
  return handleReject(data, showAlert);
}

function handleReject(data: RejectType, showError = showDialog) {
  if (typeof data === "number" || data == null) {
    return Promise.reject(data);
  }

  const report = typeof data === "string" ? { message: data } : data;

  const title = report.title || i18n.get("Internal Server Error");
  const message = (report.message ?? report.causeMessage)?.replace(
    "\n",
    "<br>",
  );
  const stacktrace =
    report.causeStack ??
    (typeof data === "string" ? data.replace(/.*<body>|<\/body>.*/g, "") : "");

  const canShowStack = !!session.info?.user?.technical;

  showError({
    title,
    message,
    stacktrace: canShowStack ? stacktrace : undefined,
  });

  return Promise.reject(500);
}

const showDialog = ({
  title,
  message,
  stacktrace,
}: {
  title: string;
  message?: string;
  stacktrace?: string;
}) => {
  app.dialogs.confirm(message, {
    title,
    onClose: async (result) => {
      if (result) {
        await app.dialogs.confirm(
          <Box as="pre" p={2} m={0}>
            {stacktrace}
          </Box>,
          {
            title,
            severity: "error",
          },
        );
      }
      return Promise.resolve();
    },
  });
};

const showAlert = ({ title, message }: { title: string; message?: string }) => {
  app.dialogs.alert(message, { title });
};
