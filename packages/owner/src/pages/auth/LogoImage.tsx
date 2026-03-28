import React from "react";
import { useTheme, useMediaQuery, styled, SvgIcon } from "@funext/ui";

import { useTrackerSession } from "~/tracker/store/session";
import { AppLogo } from "~/components/app/app-logo";

const imgSx = {
  alignSelf: "center",
  maxWidth: "240px",
  maxHeight: "120px",
  width: "auto",
  height: "auto",
  margin: 4,
};

const ImgRoot = styled("img")(imgSx);
const SvgRoot = styled("div")({
  display: "contents",
  ["&>svg"]: imgSx,
});

const LogoImage = ({ color, expanded }: { color?: string, expanded?: boolean }) => {
  const theme = useTheme();

  //const expanded = !useMediaQuery(theme.breakpoints.down("lg"));
  /*
  const logo = useTrackerSession((state) => state.server.attributes?.logo);
  const logoInverted = useTrackerSession(
    (state) => state.server.attributes?.logoInverted,
  );

  if (logo) {
    if (expanded && logoInverted) {
      return <ImgRoot src={logoInverted} alt="" />;
    }
    return <ImgRoot src={logo} alt="" />;
  }*/
  return (
    <SvgRoot style={{color}}>
      <AppLogo/>
    </SvgRoot>
  );
};

export default LogoImage;
