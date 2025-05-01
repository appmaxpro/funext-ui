import {
  ReactNode,
  Dispatch,
  MouseEventHandler,
  ReactElement,
  ComponentType,
} from 'react'
import { StylesObj as MaskStylesObj } from './mask';
import {StylesObj as PopoverStylesObj} from './components/styles';

import { RectResult } from './utils'
import { PopoverSlotProps, PopoverSlotsType } from './components'
import { StylesObj } from './styles'
import { PopoverProps } from '../Popover'
import { Position, PositionProps } from './components/Popover';
import { BadgeProps } from '../Badge'
import { IconButtonProps } from '../IconButton'
import { PanelProps } from '../Panel';

type SharedProps = KeyboardHandler & {
  steps: StepType[]
  styles?: StylesObj & MaskStylesObj & PopoverStylesObj;
  padding?: Padding
  position?: Position
  disableInteraction?:
    | boolean
    | ((
        clickProps: Pick<ClickProps, 'currentStep' | 'steps' | 'meta'>
      ) => boolean)
  disableFocusLock?: boolean
  disableDotsNavigation?: boolean
  disableKeyboardNavigation?: boolean | KeyboardParts[]
  className?: string
  maskClassName?: string
  highlightedMaskClassName?: string
  maskId?: string
  clipId?: string
  nextButton?: (props: BtnFnProps) => ReactNode | null
  prevButton?: (props: BtnFnProps) => ReactNode | null
  afterOpen?: (target: Element | null) => void
  beforeClose?: (target: Element | null) => void
  onClickMask?: (clickProps: ClickProps) => void
  onCloseClick?: (clickProps: ClickProps) => void
  onClickHighlighted?: (e: MouseEvent, clickProps: ClickProps) => void
  //  MouseEventHandler<SVGRectElement>
  badgeContent?: (badgeProps: BadgeStepProps) => any
  showNavigation?: boolean
  showPrevNextButtons?: boolean
  showCloseButton?: boolean
  showBadge?: boolean
  showDots?: boolean
  scrollSmooth?: boolean
  inViewThreshold?: number | { x?: number; y?: number }
  accessibilityOptions?: A11yOptions
  rtl?: boolean;
  Slots?: PopoverSlotsType;
  slotProps?: PopoverSlotProps;
  ContentComponent?: ComponentType<PopoverContentProps>
  Wrapper?: ComponentType
}

export type PopoverContentProps = Partial<PanelProps> & {
  styles?: StylesObj & MaskStylesObj;
  badgeProps?: BadgeProps;
  closeProps?: IconButtonProps;
  badgeContent?: (badgeProps: BadgeStepProps) => any
  Slots?: PopoverSlotsType;
  slotProps?: PopoverSlotProps;
  accessibilityOptions?: A11yOptions
  disabledActions?: boolean
  onCloseClick?: (clickProps: ClickProps) => void
  setCurrentStep: Dispatch<React.SetStateAction<number>>
  currentStep: number
  transition?: boolean
  isHighlightingObserved?: boolean
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
  steps: StepType[]
  setSteps?: Dispatch<React.SetStateAction<StepType[]>>
  showNavigation?: boolean
  showPrevNextButtons?: boolean
  showCloseButton?: boolean
  showBadge?: boolean
  showDots?: boolean
  nextButton?: (props: BtnFnProps) => ReactNode | null
  prevButton?: (props: BtnFnProps) => ReactNode | null
  disableDotsNavigation?: boolean
  rtl?: boolean
  meta?: string
  setMeta?: Dispatch<React.SetStateAction<string>>
}

type A11yOptions = {
  ariaLabelledBy?: string
  closeButtonAriaLabel: string
  showNavigationScreenReaders: boolean
}

type ComponentPadding = number | number[]
export type Padding =
  | number
  | {
      mask?: ComponentPadding
      popover?: ComponentPadding
      wrapper?: ComponentPadding
    }

export type KeyboardParts = 'esc' | 'left' | 'right'

export type ClickProps = {
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
  setCurrentStep: Dispatch<React.SetStateAction<number>>
  currentStep: number
  steps?: StepType[]
  setSteps?: Dispatch<React.SetStateAction<StepType[]>>
  meta?: string
  setMeta?: Dispatch<React.SetStateAction<string>>
}

export type KeyboardHandler = {
  keyboardHandler?: (
    e: KeyboardEvent,
    clickProps?: ClickProps,
    status?: {
      isEscDisabled?: boolean
      isRightDisabled?: boolean
      isLeftDisabled?: boolean
    }
  ) => void
}

export type TourProps = SharedProps &
  ClickProps & {
    isOpen: boolean
    disabledActions: boolean
    disableWhenSelectorFalsy?: boolean
    setDisabledActions: Dispatch<React.SetStateAction<boolean>>
    onTransition?: (
      positionsProps: PositionProps,
      prev: RectResult
    ) => Position
  }

type BadgeStepProps = {
  totalSteps: number
  currentStep: number
  transition?: boolean
}

export type ProviderProps = SharedProps & {
  children: React.ReactNode
  defaultOpen?: boolean
  startAt?: number
  setCurrentStep?: Dispatch<React.SetStateAction<number>>
  currentStep?: number
  meta?: string
  setMeta?: Dispatch<React.SetStateAction<string>>
}

export type ContentProps = {
  setCurrentStep: Dispatch<React.SetStateAction<number>>
  transition: boolean
  currentStep: number
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
}

export type StepType = {
  selector: string | Element
  content: ReactElement | string | ((props: PopoverContentProps) => void)
  position?: Position;
  popoverProps?: PopoverProps;
  highlightedSelectors?: string[]
  mutationObservables?: string[]
  resizeObservables?: string[]
  navDotAriaLabel?: string
  stepInteraction?: boolean
  action?: (elem: Element | null) => void
  actionAfter?: (elem: Element | null) => void
  disableActions?: boolean
  padding?: Padding
  bypassElem?: boolean
  styles?: StylesObj & MaskStylesObj & PopoverStylesObj
}

export type BtnFnProps = {
  Button: React.FC<React.PropsWithChildren<NavButtonProps>>
  setCurrentStep: Dispatch<React.SetStateAction<number>>
  stepsLength: number
  currentStep: number
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
  steps?: StepType[]
}

export type NavButtonProps = {
  onClick?: () => void;
  kind?: 'next' | 'prev';
  hideArrow?: boolean;
  className?: string;
}
export type { StylesObj }