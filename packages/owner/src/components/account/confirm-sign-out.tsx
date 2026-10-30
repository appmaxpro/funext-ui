
import { i18n } from "~/utils/i18n";
import { useSession } from "~/hooks/use-session";
import { Button, Dialog } from "~/ui";

export type ConfirmSignOutProps = {
  message?: React.ReactNode;
  onLogout?: () => void;
  onCancel: () => void;
  open: boolean;
};

export function ConfirmSignOut({open, onLogout, onCancel, message}: ConfirmSignOutProps) {
    const { logout } = useSession();
    return <Dialog open={open}>
      <Dialog.Body>
        {message ?? i18n.get('confirmSignOutMessage')}
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onCancel}>
          {i18n.get('cancelLabel')}
        </Button>
        <Button onClick={onLogout ?? logout} color="error">
          {i18n.get('signOutLabel')}
        </Button>
      </Dialog.Footer>
    </Dialog>
}