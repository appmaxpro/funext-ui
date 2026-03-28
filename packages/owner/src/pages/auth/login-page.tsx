import { useEffect, useState } from "react";
import {
  useMediaQuery,
  MenuItem,
  Menu,
  Button,
  Input,
  Link,
  Snackbar,
  IconButton, Box,
  Spinner
} from "@funext/ui";
// ReactCountryFlag from "react-country-flag";
import { useTheme } from "@funext/ui/styles";
import { useNavigate } from "react-router";

import AuthLayout from "./auth-layout";
import {
  handleLoginTokenListeners,
  nativePostMessage
} from "../../tracker/utils/native-interface";
import LogoImage from "./LogoImage";
import { i18n } from "~/utils/i18n";
import { useTrackerSession } from "~/tracker/store/session";
import { SvgIcons } from "@funext/ui/components";
import { useCatch } from "~/hooks/use-catch";
import { useLocalization } from "~/context";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { fetch } from "~/utils/client";
import { session } from "~/utils/session";
import { Icons } from "~/components";

const optionSx = {
  position: "fixed",
  top: 4,
  right: "calc(4 * var(--spacing))",
  display: "flex",
  flexDirection: "row",
  gap: "calc(2 * var(--spacing))", //
};

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const t = i18n.get;

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email = "", setEmail] = useLocalStorage("loginEmail");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const registrationEnabled = false;
  const application = session.info?.application;
  const languageEnabled = application?.disableLoginLanguage !== true;

  const emailEnabled = application?.emailEnabled !== false;

  const openIdForced = application?.openIdForce === true;

  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useTrackerSession((state) => state.server.announcement);

  const trackerSession = useTrackerSession();

  const handlePasswordLogin = async (event: any) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password)}`;
      const response = await session
        .login({
          username: email!,
          password: password!,
          code,
        })
        .catch(async (response:Response) => {
          if (
            response.status === 401 &&
            response.headers.get("WWW-Authenticate") === "TOTP"
          ) {
            setCodeEnabled(true);
          } else {
            throw Error(await response.text());
          }
        });

      if (response?.user) {
        navigate("/");
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token: string) => {
    const response = await fetch({
      url: `/auth/session?token=${encodeURIComponent(token)}`,
    });
    if (response.ok) {
      const user = await response.json();
      trackerSession.updateUser(user);
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleOpenIdLogin = () => {
    document.location = "/auth/session/openid/auth";
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    const listener = (token: string) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => {
      handleLoginTokenListeners.delete(listener);
    };
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <Spinner />;
  }

  return (
    <AuthLayout>
      <Box sx={optionSx}></Box>
      <div className="flex flex-col gap-4">
        {useMediaQuery(theme.breakpoints.down("lg")) && (
          <LogoImage color={theme.palette.primary.main} />
        )}
        <Input
          required
          error={failed}
          label={t("userEmail")}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus={!email}
          onChange={(e: any) => setEmail(e.target.value)}
          helperText={failed && t("Invalid username or email")}
        />
        <Input
          required
          error={failed}
          label={t("userPassword")}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          autoFocus={!!email}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        {codeEnabled && (
          <Input
            required
            error={failed}
            label={t("loginTotpCode")}
            name="code"
            value={code}
            type="number"
            onChange={(e: any) => setCode(e.target.value)}
          />
        )}
        {languageEnabled && (
          <Menu matchReferenceWidth>
            <Menu.Trigger>
              <Button
                ripple={false}
                variant="outlined"
                fullWidth
                color="inherit"
                className="flex justify-between"
              >
                <span>
                  {languageList.find((a) => a.code === language)?.name}
                </span>
                <SvgIcons.ChevronDown size="sm" />
              </Button>
            </Menu.Trigger>
            {languageList.map((it) => (
              <MenuItem
                className="py-2 px-3"
                key={it.code}
                title={it.name}
                onClick={() => setLanguage(it.code)}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  {/*<ReactCountryFlag countryCode={it.country} svg />*/}
                </Box>
                {it.name}
              </MenuItem>
            ))}
          </Menu>
        )}
        <Button
          onClick={handlePasswordLogin}
          type="submit"
          variant="filled"
          color="primary"
          disabled={!email || !password || (codeEnabled && !code)}
        >
          {t("loginLogin")}
        </Button>
        {(application?.openIdForce) && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="filled"
            color="primary"
          >
            {t("loginOpenId")}
          </Button>
        )}
        <div className="flex justify-center gap-4 mt-4">
          {(application?.resetPasswordEnabled) && (
            <Link
              //onClick={() => navigate("/auth/reset-password")}
              //className={classes.link}
              href="/auth/reset-password"
              underline="none"
              variant="caption"
            >
              {t("loginReset")}
            </Link>
          )}
        </div>
      </div>
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton
            size="sm"
            color="inherit"
            onClick={() => setAnnouncementShown(true)}
          >
            <Icons.Close size="sm" />
          </IconButton>
        }
      />
    </AuthLayout>
  );
};

export default LoginPage;
