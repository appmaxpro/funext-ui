import BiArchive from "bootstrap-icons/icons/archive.svg?react";
import BiBank from "bootstrap-icons/icons/bank.svg?react";
import BiCardImage from "bootstrap-icons/icons/card-image.svg?react";
import BiChevronDown from "bootstrap-icons/icons/chevron-down.svg?react";
import BiChevronUp from "bootstrap-icons/icons/chevron-up.svg?react";
import BiInboxFill from "bootstrap-icons/icons/inbox-fill.svg?react";
import BiMailBox from "bootstrap-icons/icons/mailbox.svg?react";
import BiSendCheckFill from "bootstrap-icons/icons/send-check-fill.svg?react";
import BiSendFill from "bootstrap-icons/icons/send-fill.svg?react";
import React, { forwardRef, ReactElement, useState } from "react";

import { Box } from "../box";
import { Collapse } from "../Collapse";
import { Icon } from "../icon";
import { IconProps } from "../icon/icon";
import { List, ListItem, ListItemAvatar, ListProps } from ".";

import {
  List as MuiList,
  ListItem as MuiListItem,
  ListItemButton,
  ListItemSuffix,
  ListItemPrefix,
  ListItemText,
  ListItemIcon as MuxListItemIcon,
  Chip as MuiChip,
  Card as MuiCard,
  styled,
  Divider,
  Panel,
  Text,
  Avatar,
  Stack
} from "../..";

import { MaterialIcon } from "../../../icons/material-icon";

const config = {
  component: List,
  title: "Components/List",
};

export const Active = () => {
  return (
    <List>
      <ListItem active>An item</ListItem>
      <ListItem>A second item</ListItem>
      <ListItem>A third item</ListItem>
      <ListItem>A fourth item</ListItem>
      <ListItem>And a fifth one</ListItem>
    </List>
  );
};

export const Basic = () => {
  return (
    <List>
      <ListItem>An item</ListItem>
      <ListItem>A second item</ListItem>
      <ListItem>A third item</ListItem>
      <ListItem>A fourth item</ListItem>
      <ListItem>And a fifth one</ListItem>
    </List>
  );
};

const content = (
  <>
    <Box d="flex" w={100} justifyContent="space-between">
      <Box as="h5" mb={1}>
        Lorem ipsum dolor
      </Box>
      <Box as="small" color="secondary">
        sit amet
      </Box>
    </Box>
    <Box as="p" mb={1}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a ultrices
      velit.
    </Box>
    <Box as="small" color="secondary">
      Fusce a ultrices velit.
    </Box>
  </>
);

export const CustomContent = () => {
  return (
    <List>
      <ListItem active>
        <Box d="flex" w={100} justifyContent="space-between">
          <Box as="h5" mb={1}>
            Lorem ipsum dolor
          </Box>
          <small>sit amet</small>
        </Box>
        <Box as="p" mb={1}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce a
          ultrices velit.
        </Box>
        <small>Fusce a ultrices velit.</small>
      </ListItem>
      <ListItem>{content}</ListItem>
      <ListItem>{content}</ListItem>
    </List>
  );
};

export const Disabled = () => {
  return (
    <List>
      <ListItem disabled>An item</ListItem>
      <ListItem>A second item</ListItem>
      <ListItem>A third item</ListItem>
      <ListItem>A fourth item</ListItem>
      <ListItem>And a fifth one</ListItem>
    </List>
  );
};

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
  return classNames(
    "command-palette-list-item block grow text-justify gap-2.5 py-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-1 focus:ring-slate-300 focus:outline-none flex items-center justify-between",
    selected && !disabled
      ? "bg-slate-200/50 dark:bg-slate-800"
      : "bg-transparent",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer",
  );
}

export const Flush = () => {
  return (
    <Box flexDirection="column" gap={4}>
      <List>
        <ListItem>An item</ListItem>
        <ListItem>A second item</ListItem>
        <ListItem>A third item</ListItem>
        <ListItem>A fourth item</ListItem>
        <ListItem>And a fifth one</ListItem>
      </List>
      <MuiCard
        className="w-96"
        color="blue"
        variant="filled"
        raised
        sx={{ mt: 4, ml: 2 }}
        elevation={3}
      >
        <MuiList
          className="text-item"
          hover
          itemStyle={{
            hover: "bg-header-med-hover hover:text-item hover:text-opacity-90",
            disabled: "",
            className: "px-3 py-2",
          }}
        >
          <MuiListItem as="a" href="#" hover>
            <ListItemPrefix>
              <MaterialIcon icon="inbox" />
            </ListItemPrefix>
            Inbox
            <ListItemSuffix>
              <MuiChip
                label="14"
                variant="ghost"
                size="sm"
                className="rounded-full"
              />
            </ListItemSuffix>
          </MuiListItem>
          <ListItemButton ripple>
            <ListItemPrefix>
              <MaterialIcon icon="home" />
            </ListItemPrefix>
            Spam
            <ListItemSuffix>
              <MuiChip
                label="2"
                variant="ghost"
                size="sm"
                className="rounded-full"
              />
            </ListItemSuffix>
          </ListItemButton>
          <MuiListItem as="a" href="#" disabled>
            <ListItemPrefix>
              <MaterialIcon icon="settings" />
            </ListItemPrefix>
            Trash
            <ListItemSuffix>
              <MuiChip
                label="40"
                variant="ghost"
                size="sm"
                className="rounded-full"
              />
            </ListItemSuffix>
          </MuiListItem>
        </MuiList>
      </MuiCard>
    </Box>
  );
};

export const FolderList = () => {
  return (
    <List>
      {[BiArchive, BiCardImage, BiBank].map((icon, i) => (
        <ListItem key={i}>
          <Box d="flex" items="center">
            <Box
              me={2}
              p={2}
              bg="secondary"
              color="white"
              rounded="full"
              d="flex"
              items="center"
              justify="center"
            >
              <Icon as={icon} />
            </Box>
            <Box>
              <Box as="p" mb={0}>
                Lorem ipsum
              </Box>
              <Box as="small" color="secondary">
                et al dolor el
              </Box>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export const Numbered = () => {
  return (
    <List>
      <ListItem>An item</ListItem>
      <ListItem>A second item</ListItem>
      <ListItem>A third item</ListItem>
      <ListItem>A fourth item</ListItem>
      <ListItem>And a fifth one</ListItem>
    </List>
  );
};

function ListItemIcon({ icon }: { icon: IconProps["as"] }) {
  return (
    <Box as="span" d="inline-block" me={2}>
      <Icon as={icon} />
    </Box>
  );
}

const NestedListRoot = styled(List)({
  paddingLeft: 16,
});

const NestedList = forwardRef<HTMLElement, ListProps>(
  ({ children, ...props }, ref) => {
    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

    function open(item: string) {
      setActiveMenuItem(item);
    }

    function close() {
      setActiveMenuItem(null);
    }

    return (
      <NestedListRoot ref={ref} {...props}>
        {React.Children.map(children, (item) => {
          if (item && (item as ReactElement).type === NestedListItem) {
            return React.cloneElement(item as ReactElement, {
              isOpen: activeMenuItem === (item as ReactElement).props.title,
              onOpen: open,
              onClose: close,
            });
          }
          return item;
        })}
      </NestedListRoot>
    );
  },
);

function NestedListItem({
  children,
  title,
  icon,
  isOpen,
  onOpen,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  icon?: IconProps["as"];
  isOpen?: boolean;
  onOpen?: (title: string) => void;
  onClose?: () => void;
}) {
  const toggle = function () {
    if (isOpen) {
      onClose && onClose();
    } else {
      onOpen && onOpen(title);
    }
  };

  return (
    <ListItem
      startIcon={icon && <ListItemIcon icon={icon} />}
      endIcon={<Icon as={isOpen ? BiChevronUp : BiChevronDown} />}
      title={title}
    >
      <Collapse open={isOpen}>{children}</Collapse>
    </ListItem>
  );
}

export const Nested = () => {
  return (
    <NestedList className="border rounded">
      <ListItem>
        <ListItemIcon icon={BiSendFill} />
        Sent mail
      </ListItem>
      <ListItem>
        <ListItemIcon icon={BiMailBox} />
        Drafts
      </ListItem>
      <NestedListItem title="Inbox" icon={BiInboxFill}>
        <NestedList>
          <ListItem>Primary</ListItem>
          <NestedListItem title="Social">
            <List>
              <ListItem>Facebook</ListItem>
              <ListItem>Twitter</ListItem>
              <ListItem>Linkedin</ListItem>
            </List>
          </NestedListItem>
          <ListItem>Promotions</ListItem>
          <NestedListItem title="Updates">
            <List>
              <ListItem>Github</ListItem>
              <ListItem>Redmine</ListItem>
            </List>
          </NestedListItem>
          <ListItem>Forums</ListItem>
        </NestedList>
      </NestedListItem>
      <NestedListItem title="Outbox" icon={BiSendCheckFill}>
        <NestedList flush>
          <ListItem>Primary</ListItem>
          <NestedListItem title="Social">
            <List flush>
              <ListItem>Facebook</ListItem>
              <ListItem>Twitter</ListItem>
              <ListItem>Linkedin</ListItem>
            </List>
          </NestedListItem>
          <ListItem>Promotions</ListItem>
          <NestedListItem title="Updates">
            <List flush>
              <ListItem>Github</ListItem>
              <ListItem>Redmine</ListItem>
            </List>
          </NestedListItem>
          <ListItem>Forums</ListItem>
        </NestedList>
      </NestedListItem>
    </NestedList>
  );
};

export function SelectedListItem() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <Panel className="bg-blue w-full min-h-full py-6">
      <Box
        sx={{
          mr: "auto",
          ml: "auto",
          mt: "auto",
          width: "100%",
          maxWidth: 360,
          bgcolor: "background.paper",
        }}
      >
        <List
          component="nav"
          aria-label="main mailbox folders"
          itemStyle={{
            className: "px-2",
            selected: "bg-blue-600/5",
          }}
          prefix="text-xl"
          select
        >
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick(event, 0)}
          >
            <MuxListItemIcon>
              <MaterialIcon icon="inbox" />
            </MuxListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemButton>
          <ListItemButton
            selected={selectedIndex === 1}
            onClick={(event) => handleListItemClick(event, 1)}
          >
            <MuxListItemIcon>
              <MaterialIcon icon="drafts" />
            </MuxListItemIcon>
            <ListItemText primary="Drafts" />
          </ListItemButton>
        </List>
        <Divider />
        <List
          component="nav"
          aria-label="secondary mailbox folder"
          itemStyle={{
            className: "px-2",
            selected: "bg-blue-400/15",
          }}
          select
        >
          <ListItemButton
            selected={selectedIndex === 2}
            onClick={(event) => handleListItemClick(event, 2)}
          >
            <ListItemText primary="Trash" />
          </ListItemButton>
          <ListItemButton
            selected={selectedIndex === 3}
            onClick={(event) => handleListItemClick(event, 3)}
          >
            <ListItemText primary="Spam" />
          </ListItemButton>
        </List>
      </Box>
    </Panel>
  );
}


export function AlignItemsList() {
  return (
    <Panel className="bg-hd-md w-full min-h-full h-full py-6 m-auto px-10">
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <ListItem className="items-start">
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Brunch this weekend?"
          secondary={
            <React.Fragment>
              <Text
                component="span"
                variant="body2"
                sx={{ color: 'text.primary', display: 'inline' }}
              >
                Ali Connors
              </Text>
              {" — I'll be in your neighborhood doing errands this…"}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem className="items-start">
        <ListItemAvatar>
          <Avatar alt="Travis Howard" src="https://mui.com/static/images/avatar/2.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Summer BBQ"
          secondary={
            <React.Fragment>
              <Text
                component="span"
                variant="body2"
                sx={{ color: 'text.primary', display: 'inline' }}
              >
                to Scott, Alex, Jennifer
              </Text>
              {" — Wish I could come, but I'm out of town this…"}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem className="items-start">
        <ListItemAvatar>
          <Avatar alt="Cindy Baker" src="https://mui.com/static/images/avatar/3.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Oui Oui"
          secondary={
            <React.Fragment>
              <Text
                component="span"
                variant="body2"
                sx={{ color: 'text.primary', display: 'inline' }}
              >
                Sandra Adams
              </Text>
              {' — Do you have Paris recommendations? Have you ever…'}
            </React.Fragment>
          }
        />
      </ListItem>
    </List>
    </Panel>
  );
}
export function LetterAvatars() {
  return (
    <Panel className="bg-hd-md w-full min-h-full h-full py-10 m-auto px-10">
      <Stack gap={2}>
        <Avatar>H</Avatar>
        <Avatar color="pink">N</Avatar>
        <Avatar color="purple">OP</Avatar>
      </Stack>
    </Panel>
  );
}
export default config;
