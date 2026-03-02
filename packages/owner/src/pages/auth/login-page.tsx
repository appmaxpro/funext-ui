import React, { useEffect, useState } from "react";
import {
  useMediaQuery,
  MenuItem,
  Menu,
  Button,
  Input,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  Box,
  Spinner,
  memoTheme
} from "@funext/ui";
// ReactCountryFlag from "react-country-flag";
import CloseIcon from "@funext/icons/Close";
import { useTheme } from "@funext/ui/styles";
import { useNavigate } from "react-router";

import AuthLayout from "./auth-layout";
import {
  generateLoginToken,
  handleLoginTokenListeners,
  nativePostMessage,
} from "../../tracker/utils/native-interface";
import LogoImage from "./LogoImage";
import { i18n } from "~/utils/i18n";
import { useTrackerSession } from "~/tracker/store/session";
import { Icons } from "@funext/ui/components";
import { useCatch } from "~/hooks/use-catch";
import { useLocalization } from "~/context";
import { useLocalStorageState } from "~/hooks/use-local-storage-state";
import { readCookie, fetch } from "~/utils/client";
import { itemStyle } from "@funext/ui/components/List/styles.js";

const optionSx = {
  position: "fixed",
  top: 4,
  right: 'calc(4 * var(--spacing))',
  display: "flex",
  flexDirection: "row",
  gap: 'calc(2 * var(--spacing))', //
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

  const [email = "", setEmail] = useLocalStorageState("loginEmail");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const registrationEnabled = false;
  
  const languageEnabled = useTrackerSession(
    (state) => !state.server.attributes["ui.disableLoginLanguage"],
  );
  const changeEnabled = useTrackerSession(
    (state) => !state.server.attributes.disableChange,
  );
  const emailEnabled = useTrackerSession(
    (state) => state.server.emailEnabled,
  );
  const openIdEnabled = useTrackerSession(
    (state) => state.server.openIdEnabled,
  );
  const openIdForced = useTrackerSession(
    (state) =>
      state.server.openIdEnabled && state.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useTrackerSession(
    (state) => state.server.announcement,
  );

  const trackerSession = useTrackerSession()

  const handlePasswordLogin = async (event:any) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email!)}&password=${encodeURIComponent(password)}`;
      const response = await fetch("/auth/session", {
        method: "POST",
        body: new URLSearchParams(
          code.length ? `${query}&code=${code}` : query,
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        trackerSession.updateUser(user);
        navigate("/");
      } else if (
        response.status === 401 &&
        response.headers.get("WWW-Authenticate") === "TOTP"
      ) {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token:string) => {
    const response = await fetch(
      `/auth/session?token=${encodeURIComponent(token)}`,
    );
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
    const listener = (token:string) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => {handleLoginTokenListeners.delete(listener);}
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <Spinner />;
  }

  return (
    <AuthLayout>
      <Box sx={optionSx}>
        
      </Box>
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
          onChange={(e:any) => setEmail(e.target.value)}
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
          onChange={(e:any) => setPassword(e.target.value)}
        />
        {codeEnabled && (
          <Input
            required
            error={failed}
            label={t("loginTotpCode")}
            name="code"
            value={code}
            type="number"
            onChange={(e:any) => setCode(e.target.value)}
          />
        )}
        {languageEnabled && (
            <Menu
              menuProps={{
                panelProps: {
                  style: {
                  width: 'var(--popper-reference-width)'
                }
                },
                listProps: {
                  itemStyle: {
                    className : 'py-2 px-3'
                  },
                  hover: true
                }
              }}
              
            >
              <Menu.Trigger>
                <Button ripple={false} variant="outlined" fullWidth color="inherit" className="flex justify-between">
                  <span>{languageList.find(a => a.code === language)?.name }</span>
                  <Icons.ChevronDown size='sm'/>
                </Button>
              </Menu.Trigger>
              {languageList.map((it) => (
                <MenuItem className="py-2 px-3" key={it.code} title={it.name} onClick={()=> setLanguage(it.code)}>
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
        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="filled"
            color="primary"
          >
            {t("loginOpenId")}
          </Button>
        )}
        <div className="flex justify-center gap-4 mt-4">
          {emailEnabled && (
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
            <CloseIcon size="sm" />
          </IconButton>
        }
      />
    </AuthLayout>
  );
};

export default LoginPage;
