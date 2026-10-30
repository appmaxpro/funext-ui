import {
  memoTheme,
  Panel,
  styled,
  type Theme,
  useScreenSize,
  useTheme,
} from "~/ui";
import ActiveRoute from "~/routes/active-route";
import LogoImage from "./LogoImage";
import { useSession } from "~/hooks/use-session";
import { useEffect } from "react";
import { Loader } from "~/components";

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
      [theme.breakpoints.down("sm")]: {
        boxShadow: "none",
      },
    },
    [`& .${LoginLayoutClasses.form}`]: {
      maxWidth: theme.spacing(80),
      padding: theme.spacing(5),
      width: "100%",
    },
  })),
);

const AuthLayout = () => {
  const theme = useTheme();
  const { lgUp } = useScreenSize();
  const { state, data } = useSession();

  useEffect(() => {
    if (data?.user) {
      location.href = "/";
      console.error("Redirect to root...")
    }
  }, [state, data]);

  return (
    <MainRoot className={LoginLayoutClasses.root}>
      <div className={LoginLayoutClasses.sidebar}>
        {lgUp && <LogoImage color={theme.palette.secondary.contrastText} />}
      </div>
      <Panel className={LoginLayoutClasses.panel}>
        <form className={LoginLayoutClasses.form}>
          {state === "loading" ? <Loader /> : <ActiveRoute />}
        </form>
      </Panel>
    </MainRoot>
  );
};

export default AuthLayout;
