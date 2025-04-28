// @ts-nocheck
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  FloatingEvents,
  offset,
  safePolygon,

  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTransitionStyles,
  useTypeahead,

} from '@floating-ui/react';
import {clsx} from '../clsx';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {ComponentProps} from '../../mui';
import {isRTL} from '../../mui/utils';
import { MaterialIcon } from "../../icons/material-icon";
import { Button } from '../button';
//import {MenuItem} from './MenuItem';

export const MenuComponent = forwardRef<HTMLElement, ComponentProps>(function Menu(
  {children, label, ...props},
  forwardedRef,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number|null>(null);
  const [allowHover, setAllowHover] = useState(false);
  const [hasFocusInside, setHasFocusInside] = useState(false);

  const listItemsRef = useRef<Array<any|null>>([]);
  const listContentRef = useRef<Array<any>>([]);

  useEffect(() => {
    const strings:Array<any> = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        strings.push(
          child.props.label && !child.props.disabled
            ? child.props.label
            : null,
        );
      }
    });
    listContentRef.current = strings;
  });

  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const isNested = parentId != null;

  const {refs, floatingStyles, context} = useFloating({
    nodeId,
    transform: false,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? 'right-start' : 'bottom-start',
    middleware: [
      offset({
        mainAxis: isNested ? 0 : 4,
        alignmentAxis: isNested ? -4 : 0,
      }),
      flip(),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: isNested && allowHover,
    delay: {open: 75},
    handleClose: safePolygon({
      blockPointerEvents: true,
    }),
  });
  const click = useClick(context, {
    event: 'mousedown',
    toggle: !isNested || !allowHover,
    ignoreMouse: isNested,
  });
  const role = useRole(context, {role: 'menu'});
  const dismiss = useDismiss(context, {bubbles: true});
  const listNavigation = useListNavigation(context, {
    listRef: listItemsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    enabled: isOpen,
    listRef: listContentRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  });

  const {getReferenceProps, getFloatingProps, getItemProps} =
    useInteractions([
      hover,
      click,
      role,
      dismiss,
      listNavigation,
      typeahead,
    ]);

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere
  // in the tree.
  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      setIsOpen(false);
    }

    function onSubMenuOpen(event:any) {
      if (
        event.nodeId !== nodeId &&
        event.parentId === parentId
      ) {
        setIsOpen(false);
      }
    }

    tree.events.on('click', handleTreeClick);
    tree.events.on('menuopen', onSubMenuOpen);

    return () => {
      tree.events.off('click', handleTreeClick);
      tree.events.off('menuopen', onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit('menuopen', {parentId, nodeId});
    }
  }, [tree, isOpen, nodeId, parentId]);

  // Determine if "hover" logic can run based on the modality of input. This
  // prevents unwanted focus synchronization as menus open and close with
  // keyboard navigation and the cursor is resting on the menu.
  useEffect(() => {
    function onPointerMove({pointerType}:PointerEvent) {
      if (pointerType !== 'touch') {
        setAllowHover(true);
      }
    }

    function onKeyDown() {
      setAllowHover(false);
    }

    window.addEventListener('pointermove', onPointerMove, {
      once: true,
      capture: true,
    });
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('pointermove', onPointerMove, {
        capture: true,
      });
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [allowHover]);

  const {isMounted, styles} = useTransitionStyles(context, {
    duration: {open: 100},
  });

  const referenceRef = useMergeRefs([
    refs.setReference,
    forwardedRef,
  ]);

  //@ts-expect-error no thing
  const referenceProps = getReferenceProps({
    ...props,
    onFocus(event:any) {
      props.onFocus?.(event);
      setHasFocusInside(false);
    },
    onClick(event) {
      event.stopPropagation();
    },
    ...(isNested && {
      // Indicates this is a nested <Menu /> acting as a <MenuItem />.
      role: 'menuitem',
    }),
  });

  return (
    <FloatingNode id={nodeId}>
      <Button
        ref={referenceRef}
        data-open={isOpen ? '' : undefined}
        {...referenceProps}
        variant="text"
        className={clsx(
          'flex cursor-default items-center justify-between gap-4 rounded py-2 px-3 text-left',
          {
            'transition-colors hover:bg-gray-100/50 data-[open]:bg-gray-100/50 dark:hover:bg-gray-600 dark:data-[open]:bg-gray-600':
              !isNested,
            'outline-none focus:bg-blue-500 focus:text-white':
              isNested,
            'bg-blue-500 text-white':
              isOpen && isNested && !hasFocusInside,
            'rounded bg-gray-500/20 dark:bg-gray-700':
              isNested && isOpen && hasFocusInside,
          },
        )}
      >
        {label}{' '}
        {isNested && (
          <span aria-hidden className="ml-4">
            <MaterialIcon fontSize={16}
            icon={
              !isRTL(refs.floating.current) 
              ? 'chevron_right' : 'chevron_left'} />
          </span>
        )}
      </Button>
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            // Prevent outside content interference.
            modal={false}
            // Only initially focus the root floating menu.
            initialFocus={isNested ? -1 : 0}
            // Only return focus to the root menu's reference when menus close.
            returnFocus={!isNested}
          >
            <div
              ref={refs.setFloating}
              className="flex flex-col rounded border border-slate-900/10 bg-white/80 bg-clip-padding p-1 shadow-lg outline-none backdrop-blur-lg dark:bg-gray-600/80"
              style={{
                ...floatingStyles,
                width: 'max-content',
                ...styles,
              }}
              {...getFloatingProps()}
            >
              {Children.map(
                children,
                (child, index) =>
                  isValidElement(child) &&
                  cloneElement(
                    child,
                    getItemProps({
                      tabIndex: activeIndex === index ? 0 : -1,
                      ref(node) {
                        listItemsRef.current[index] = node;
                      },
                      onClick(event) {
                        child.props.onClick?.(event);
                        tree?.events.emit('click');
                      },
                      onFocus(event) {
                        child.props.onFocus?.(event);
                        setHasFocusInside(true);
                      },
                      // Allow focus synchronization if the cursor did not move.
                      onMouseEnter() {
                        if (allowHover && isOpen) {
                          setActiveIndex(index);
                        }
                      },
                    }),
                  ),
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
});

export const Menu = forwardRef<HTMLElement, ComponentProps>(function MenuWrapper(props, ref) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuComponent {...props} ref={ref} />
      </FloatingTree>
    );
  }

  return <MenuComponent {...props} ref={ref} />;
});