'use client';
import * as React from 'react';
import type { CloseDialog, OpenDialog } from '~/hooks/use-dialogs';

/**
 * @ignore - internal component.
 */

export const DialogsContext = React.createContext<{
  open: OpenDialog;
  close: CloseDialog;
} | null>(null);