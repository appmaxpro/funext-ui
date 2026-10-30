import React from "react";
import { Container } from "~/components/shared/container";
import {
  Avatar,
  Box,
  Card,
  IconButton,
  List,
  Text
} from "~/ui";
import { i18n } from "~/utils/i18n";
import { session } from "~/utils/session";
import { makeURL } from "~/utils/client";
import { Icons, Items } from "~/components";
import { useDialogs } from "~/hooks/use-dialogs";

export default function Settings(props?: Record<string, any>) {
  return (
    <Container {...props}>
      <ProfileCard />
      <OtherCard />
    </Container>
  );
}

function ProfileCard() {
  const user = session.info?.user;

  const src = user?.image ? makeURL(user?.image) : undefined;
  return (
    <Card>
      <Card.Header
        title={user?.name}
        subheader={user?.login}
        avatar={
          <Avatar
            color="red"
            aria-label="nn"
            src={src}
            alt={user?.name}
          > 
              {user?.name ?? 'NA'} 
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <Icons.MoreVert />
          </IconButton>
        }
      />

      <Card.Body className="flex flex-col gap-4">
        <Items.Item justify="start" gap={2} title={i18n.get("Name")}>
          {user?.name}
        </Items.Item>
        <Items.Item justify="start" gap={2} title={i18n.get("Email")}>
          {user?.login}
        </Items.Item>
        <Items.Item justify="start" gap={2} title={i18n.get("Phone")}>
          
        </Items.Item>
      </Card.Body>
    </Card>
  );
}

function OtherCard() {
  //const ExitIcon = useRtl() ? Icons.S : Icons.Logout;
  const dialogs = useDialogs();
  const onLogout= React.useCallback(async ()=> {
     const ok = await dialogs.confirm(i18n.get('confirmSignOutMessage'), {
      okText: <Text color="red">{i18n.get('signOutLabel')}</Text>,
      dialogProps: {
        animate: true,
        animation: 'fadeScale'
      }
     })
     if(ok) {
      await session.logout()
     }
  },[dialogs])
  /*
  <Dialog open={open}>
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
    </Dialog>*/
  return (
    <Card>
      <Card.Header title={i18n.get("Others")} />
      <Box display="flex" flexDirection="column">
        <List.ItemButton
          href="settings"
          className="b-4"
        >
          <List.Prefix>
            <Icons.Settings/>
          </List.Prefix>
          <List.Text primary={i18n.get("Settings")}/>
        </List.ItemButton>
        <List.ItemButton
          href="account/security"
          divider
          className="b-4"
        >
          <List.Prefix>
            <Icons.Security/>
          </List.Prefix>
          <List.Text primary={i18n.get("Change Password")}/>
        </List.ItemButton>
        <List.ItemButton
          className="b-4 text-red-500"
          onClick={onLogout}
        >
          <List.Prefix>
            <Icons.Logout/>
          </List.Prefix>
          <List.Text primary={i18n.get("Logout")}/>
        </List.ItemButton>
      </Box>
    </Card>
  );
}
