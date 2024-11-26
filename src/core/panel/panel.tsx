import { forwardRef, useCallback, useEffect, useState } from "react";

import { clsx } from "../clsx";
import { Collapse } from "../collapse";
import { CommandBar, CommandBarProps, CommandItemProps } from "../command-bar";
import { Scrollable } from "../scrollable";

import styles from "./panel.module.scss";
import { useDialogContext } from "../../mui";
import { size } from "@floating-ui/react";

export interface ToolPanelProps extends React.HTMLProps<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  toolbar?: CommandBarProps;
  scrollbar?: {
    custom?: boolean;
    trigger?: {
      headerShadow?: number;
      headerHide?: number;
    };
  };
  collapsible?: boolean;
  collapsed?: boolean;
  noFrame?: boolean;
  setCollapsed?: (collapsed?: boolean | ((prev?: boolean) => boolean)) => void;
  onToggle?: (collapsed: boolean) => void;
}

export const ToolPanel = forwardRef<HTMLDivElement, ToolPanelProps>((props, ref) => {
  const {
    className, 
    children, 
    scrollbar = {},
    header,
    footer,
    toolbar,
    collapsible = false,
    collapsed = false,
    setCollapsed,
    onToggle,
    noFrame,
    ...restProps
  } = props;

  const dialogCtx = useDialogContext();
  
  const hasHeader = Boolean(header || toolbar || collapsible);
  const hasFooter = Boolean(footer);

  //console.log("hasHeader:", header, "has toolbar:", toolbar, "has collapsible:", collapsible)

  const [collapseState, setCollapseState] = useState(
    collapsed ? "exited" : "entered",
  );

  const handleToggle = useCallback(
    () => setCollapsed?.((prev) => !prev),
    [setCollapsed],
  );

  const onEnter = useCallback(() => setCollapseState("enter"), []);
  const onEntering = useCallback(() => setCollapseState("entering"), []);
  const onEntered = useCallback(() => {
    setCollapseState("entered");
    onToggle?.(false);
  }, [onToggle]);

  const onExit = useCallback(() => setCollapseState("exit"), []);
  const onExiting = useCallback(() => setCollapseState("exiting"), []);
  const onExited = useCallback(() => {
    setCollapseState("exited");
    onToggle?.(true);
  }, [onToggle]);

  const [headerShadow, setHeaderShadow] = useState(false);
  const [headerHide, setHeaderHide] = useState(false);

  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    (e) => {
      const st = e.currentTarget.scrollTop;
      const trigger = scrollbar.trigger ?? {};
      if (trigger.headerHide !== undefined) {
        setHeaderHide(st > trigger.headerHide);
      }
      if (trigger.headerShadow !== undefined) {
        setHeaderShadow(st > trigger.headerShadow);
      }
    },
    [scrollbar.trigger],
  );

  const actualToolbarItems = collapsible 
      ? [
        ...(toolbar?.items ?? []),
        {
          key: "toggle",
          className: styles.toggle,
          iconProps: {
            icon: "keyboard_arrow_down",
          },
          size: "sm",
          onClick: handleToggle,
        }]
      : null;

  const actualToolbar = actualToolbarItems
      ? {...toolbar, items: actualToolbarItems} as CommandBarProps 
      : toolbar;

  const ContentPane = scrollbar?.custom ? Scrollable : "div";

  const content = (
    <div className={styles.body}>
      <ContentPane className={clsx(styles.content, noFrame && styles.noFrame)} onScroll={onScroll}>
        {children}
      </ContentPane>
      {hasFooter && <div className={styles.footer}>{footer}</div>}
    </div>
  );

  const body = collapsible ? (
    <Collapse
      in={!collapsed}
      onEnter={onEnter}
      onEntering={onEntering}
      onEntered={onEntered}
      onExit={onExit}
      onExiting={onExiting}
      onExited={onExited}
      className={styles.bodyWrapper}
    >
      {content}
    </Collapse>
  ) : (
    <div className={styles.bodyWrapper}>{content}</div>
  );

  return (
    <div
      ref={ref}
      className={clsx(styles.panel, dialogCtx && styles['in-dialog'], className, styles[collapseState])}
      {...restProps}
    >
      {hasHeader && (
        <Header
          toolbar={actualToolbar}
          collapsible={collapsible}
          handleToggle={handleToggle}
          header={header}
          className={clsx({
            [styles.hide]: headerHide,
            [styles.shadow]: headerShadow,
          })}
        />
      )}
      {body}
    </div>
  );
});

function Header(props: ToolPanelProps & { handleToggle?: () => void }) {
  const { header, toolbar, className, children, collapsible, handleToggle } =
    props;
  return (
    <div className={clsx(styles.header, className)}>
      <div className={styles.headerInner}>
        {header && (
          <div
            {...(collapsible &&
              handleToggle && {
                onClick: handleToggle,
              })}
            className={clsx(styles.title, {
              [styles.collapse]: collapsible,
            })}
          >
            {header}
          </div>
        )}
        {toolbar && (
          <div className={clsx(styles.toolbar, 'ms-auto')}>
            <CommandBar {...toolbar} />
          </div>
        )}
        {children && <div className={styles.toolbar}>{children}</div>}
      </div>
    </div>
  );
}
