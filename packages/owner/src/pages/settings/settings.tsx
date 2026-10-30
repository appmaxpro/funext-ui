import { languages } from "~/components/app/localization-provider";
import { Container } from "~/components/shared/container";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { Card, Radio, Switch } from "~/ui";
import { APP_THEME_MODE } from "~/utils/constant";
import { i18n } from "~/utils/i18n";
import type { ThemeMode } from "~/utils/types";

import DarkModeIcon from "@funext/icons/DarkMode";
import LightModeIcon from "@funext/icons/LightMode";
import SettingsSystemDaydreamIcon from "@funext/icons/SettingsSystemDaydream";

export default function Settings(props?: Record<string, any>) {
  return (
    <Container {...props}>
      <ThemeModeCard />
      <LanguageCard />
      <SettingsCard />
    </Container>
  );
}

function ThemeModeCard() {
  const [mode, setMode] = useLocalStorage<ThemeMode>(APP_THEME_MODE, "system");
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
  const [lang, setLanguage] = useLocalStorage("language");
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
  const [notifications, setNotifications] = useLocalStorage("notifications");
  const [hideAppOnScroll, setHideAppOnScroll] = useLocalStorage(
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
