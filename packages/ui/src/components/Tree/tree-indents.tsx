import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

interface Props {
  count: number
}

const StyledIndent = styled.span`
  ${({index}:{index:number}) => css`
    left: calc(-1.875rem * ${index + 1} + 0.75rem);
`}
`

const TreeIndents: React.FC<Props> = ({ count }) => {
  if (count === 0) return null
  return (
    /* eslint-disable react/jsx-no-useless-fragment */
    <>
      {[...new Array(count)].map((_, index) => (
        <StyledIndent className="indent" key={`indent-${index}`} index={index}/>
      ))}
    </>
    /* eslint-enable */
  )
}

export default TreeIndents
