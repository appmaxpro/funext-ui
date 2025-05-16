import * as React from 'react';
import Box, { type BoxProps } from '@funext/ui/Box';

export interface AccountPopupFooterProps extends BoxProps {
  children?: React.ReactNode;
}

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountPopupFooter API](https://mui.com/toolpad/core/api/account-popover-footer)
 */
function AccountPopupFooter(props: AccountPopupFooterProps) {
  const { children, ...rest } = props;
  return (
    <Box
      {...rest}
      sx={{ display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-end', ...rest.sx }}
    >
      {children}
    </Box>
  );
}

export { AccountPopupFooter };