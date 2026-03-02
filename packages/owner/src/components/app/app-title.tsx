import * as React from "react";
import Text from "@funext/ui/Text";
import Link from "@funext/ui/Link";
import { Flex } from "@funext/ui/Box";
import { styled, useTheme } from "@funext/ui/styles";
import { AppLogo } from "./app-logo";
import { useScreenSize, type SizeContextValue } from "@funext/ui";
import { useActivePage } from "~/hooks/use-active-page";

const LogoContainer = styled("div")({
  position: "relative",
  height: 40,
  display: "flex",
  alignItems: "center",
  "& img": {
    maxHeight: 40,
  },
});

export interface AppTitleProps {
  title?: string;
  logo?: React.ReactNode;
  homeUrl?: string;
  showLogo?: "root" | "always";
  logSs?: keyof Omit<
    SizeContextValue,
    "up" | "down" | "current" | "target" | "width" | "height" | "valid"
  >;
}

/**
 * @ignore - internal component.
 */
export function AppTitle(props: AppTitleProps) {
  const theme = useTheme();
  //const defaultTitle = useApplicationTitle();
  const title = props?.title;
  const logSs = props?.logSs;
  const showLogoAt = props.showLogo ?? "root";
  const showLogoSs = logSs ? useScreenSize()[logSs] : true;
  const { navItem, root } = useActivePage()!;
  const showLogo =
    showLogoSs && (showLogoAt === "root" ? root === navItem : true);

  return (
    
    <Link
      href={props?.homeUrl ?? "/"}
      style={{ textDecoration: "none" }}
      //@ts-ignore
      replace
    >
      <Flex direction="row" alignItems="center">
        {showLogo && (
          <LogoContainer>{props?.logo ?? <AppLogo size={40} />}</LogoContainer>
        )}
        <Text
          variant="h6"
          sx={{
            color: (theme.vars ?? theme).palette.primary.main,
            fontWeight: "700",
            ml: 1,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {title}
        </Text>
      </Flex>
    </Link>
  );
}
