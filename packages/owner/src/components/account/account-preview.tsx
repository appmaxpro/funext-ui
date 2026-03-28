import * as React from 'react';
import Avatar, { type AvatarProps } from '@funext/ui/Avatar';
import { type SxProps } from '@funext/ui/styles';
import Text from '@funext/ui/Text';
import Tooltip from '@funext/ui/Tooltip';
import {Flex} from '@funext/ui/Box';
import IconButton, { type IconButtonProps } from '@funext/ui/IconButton';
import { useSession } from '~/hooks/use-session';
import { Icons } from '../shared';

export type AccountPreviewVariant = 'condensed' | 'expanded';

export interface AccountPreviewSlots {
  /**
   * The component used for the Avatar
   * @default Avatar
   */
  avatar?: React.ElementType;
  /**
   * The component used for the overflow icon button in the expanded variant
   * @default IconButton
   */
  moreIconButton?: React.ElementType;
  /**
   * The component used for the avatar icon button in the condensed variant
   * @default IconButton
   */
  avatarIconButton?: React.ElementType;
}

export interface AccountPreviewProps {
  /**
   * The components used for each slot inside.
   */
  slots?: AccountPreviewSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    avatar?: AvatarProps;
    moreIconButton?: IconButtonProps;
    avatarIconButton?: IconButtonProps;
  };
  /**
   * The type of account details to display.
   * @property {'condensed'} condensed - Shows only the user's avatar.
   * @property {'expanded'} expanded - Displays the user's avatar, name, and email if available.
   * @default 'condensed'
   */
  variant?: AccountPreviewVariant;
  /**
   * The handler used when the preview is expanded
   */
  handleClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * The state of the Account popover
   * @default false
   */
  open?: boolean;
  /**
   * The prop used to customize the styling of the preview
   */
  sx?: SxProps;
}

/**
 * The AccountPreview component displays user account information.
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountPreview API](https://mui.com/toolpad/core/api/account-preview)
 */
function AccountPreview(props: AccountPreviewProps) {
  const { slots, variant = 'condensed', slotProps, open, handleClick, sx } = props;
  const {data} = useSession()
  if (!data?.user) {
    return null;
  }

  const user = data.user;

  const avatarContent = slots?.avatar ? (
    <slots.avatar />
  ) : (
    <Avatar
      src={user.image || ''}
      alt={user.name || user.login || ''}
      sx={{ height: variant === 'expanded' ? 48 : 32, width: variant === 'expanded' ? 48 : 32 }}
      {...slotProps?.avatar}
    />
  );

  if (variant === 'expanded') {
    return (
      <Flex direction="row" justifyContent="space-between" sx={{ py: 1, px: 2, gap: 2, ...sx }}>
        <Flex direction="row" justifyContent="flex-start" spacing={2} overflow="hidden">
          {avatarContent}
          <Flex direction="column" justifyContent="space-evenly" overflow="hidden">
            <Text variant="body2" fontWeight="bolder" noWrap>
              {user.name}
            </Text>
            <Text variant="caption" noWrap>
              {user.login}
            </Text>
          </Flex>
        </Flex>
        {handleClick &&
          (slots?.moreIconButton ? (
            <slots.moreIconButton />
          ) : (
            <IconButton
              size="sm"
              onClick={handleClick}
              {...slotProps?.moreIconButton}
              sx={{ alignSelf: 'center', ...slotProps?.moreIconButton?.sx }}
            >
              <Icons.MoreVert size="sm" />
            </IconButton>
          ))}
      </Flex>
    );
  }

  return (
    <Tooltip content={user.name}>
      {slots?.avatarIconButton ? (
        <slots.avatarIconButton {...slotProps?.avatarIconButton} />
      ) : (
        <Flex sx={{ py: 0.5, ...sx }}>
          <IconButton
            onClick={handleClick}
            //aria-label={localeText?.accountPreviewIconButtonLabel}
            size="sm"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            {...slotProps?.avatarIconButton}
            sx={{ width: 'fit-content', margin: '0 auto', ...slotProps?.avatarIconButton?.sx }}
          >
            {avatarContent}
          </IconButton>
        </Flex>
      )}
    </Tooltip>
  );
}


export { AccountPreview };