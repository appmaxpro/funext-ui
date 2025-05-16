import Dialog  from "@funext/ui/Dialog";
import Button  from "@funext/ui/Button";
import { session } from "~/utils/session";
import { i18n } from "~/utils/i18n";

export type ConfirmSignOutProps = {
  message?: React.ReactNode;
  onLogout?: () => void;
  onCancel: () => void;
  open: boolean;
};

export function ConfirmSignOut({open, onLogout=session.logout, onCancel, message}: ConfirmSignOutProps) {
    return <Dialog open={open}>
      <Dialog.Body>
        {message ?? i18n.get('confirmSignOutMessage')}
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onCancel}>
          {i18n.get('cancelLabel')}
        </Button>
        <Button onClick={onLogout} color="error">
          {i18n.get('signOutLabel')}
        </Button>
      </Dialog.Footer>
    </Dialog>
}