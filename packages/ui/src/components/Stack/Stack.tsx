import { styled } from "../../styles";
import Box, { BoxProps } from "../Box";

export interface StackProps extends BoxProps{
  horizontal?: boolean;
}

export const Stack = styled(Box, {
  name: 'MuxStack',
  
  shouldForwardProp: (prop:any) => prop !== 'horizontal'
})<StackProps>(
  ({ horizontal }) => [
    {
      'flexDirection': !horizontal ? 'column' : 'row',
    },
  ],
  () => ({
    display: "flex",
  }),
);
