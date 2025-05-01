import React, { useEffect, useMemo, useState } from 'react'
import {styled, memoTheme, SxThemeProps,Theme, StyledComponent, clsx} from '../../styles'
import TreeFile from './tree-file'
import Expand from '../shared/expand'
import TreeIndents from './tree-indents'
import { useTreeContext } from './tree-context'
import TreeFolderIcon from './tree-folder-icon'
import TreeStatusIcon from './tree-status-icon'
import { sortChildren, makeChildPath, stopPropagation } from './tree-help'
import { css } from '@emotion/react'
import Collapse from '../Collapse'

interface Props {
  name: string
  extra?: string
  parentPath?: string
  level?: number
  className?: string
}

const defaultProps = {
  level: 0,
  className: '',
  parentPath: '',
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeFolderProps = Props & NativeAttrs & SxThemeProps

const baseTreeFileStyle = ({level, theme}:TreeFolderProps & {theme: Theme}) =>
  css`
    &.folder {
      cursor: pointer;
      line-height: 1;
      user-select: none;
    }
    &.file {
      cursor: pointer;
      line-height: 1;
      user-select: none;
      margin-left: calc(1.875rem * ${level});
    }

    & .names {
      display: flex;
      height: 1.75rem;
      align-items: center;
      position: relative;
    }

    & .names > .indent {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 100%;
      background-color: ${theme.palette.divider};
      margin-left: -1px;
    }

    & .status {
      position: absolute;
      left: calc(-1.125rem);
      top: 50%;
      transform: translate(-50%, -50%);
      width: 0.875rem;
      height: 0.875rem;
      z-index: 10;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    & .icon {
      width: 1.5rem;
      height: 100%;
      display: inline-flex;
      align-items: center;
      margin-right: 0.5rem;
    }

    & .name {
      transition: opacity 100ms ease 0ms;
      white-space: nowrap;
      font-size: 0.875rem;
      &:hover {
        opacity: 0.7;
      }
    }

    & .extra {
      font-size: 0.75rem;
      align-self: baseline;
      padding-left: 4px;
      color: ${theme.palette.divider};
    }

    & .content {
      display: flex;
      flex-direction: column;
      height: auto;
    }
  `

const StyledTreeFolder = styled('div')(
  baseTreeFileStyle
) as StyledComponent<TreeFolderProps>;;

const TreeFolder: React.FC<TreeFolderProps> = (
  props: TreeFolderProps) => {

  const {
      name,
      children,
      parentPath,
      level: parentLevel = 0,
      extra,
      className,
      ...rest
    } = props;

  const { initialExpand, isImperative } = useTreeContext()
  const [expanded, setExpanded] = useState<boolean>(initialExpand)
  useEffect(() => setExpanded(initialExpand), [])

  const currentPath = useMemo(() => makeChildPath(name, parentPath), [])
  const clickHandler = () => setExpanded(!expanded)

  const nextChildren = React.cloneElement(
    children as any,
    {
      parentPath: currentPath,
      level: parentLevel + 1,
    }
  )

  const sortedChildren = isImperative
    ? nextChildren
    : sortChildren(nextChildren, TreeFolder)

  return (
    <StyledTreeFolder {...props} className={clsx('folder', className)} onClick={clickHandler}>
      <div className="names">
        <TreeIndents count={parentLevel} />
        <span className="status">
          <TreeStatusIcon active={expanded} />
        </span>
        <span className="icon">
          <TreeFolderIcon />
        </span>
        <span className="name">
          {name}
          {extra && <span className="extra">{extra}</span>}
        </span>
      </div>
      <Collapse open={expanded} timeout={200}>
        <div className="content" onClick={stopPropagation}>
          {sortedChildren}
        </div>
      </Collapse>
    </StyledTreeFolder>
  )
}

TreeFolder.defaultProps = defaultProps
TreeFolder.displayName = 'GeistTreeFolder'
export default TreeFolder
