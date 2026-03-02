import { Flex, Box, type BoxProps, type FlexProps } from "@funext/ui";
import { useLayoutContext } from "~/context";

export function Container({ children, ...props }: FlexProps) {
 //const layout = useLayoutContext()
  return (
    <Box width="100%" {...props}>
      <Flex direction="column" gap={4} className="pb-4" flexGrow>
        {children}
      </Flex>
    </Box>
  );
}
