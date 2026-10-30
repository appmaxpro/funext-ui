import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Input,
  Link,
  Menu,
  Snackbar,
  Spinner,
  SvgIcons,
  useMediaQuery,
  useTheme,
} from "~/ui";
// ReactCountryFlag from "react-country-flag";
import { useNavigate } from "react-router";

import { Icons } from "~/components";
import { useLocalization } from "~/context";
import { useCatch } from "~/hooks/use-catch";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { useErrorStore } from "~/store/errors";
import { useTrackerSession } from "~/tracker/store/session";
import { fetch } from "~/utils/client";
import { i18n } from "~/utils/i18n";
import { session } from "~/utils/session";
import {
  handleLoginTokenListeners,
  nativePostMessage,
} from "../../tracker/utils/native-interface";
import LogoImage from "./LogoImage";

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
  const errorPush = useErrorStore((state) => state.push);
  const theme = useTheme();
  const t = i18n.get;

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState<string | null>(null);

  const [email = "", setEmail] = useLocalStorage("loginEmail");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

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
    setFailed(null);
    try {
      const query = `email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password)}`;
      const response = await session
        .login({
          username: email!,
          password: password!,
          code,
        })
        .catch(async (response: Response) => {
          
         
          if (
            response.status === 401 &&
            response.headers.get("WWW-Authenticate") === "TOTP"
          ) {
            setCodeEnabled(true);
          } else {
            let message = '';
            try{
              const result = await response.json() as any;
              if(result && result.error) {
                message = result.error.message ?? String(result.error);
              } 
            } catch(e) {
              message = await response.text() as any;
            }

            setFailed(message);
            errorPush(message);
            throw Error(message);
          }
        });

      if (response?.user) {
        //navigate("/");
      }

      console.log("Response:", response)

    } catch (error) {
      console.error("Error:", error)
      setFailed(String(error));
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
    <>
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
              <Menu.Item
                className="py-2 px-3"
                key={it.code}
                title={it.name}
                onClick={() => setLanguage(it.code)}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  {/*<ReactCountryFlag countryCode={it.country} svg />*/}
                </Box>
                {it.name}
              </Menu.Item>
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
        {application?.openIdForce && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="filled"
            color="primary"
          >
            {t("loginOpenId")}
          </Button>
        )}
        <div className="flex justify-center gap-4 mt-4">
          {application?.resetPasswordEnabled && (
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
        {failed && (
          <Alert color="error" variant="ghost">
            {failed}
          </Alert>
        )}
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
    </>
  );
};

export default LoginPage;
