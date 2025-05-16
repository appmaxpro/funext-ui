import * as React from 'react';
import Text from '@funext/ui/Text';
import Link from '@funext/ui/Link';
import {Flex} from '@funext/ui/Box';
import { styled, useTheme } from '@funext/ui/styles';
import { AppLogo } from './app-logo';

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  display: 'flex',
  alignItems: 'center',
  '& img': {
    maxHeight: 40,
  },
});

export interface AppTitleProps {
  title?: string;
  logo?: React.ReactNode;
  homeUrl?: string;
}

/**
 * @ignore - internal component.
 */
export function AppTitle(props: AppTitleProps) {
  const theme = useTheme();
  //const defaultTitle = useApplicationTitle();
  const title = props?.title ;
  return (
    <Link href={props?.homeUrl ?? '/'} style={{ textDecoration: 'none' }}>
      <Flex direction="row" alignItems="center">
        <LogoContainer>{props?.logo ?? <AppLogo size={40} />}</LogoContainer>
        <Text
          variant="h6"
          sx={{
            color: (theme.vars ?? theme).palette.primary.main,
            fontWeight: '700',
            ml: 1,
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {title}
        </Text>
      </Flex>
    </Link>
  );
}