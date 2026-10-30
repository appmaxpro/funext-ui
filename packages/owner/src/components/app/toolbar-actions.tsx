'use client';
import * as React from 'react';
import {Flex} from '~/ui';
import { ThemeSwitcher } from './theme-switcher';

/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [ToolbarActions API](https://mui.com/toolpad/core/api/toolbar-actions)
 */
function ToolbarActions() {
  return (
    <Flex direction="row" items="center">
      <ThemeSwitcher />
    </Flex>
  );
}

export { ToolbarActions };