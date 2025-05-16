import React from "react";
import {
  useMediaQuery,
  Panel,
  useTheme,
  memoTheme,
  styled,
  type Theme,
} from "@funext/ui";
import LogoImage from "./LogoImage";

const PREFIX = "LoginLayout";

export const LoginLayoutClasses = {
  root: `${PREFIX}-root`,
  sidebar: `${PREFIX}-sidebar`,
  panel: `${PREFIX}-panel`,
  form: `${PREFIX}-form`,
};

const MainRoot = styled("main")(
  memoTheme<Theme>(({ theme }) => ({
    display: "flex",
    height: "100%",
    [`& .${LoginLayoutClasses.sidebar}`]: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: theme.palette.primary.main,
      paddingBottom: theme.spacing(5),
      width: 320,
      [theme.breakpoints.down("lg")]: {
        width: 280,
      },
      [theme.breakpoints.down("sm")]: {
        width: "0px",
      },
    },
    [`& .${LoginLayoutClasses.panel}`]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      boxShadow: "-2px 0px 16px rgba(0, 0, 0, 0.25)",
      [theme.breakpoints.up("lg")]: {
        padding: theme.spacing(0, 25, 0, 0),
      },
    },
    [`& .${LoginLayoutClasses.form}`]: {
      maxWidth: theme.spacing(52),
      padding: theme.spacing(5),
      width: "100%",
    },
  })),
);

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  return (
    <MainRoot className={LoginLayoutClasses.root}>
      <div className={LoginLayoutClasses.sidebar}>
        {!useMediaQuery(theme.breakpoints.down("lg")) && (
          <LogoImage color={theme.palette.secondary.contrastText} />
        )}
      </div>
      <Panel className={LoginLayoutClasses.panel}>
        <form className={LoginLayoutClasses.form}>{children}</form>
      </Panel>
    </MainRoot>
  );
};

export default LoginLayout;
