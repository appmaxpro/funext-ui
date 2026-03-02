import { useParams } from "react-router";
import { DataContext, useViewContext } from "~/context";
import { useAsync } from "~/hooks/use-async";
import React from "react";
import { Container } from "~/components/app/container";
import { Card, Flex, Radio, Switch } from "@funext/ui";
import { i18n } from "~/utils/i18n";
import { useLocalStorageState } from "~/hooks/use-local-storage-state";
import { APP_THEME_MODE } from "~/utils/constant";
import type { ThemeMode } from "~/utils/types";
import { languages } from "~/components/app/localization-provider";

import DarkModeIcon from "@funext/icons/DarkMode";
import LightModeIcon from "@funext/icons/LightMode";
import SettingsSystemDaydreamIcon from "@funext/icons/SettingsSystemDaydream";

export default function Settings({
  children,
  id,
  ...rest
}: { children: React.ReactNode; id: string } & Record<string, any>) {
  return (
    <Container {...rest}>
      <ThemeModeCard />
      <LanguageCard />
      <SettingsCard />
    </Container>
  );
}

function ThemeModeCard() {
  const [mode, setMode] = useLocalStorageState<ThemeMode>(
    APP_THEME_MODE,
    "system",
  );
  return (
    <Card>
      <Card.Header title={i18n.get("Appearance")} />
      <Card.Body className="flex flex-col gap-4">
        <Radio
          name="system"
          //className="flex grow"
          label={
            <>
              <span>{i18n.get("System")}</span>
              <SettingsSystemDaydreamIcon />
            </>
          }
          checked={mode === "system"}
          onChange={(e, checked) => setMode("system")}
          labelProps={{ className: "flex grow justify-between" }}
        />
        <Radio
          name="light"
          label={
            <>
              <span>{i18n.get("Light")}</span>
              <LightModeIcon />
            </>
          }
          checked={mode === "light"}
          onChange={(e, checked) => setMode("light")}
          boxProps={{ className: "flex grow" }}
          labelProps={{ className: "flex grow justify-between" }}
        />
        <Radio
          name="dark"
          label={
            <>
              <span>{i18n.get("Dark")}</span>
              <DarkModeIcon />
            </>
          }
          checked={mode === "dark"}
          onChange={(e, checked) => setMode("dark")}
          labelProps={{ className: "flex grow justify-between" }}
        />
      </Card.Body>
    </Card>
  );
}

function LanguageCard() {
  const [lang, setLanguage] = useLocalStorageState("language");
  return (
    <Card>
      <Card.Header title={i18n.get("Language")} />
      <Card.Body className="flex flex-col gap-4">
        {Object.keys(languages).map((langKey) => (
          <Radio
            name="system"
            label={languages[langKey as keyof typeof languages].name}
            checked={lang === langKey}
            onChange={(e, checked) => setLanguage(langKey)}
            key={langKey}
          />
        ))}
      </Card.Body>
    </Card>
  );
}

function SettingsCard() {
  const [notifications, setNotifications] =
    useLocalStorageState("notifications");
  const [hideAppOnScroll, setHideAppOnScroll] = useLocalStorageState(
    "hideAppOnScroll",
    "1",
  );
  return (
    <Card>
      <Card.Header title={i18n.get("Settings")} />
      <Card.Body className="flex flex-col gap-4">
        <Switch
          name="notifications"
          label={i18n.get("Notifications")}
          checked={notifications === "1"}
          onChange={(e, checked) => setNotifications(checked ? "1" : null)}
          labelPosition="before"
          boxProps={{ className: "flex grow justify-between" }}
        />
        <Switch
          name="hideAppOnScroll"
          label={i18n.get("Hide AppBar On Scroll")}
          checked={hideAppOnScroll === "1"}
          onChange={(e, checked) => setHideAppOnScroll(checked ? "1" : "0")}
          labelPosition="before"
          boxProps={{ className: "flex grow justify-between" }}
        />
      </Card.Body>
    </Card>
  );
}
