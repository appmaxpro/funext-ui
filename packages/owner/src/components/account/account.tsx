"use client";
import * as React from "react";
import { AccountPreview, type AccountPreviewProps } from "./account-preview";
import { SignOutButton, type SignOutButtonProps } from "./sign-out-button";
import { AccountPopupFooter } from "./account-popup-footer";
import { useSession } from "~/hooks/use-session";
import { Divider, Flex, Menu, type ButtonProps, type FlexProps, type MenuProps } from "~/ui";

interface AccountLocaleText {
  accountSignInLabel: string;
  accountSignOutLabel: string;

  accountPreviewIconButtonLabel: string;
  accountPreviewTitle: string;
}

export interface AccountSlots {
  /**
   * The component used for the account preview
   * @default AccountPreview
   */
  preview?: React.JSXElementConstructor<AccountPreviewProps>;
  /**
   * The component used for the account popover menu
   * @default Popover
   */
  menu?: React.JSXElementConstructor<Omit<MenuProps, "children">>;
  /**
   * The component used for the content of account popover
   * @default Stack
   */
  menuContent?: React.JSXElementConstructor<FlexProps>;
  /**
   * The component used for the sign in button.
   * @default Button
   */
  signInButton?: React.JSXElementConstructor<ButtonProps>;
  /**
   * The component used for the sign out button.
   * @default Button
   */
  signOutButton?: React.JSXElementConstructor<SignOutButtonProps>;
}

export interface AccountProps {
  /**
   * The components used for each slot inside.
   */
  slots?: AccountSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    preview?: AccountPreviewProps;
    menu?: Omit<React.ComponentProps<typeof Menu>, "open" | "children">;
    menuContent?: React.ComponentProps<typeof Flex>;
    signOutButton?: React.ComponentProps<typeof SignOutButton>;
  };
  /**
   * The labels for the account component.
   */
  localeText?: Partial<AccountLocaleText>;
}

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [Account API](https://mui.com/toolpad/core/api/account)
 */
function Account(props: AccountProps) {
  const { slots, slotProps } = props;
  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  let accountContent = null;
  const trigger = slots?.preview ? (
    <slots.preview />
  ) : (
    <AccountPreview variant="condensed" {...slotProps?.preview} />
  );
  accountContent = (
    <Menu
      trigger={<div className="relative">{trigger}</div>}
      strategy="fixed"
      id="account-menu"
      hoverProps={{ enabled: false }}
    >
      <Flex direction="column" {...slotProps?.menuContent}>
        <Flex direction={"column"}>
          <AccountPreview variant="expanded" />
        </Flex>
        <Divider />
        <AccountPopupFooter>
          <SignOutButton {...slotProps?.signOutButton} />
        </AccountPopupFooter>
      </Flex>
    </Menu>
  );
  return accountContent;
}

export { Account };
