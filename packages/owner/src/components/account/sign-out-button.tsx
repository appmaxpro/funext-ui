import * as React from "react";
import Button, { type ButtonProps } from "@funext/ui/Button";
import LogoutIcon from "@funext/icons/Logout";
import { i18n } from "~/utils/i18n";
import { ConfirmSignOut } from "./confirm-sign-out";
import { session } from "~/utils/session";

export type SignOutButtonProps = ButtonProps & {
  text?: React.ReactNode;
  confirm?: React.ReactNode;
  onLogout?: () => void;
};

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [SignOutButton API](https://mui.com/toolpad/core/api/sign-out-button)
 */
function SignOutButton({ confirm, onLogout, ...props }: SignOutButtonProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  return (
    <Button
      variant="outlined"
      size="sm"
      disableElevation
      onClick={() => {
        if (confirm) {
          setConfirmOpen(true)
        } else if(onLogout){
            onLogout() 
        } else {
          session.logout()
        }
      }}
      sx={{
        textTransform: "capitalize",
        fontWeight: "normal",
        filter: "opacity(0.9)",
        transition: "filter 0.2s ease-in",
        "&:hover": {
          filter: "opacity(1)",
        },
      }}
      startIcon={<LogoutIcon />}
      {...props}
    >
      {props.text ?? i18n.get("signOutLabel")}
      {confirm && (
        <ConfirmSignOut
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onLogout={onLogout}
          message={typeof confirm !== "boolean" ? confirm : undefined}
        />
      )}
    </Button>
  );
}

export { SignOutButton };
