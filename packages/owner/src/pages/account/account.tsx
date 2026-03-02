import { useParams } from "react-router";
import { DataContext, useViewContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import React from "react";
import { Container } from "~/components/app/container";
import {
  Alert,
  Avatar,
  Box,
  Card,
  IconButton,
  ListItemButton,
  Radio,
  Switch,
  useRtl,
} from "@funext/ui";
import { i18n } from "~/utils/i18n";
import { useLocalStorageState } from "~/hooks/use-local-storage-state";
import { APP_THEME_MODE } from "~/utils/constant";
import type { ThemeMode } from "~/utils/types";
import { languages } from "~/components/app/localization-provider";
import { session } from "~/utils/session";
import { makeURL } from "~/utils/client";
import SettingsIcon from "@funext/icons/Settings";
import PersonIcon from "@funext/icons/Person";
import LogoutIcon from "@funext/icons/Logout";
import LoginIcon from "@funext/icons/Login";
import SecurityIcon from "@funext/icons/Security";
import MoreVertIcon from "@funext/icons/MoreVert";
import { TitleItem } from "~/components/other/title-item";

export default function Settings({
  children,
  id,
  ...rest
}: { children: React.ReactNode; id: string } & Record<string, any>) {
  return (
    <Container {...rest}>
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
            <MoreVertIcon />
          </IconButton>
        }
      />

      <Alert color="red" variant="ghost" sx={{height: 194}}/>

      <Card.Body className="flex flex-col gap-4">
        <TitleItem justify="start" gap={2} title={i18n.get("Name")}>
          {user?.name}
        </TitleItem>
        <TitleItem justify="start" gap={2} title={i18n.get("Email")}>
          {user?.login}
        </TitleItem>
        <TitleItem justify="start" gap={2} title={i18n.get("Phone")}>
          
        </TitleItem>
      </Card.Body>
    </Card>
  );
}

function OtherCard() {
  const ExitIcon = useRtl() ? LoginIcon : LogoutIcon;
  return (
    <Card>
      <Card.Header title={i18n.get("Others")} />
      <Box display="flex" flexDirection="column">
        <ListItemButton
          href="settings"
          className="b-4"
          startIcon={<SettingsIcon />}
        >
          {i18n.get("Settings")}
        </ListItemButton>
        <ListItemButton
          href="account/security"
          divider
          className="b-4"
          startIcon={<SecurityIcon />}
        >
          {i18n.get("Change Password")}
        </ListItemButton>
        <ListItemButton
          href="logout"
          className="b-4 text-red-500"
          startIcon={<ExitIcon />}
        >
          {i18n.get("Logout")}
        </ListItemButton>
      </Box>
    </Card>
  );
}
