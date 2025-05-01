import React, { useMemo } from 'react'
import {styled, memoTheme, SxThemeProps,Theme, StyledComponent} from '../../styles'
import TreeFileIcon from './tree-file-icon'
import { useTreeContext } from './tree-context'
import TreeIndents from './tree-indents'
import { makeChildPath, stopPropagation } from './tree-help'
import useClasses from '../use-classes'
import { css } from '@emotion/react'





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
export type TreeFileProps = Props & NativeAttrs & SxThemeProps;


const baseTreeFileStyle = ({level, theme}:TreeFileProps & {theme: Theme}) =>
  css`
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
  `

const StyledTreeFile = styled('div')(
  baseTreeFileStyle
) as StyledComponent<React.PropsWithChildren<TreeFileProps>>;



const TreeFile: React.FC<React.PropsWithChildren<TreeFileProps>> = ({
  name,
  parentPath,
  level,
  extra,
  className,
  ...props
}: React.PropsWithChildren<TreeFileProps> & typeof defaultProps) => {
  const { onFileClick } = useTreeContext()
  const currentPath = useMemo(() => makeChildPath(name, parentPath), [])
  const clickHandler = (event: React.MouseEvent) => {
    stopPropagation(event)
    onFileClick && onFileClick(currentPath)
  }

  return (
    <div className={useClasses('file', className)} onClick={clickHandler} {...props}>
      <div className="names">
        <TreeIndents count={level} />
        <span className="icon">
          <TreeFileIcon />
        </span>
        <span className="name">
          {name}
          {extra && <span className="extra">{extra}</span>}
        </span>
      </div>
    </div>
  )
}

TreeFile.defaultProps = defaultProps
TreeFile.displayName = 'GeistTreeFile'
export default TreeFile
